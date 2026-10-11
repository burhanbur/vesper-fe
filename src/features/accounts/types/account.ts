export type AccountTypeCategory = 'CASH' | 'INVESTMENT'

export interface AccountTypeDto {
  id: string
  user_id: string
  name: string
  category: AccountTypeCategory
  version: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AccountDto {
  id: string
  user_id: string
  account_type_id: string
  parent_account_id: string | null
  icon: string | null
  name: string
  currency: string
  balance: string // decimal string from backend, e.g. "5000000.00"
  description: string | null
  is_visible: boolean
  is_include_total: boolean
  sequence_order: string
  version: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateAccountInput {
  account_type_id: string
  parent_account_id?: string | null
  icon?: string | null
  name: string
  currency?: string
  description?: string | null
  is_visible?: boolean
  is_include_total?: boolean
  sequence_order?: string
}

export interface UpdateAccountInput {
  version: string
  account_type_id?: string
  parent_account_id?: string | null
  icon?: string | null
  name?: string
  currency?: string
  description?: string | null
  is_visible?: boolean
  is_include_total?: boolean
  sequence_order?: string
}

export interface CreateAccountTypeInput {
  name: string
  category?: AccountTypeCategory
}
