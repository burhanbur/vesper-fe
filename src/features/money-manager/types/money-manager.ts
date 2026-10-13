export type MoneyManagerTxType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export interface MoneyManagerRecord {
  rowIndex: number
  dateIso: string // ISO 8601 string
  displayDate: string
  accountName: string
  categoryName: string
  subcategoryName: string | null
  note: string | null
  description: string | null
  amountNumber: number
  amountFormatted: string // "XXXX.XX"
  type: MoneyManagerTxType
  transferToAccountName: string | null
  fullDescription: string
}

export interface MoneyManagerImportSummary {
  fileName: string
  fileSize: number
  totalRowsParsed: number
  validRecordsCount: number
  incomeCount: number
  expenseCount: number
  transferCount: number
  totalIncomeAmount: number
  totalExpenseAmount: number
  earliestDate: string | null
  latestDate: string | null
  uniqueAccounts: string[]
  uniqueCategories: {
    name: string
    type: 'INCOME' | 'EXPENSE'
  }[]
}

export interface AccountMapping {
  moneyManagerAccount: string
  targetVesperAccountId: string // UUID or "NEW"
  newAccountName?: string
}

export interface CategoryMapping {
  moneyManagerCategory: string
  type: 'INCOME' | 'EXPENSE'
  targetVesperCategoryId: string // UUID or "NEW"
  newCategoryName?: string
}

export type ImportStep = 'upload' | 'preview' | 'importing' | 'completed'

export interface ImportProgress {
  current: number
  total: number
  percentage: number
  currentStatus: string
  successCount: number
  errorCount: number
  accountsCreated: number
  categoriesCreated: number
  errors: Array<{
    index: number
    description: string
    error: string
    retryable?: boolean
  }>
}
