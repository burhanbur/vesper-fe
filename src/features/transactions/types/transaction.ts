export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

export interface TransactionDto {
  id: string
  account_id: string
  category_id: string | null
  transfer_id: string | null
  type: TransactionType
  amount: string // e.g. "50000.00"
  transacted_at: string
  description: string | null
  version: string
  created_by: string
  updated_by: string
  deleted_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateTransactionInput {
  account_id: string
  category_id: string
  type: 'INCOME' | 'EXPENSE'
  amount: string // must match format e.g. "50000.00"
  transacted_at: string // ISO string with ms precision
  description?: string | null | undefined
}

export interface UpdateTransactionInput {
  version: string
  account_id?: string | undefined
  category_id?: string | undefined
  type?: ('INCOME' | 'EXPENSE') | undefined
  amount?: string | undefined
  transacted_at?: string | undefined
  description?: string | null | undefined
}

export interface CreateTransferInput {
  from_account_id: string
  to_account_id: string
  amount: string // e.g. "50000.00"
  transacted_at: string
  description?: string | null | undefined
}

export interface TransferDto {
  id: string
  from_account_id: string
  to_account_id: string
  from_transaction_id: string
  to_transaction_id: string
  amount: string
  transacted_at: string
  description: string | null
  version: string
  created_by: string
  updated_by: string
  deleted_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ListTransactionsQuery {
  page?: number | undefined
  limit?: number | undefined
  sort?:
    | ('created_at' | '-created_at' | 'transacted_at' | '-transacted_at')
    | undefined
  account_id?: string | undefined
  category_id?: string | undefined
  type?: TransactionType | undefined
  date_range?: string | undefined
}
