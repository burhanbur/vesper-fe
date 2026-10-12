import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createAccount,
  fetchAccounts,
  fetchAccountTypes,
} from '@/features/accounts/api/account-api'
import type { AccountDto } from '@/features/accounts/types/account'
import {
  createCategory,
  fetchCategories,
} from '@/features/categories/api/category-api'
import type { CategoryDto } from '@/features/categories/types/category'
import {
  createTransaction,
  createTransfer,
} from '@/features/transactions/api/transaction-api'
import type { ImportProgress, MoneyManagerRecord } from '../types/money-manager'

interface ExecuteImportParams {
  records: MoneyManagerRecord[]
  accountMappings: Record<string, string> // MM Account Name -> Vesper Account ID or 'NEW'
  categoryMappings: Record<string, string> // MM Category Name -> Vesper Category ID or 'NEW'
}

export function useMoneyManagerImport() {
  const queryClient = useQueryClient()
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    currentStatus: '',
    successCount: 0,
    errorCount: 0,
    accountsCreated: 0,
    categoriesCreated: 0,
    errors: [],
  })

  async function executeImport({
    records,
    accountMappings,
    categoryMappings,
  }: ExecuteImportParams): Promise<ImportProgress> {
    setIsImporting(true)

    const initialProgress: ImportProgress = {
      current: 0,
      total: records.length,
      percentage: 0,
      currentStatus: 'Menyiapkan pemetaan akun dan kategori...',
      successCount: 0,
      errorCount: 0,
      accountsCreated: 0,
      categoriesCreated: 0,
      errors: [],
    }
    setProgress(initialProgress)

    try {
      // 1. Fetch current accounts and account types
      const [existingAccounts, accountTypes, existingCategories] =
        await Promise.all([
          fetchAccounts({ limit: 100 }),
          fetchAccountTypes(),
          fetchCategories(),
        ])

      const defaultTypeId =
        accountTypes.find((t) => t.category === 'CASH')?.id ||
        accountTypes[0]?.id ||
        ''

      const accountMapByName = new Map<string, AccountDto>(
        existingAccounts.map((a) => [a.name.toLowerCase().trim(), a]),
      )
      const resolvedAccountIdMap = new Map<string, string>()

      // Resolve / Create Accounts
      let accountsCreated = 0
      for (const mmAccount of Object.keys(accountMappings)) {
        const targetId = accountMappings[mmAccount]

        if (targetId && targetId !== 'NEW') {
          resolvedAccountIdMap.set(mmAccount, targetId)
        } else {
          // Check if already exists in Vesper
          const existing = accountMapByName.get(mmAccount.toLowerCase().trim())
          if (existing) {
            resolvedAccountIdMap.set(mmAccount, existing.id)
          } else {
            // Create new Account in Vesper
            setProgress((p) => ({
              ...p,
              currentStatus: `Membuat akun baru: ${mmAccount}...`,
            }))
            const created = await createAccount({
              name: mmAccount,
              account_type_id: defaultTypeId,
              currency: 'IDR',
              icon: mmAccount.toLowerCase().includes('bank')
                ? 'bank'
                : 'wallet',
            })
            resolvedAccountIdMap.set(mmAccount, created.id)
            accountMapByName.set(mmAccount.toLowerCase().trim(), created)
            accountsCreated++
          }
        }
      }

      // Resolve / Create Categories
      let categoriesCreated = 0
      const categoryMapByName = new Map<string, CategoryDto>(
        existingCategories.map((c) => [c.name.toLowerCase().trim(), c]),
      )
      const resolvedCategoryIdMap = new Map<string, string>()

      for (const mmCategory of Object.keys(categoryMappings)) {
        const targetId = categoryMappings[mmCategory]

        if (targetId && targetId !== 'NEW') {
          resolvedCategoryIdMap.set(mmCategory, targetId)
        } else {
          const existing = categoryMapByName.get(
            mmCategory.toLowerCase().trim(),
          )
          if (existing) {
            resolvedCategoryIdMap.set(mmCategory, existing.id)
          } else {
            // Determine type from record samples
            const sampleRecord = records.find(
              (r) => r.categoryName === mmCategory,
            )
            const catType =
              sampleRecord?.type === 'INCOME' ? 'INCOME' : 'EXPENSE'

            setProgress((p) => ({
              ...p,
              currentStatus: `Membuat kategori baru: ${mmCategory} (${catType})...`,
            }))

            const created = await createCategory({
              name: mmCategory,
              type: catType,
            })
            resolvedCategoryIdMap.set(mmCategory, created.id)
            categoryMapByName.set(mmCategory.toLowerCase().trim(), created)
            categoriesCreated++
          }
        }
      }

      // Default fallback account & category
      const fallbackAccount =
        existingAccounts[0]?.id ||
        Array.from(resolvedAccountIdMap.values())[0] ||
        ''
      const fallbackCategory =
        existingCategories[0]?.id ||
        Array.from(resolvedCategoryIdMap.values())[0] ||
        ''

      // 2. Process Records in controlled chunks (concurrency 3)
      let processed = 0
      let successCount = 0
      let errorCount = 0
      const errors: ImportProgress['errors'] = []

      const chunkSize = 10
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize)

        await Promise.all(
          chunk.map(async (record) => {
            const accId =
              resolvedAccountIdMap.get(record.accountName) || fallbackAccount
            const catId =
              resolvedCategoryIdMap.get(record.categoryName) || fallbackCategory

            try {
              if (record.type === 'TRANSFER' && record.transferToAccountName) {
                const toAccId =
                  resolvedAccountIdMap.get(record.transferToAccountName) ||
                  fallbackAccount

                if (accId !== toAccId) {
                  await createTransfer({
                    from_account_id: accId,
                    to_account_id: toAccId,
                    amount: record.amountFormatted,
                    transacted_at: record.dateIso,
                    description: record.fullDescription || null,
                  })
                  successCount++
                  return
                }
              }

              // Normal Transaction (INCOME or EXPENSE)
              await createTransaction({
                account_id: accId,
                category_id: catId,
                type: record.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
                amount: record.amountFormatted,
                transacted_at: record.dateIso,
                description: record.fullDescription || null,
              })
              successCount++
            } catch (err) {
              errorCount++
              errors.push({
                index: record.rowIndex,
                description: `${record.displayDate} - ${record.fullDescription} (${record.amountFormatted})`,
                error:
                  err instanceof Error
                    ? err.message
                    : 'Gagal menyimpan transaksi',
              })
            }
          }),
        )

        processed += chunk.length
        const currentPercentage = Math.round((processed / records.length) * 100)

        setProgress((prev) => ({
          ...prev,
          current: processed,
          percentage: currentPercentage,
          currentStatus: `Mengimpor transaksi ${processed} dari ${records.length}...`,
          successCount,
          errorCount,
          accountsCreated,
          categoriesCreated,
          errors,
        }))
      }

      // Invalidate queries so dashboard and transactions show new data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ])

      const finalProgress: ImportProgress = {
        current: records.length,
        total: records.length,
        percentage: 100,
        currentStatus: 'Selesai!',
        successCount,
        errorCount,
        accountsCreated,
        categoriesCreated,
        errors,
      }
      setProgress(finalProgress)
      return finalProgress
    } finally {
      setIsImporting(false)
    }
  }

  return {
    isImporting,
    progress,
    executeImport,
    resetProgress: () =>
      setProgress({
        current: 0,
        total: 0,
        percentage: 0,
        currentStatus: '',
        successCount: 0,
        errorCount: 0,
        accountsCreated: 0,
        categoriesCreated: 0,
        errors: [],
      }),
  }
}
