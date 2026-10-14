import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createAccount,
  fetchAccounts,
  fetchAccountTypes,
} from '@/features/accounts/api/account-api'
import type { AccountDto } from '@/features/accounts/types/account'
import { authSession } from '@/features/auth'
import {
  createCategory,
  fetchCategories,
} from '@/features/categories/api/category-api'
import type { CategoryDto } from '@/features/categories/types/category'
import {
  createTransactionsBatch,
  type BatchTransactionInput,
} from '@/features/transactions/api/transaction-api'
import { ApiError } from '@/lib/api-error'
import type { ImportProgress, MoneyManagerRecord } from '../types/money-manager'
import { runImportRequest } from '../utils/import-request'
import { categoryKey } from '../utils/category-key'

interface ExecuteImportParams {
  records: MoneyManagerRecord[]
  accountMappings: Record<string, string> // MM Account Name -> Vesper Account ID or 'NEW'
  categoryMappings: Record<string, string> // Type + normalized name -> ID or 'NEW'; legacy names are validated
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
    const request = <T>(operation: () => Promise<T>) =>
      runImportRequest(operation, () => {
        setProgress((previous) => ({
          ...previous,
          currentStatus:
            'Batas request tercapai. Menunggu sebelum melanjutkan impor...',
        }))
      })

    try {
      // 1. Fetch current accounts and account types
      const [existingAccounts, accountTypes, existingCategories] =
        await Promise.all([
          request(() => fetchAccounts({ limit: 100 })),
          request(() => fetchAccountTypes()),
          request(() => fetchCategories()),
        ])

      const defaultTypeId =
        accountTypes.find((t) => t.category === 'CASH')?.id ||
        accountTypes[0]?.id ||
        ''

      const parentIds = new Set(
        existingAccounts
          .map((a) => a.parent_account_id)
          .filter((id): id is string => Boolean(id)),
      )
      const leafAccounts = existingAccounts.filter((a) => !parentIds.has(a.id))

      const accountMapByName = new Map<string, AccountDto>(
        leafAccounts.map((a) => [a.name.toLowerCase().trim(), a]),
      )
      const resolvedAccountIdMap = new Map<string, string>()
      const accountsById = new Map(
        existingAccounts.map((account) => [account.id, account]),
      )

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
            const created = await request(() =>
              createAccount({
                name: mmAccount,
                account_type_id: defaultTypeId,
                currency: 'IDR',
                icon: mmAccount.toLowerCase().includes('bank')
                  ? 'bank'
                  : 'wallet',
              }),
            )
            resolvedAccountIdMap.set(mmAccount, created.id)
            accountMapByName.set(mmAccount.toLowerCase().trim(), created)
            accountsById.set(created.id, created)
            accountsCreated++
          }
        }
      }

      const fallbackAccount =
        existingAccounts[0]?.id ||
        Array.from(resolvedAccountIdMap.values())[0] ||
        ''

      // Category GET is scoped by the account-type owner, not by the importer.
      let categoriesCreated = 0
      const scopedCategories = new Map<string, CategoryDto[]>()
      const resolvedCategories = new Map<string, Map<string, string>>()
      const ownCategories = new Map(
        existingCategories.map((category) => [
          categoryKey(category.type, category.name),
          category,
        ]),
      )
      const currentUserId = authSession.getSnapshot().user?.id
      const currentScopeOwners = new Set(
        existingCategories.map((category) => category.user_id),
      )
      const isOwnOwner = (ownerId: string | undefined) =>
        Boolean(
          ownerId &&
          (currentUserId
            ? ownerId === currentUserId
            : currentScopeOwners.size === 1 && currentScopeOwners.has(ownerId)),
        )

      for (const record of records) {
        if (record.type === 'TRANSFER') continue
        const accountId =
          resolvedAccountIdMap.get(record.accountName) || fallbackAccount
        const key = categoryKey(record.type, record.categoryName)
        let resolved = resolvedCategories.get(accountId)
        if (!resolved) {
          resolved = new Map<string, string>()
          resolvedCategories.set(accountId, resolved)
        }
        if (resolved.has(key)) continue

        let categories = scopedCategories.get(accountId)
        if (!categories) {
          categories = await request(() =>
            fetchCategories({ account_id: accountId }),
          )
          scopedCategories.set(accountId, categories)
        }
        const selectedId =
          categoryMappings[key] ?? categoryMappings[record.categoryName]
        // Legacy name mappings are accepted only when their ID has the right type and owner scope.
        const selected = categories.find(
          (category) =>
            category.id === selectedId && category.type === record.type,
        )
        const existing =
          selected ??
          categories.find(
            (category) => categoryKey(category.type, category.name) === key,
          )
        if (existing) {
          resolved.set(key, existing.id)
          continue
        }

        const account = accountsById.get(accountId)
        const ownerId = accountTypes.find(
          (type) => type.id === account?.account_type_id,
        )?.user_id
        if (!isOwnOwner(ownerId)) {
          throw new Error(
            `Kategori "${record.categoryName}" (${record.type}) tidak tersedia untuk akun "${record.accountName}". Minta pemilik akun membuat kategori tersebut atau pilih akun milik Anda; kepemilikan belum dapat diverifikasi untuk pembuatan otomatis.`,
          )
        }
        // Reuse categories created for another account of the same owner.
        let category = ownCategories.get(key)
        if (!category) {
          setProgress((previous) => ({
            ...previous,
            currentStatus: `Membuat kategori baru: ${record.categoryName} (${record.type})...`,
          }))
          const type = record.type
          category = await request(() =>
            createCategory({ name: record.categoryName, type }),
          )
          ownCategories.set(key, category)
          categoriesCreated++
        }
        categories.push(category)
        resolved.set(key, category.id)
      }

      // Sequential atomic batches avoid one HTTP request and ledger rebuild per row.
      let processed = 0
      let successCount = 0
      let errorCount = 0
      const errors: ImportProgress['errors'] = []
      let stopped = false

      const toInput = (record: MoneyManagerRecord): BatchTransactionInput => {
        const accountId =
          resolvedAccountIdMap.get(record.accountName) || fallbackAccount
        const common = {
          amount: record.amountFormatted,
          transacted_at: new Date(record.dateIso).toISOString(),
          description: record.fullDescription || null,
        }
        if (record.type === 'TRANSFER') {
          return {
            ...common,
            type: 'TRANSFER',
            from_account_id: accountId,
            to_account_id: record.transferToAccountName
              ? resolvedAccountIdMap.get(record.transferToAccountName) ||
              fallbackAccount
              : '',
          }
        }
        return {
          ...common,
          type: record.type,
          account_id: accountId,
          category_id:
            resolvedCategories
              .get(accountId)
              ?.get(categoryKey(record.type, record.categoryName)) ?? '',
        }
      }

      const addErrors = (
        failed: MoneyManagerRecord[],
        message: string,
        retryable = false,
      ) => {
        errorCount += failed.length
        errors.push(
          ...failed.map((record) => ({
            index: record.rowIndex,
            description: `${record.displayDate} - ${record.fullDescription} (${record.amountFormatted})`,
            error: message,
            retryable,
          })),
        )
      }

      const saveBatch = async (batch: MoneyManagerRecord[]): Promise<void> => {
        try {
          await request(() => createTransactionsBatch(batch.map(toInput)))
          successCount += batch.length
        } catch (error) {
          // Validation rejects the entire atomic batch; isolate only these errors.
          if (
            error instanceof ApiError &&
            [400, 413, 422].includes(error.status ?? 0)
          ) {
            if (batch.length > 1) {
              const middle = Math.floor(batch.length / 2)
              await saveBatch(batch.slice(0, middle))
              if (!stopped) await saveBatch(batch.slice(middle))
              else
                addErrors(
                  batch.slice(middle),
                  'Belum diimpor karena proses dihentikan.',
                  true,
                )
            } else addErrors(batch, error.message, true)
          } else {
            stopped = true
            addErrors(
              batch,
              error instanceof Error
                ? error.message
                : 'Gagal menyimpan transaksi.',
              error instanceof ApiError &&
              [401, 403, 429].includes(error.status ?? 0),
            )
          }
        }
      }

      const chunkSize = 100
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize)
        await saveBatch(chunk)
        processed += chunk.length
        if (stopped) {
          addErrors(
            records.slice(processed),
            'Belum diimpor karena proses dihentikan. Jangan ulangi seluruh file karena dapat menduplikasi transaksi yang sudah tersimpan.',
            true,
          )
          processed = records.length
        }
        setProgress((prev) => ({
          ...prev,
          current: processed,
          percentage: Math.round((processed / records.length) * 100),
          currentStatus: stopped
            ? 'Impor dihentikan karena kendala koneksi atau server.'
            : `Mengimpor transaksi ${processed} dari ${records.length}...`,
          successCount,
          errorCount,
          accountsCreated,
          categoriesCreated,
          errors: [...errors],
        }))
        if (stopped) break
      }

      // Invalidate queries so dashboard and transactions show new data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ])

      const finalProgress: ImportProgress = {
        current: records.length,
        total: records.length,
        percentage: 100,
        currentStatus: stopped
          ? 'Impor dihentikan.'
          : errorCount > 0
            ? 'Selesai dengan kendala.'
            : 'Selesai!',
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
