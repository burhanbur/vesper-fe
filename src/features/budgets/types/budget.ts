export type PeriodType = 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ANNUAL'

export interface BudgetDto {
  id: string
  category_id: string
  anchor_date: string // "YYYY-MM-DD"
  period_type: PeriodType
  base_currency: string
  icon: string | null
  description: string | null
  sequence_order: string
  current_amount: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BudgetProgressDto {
  budget: BudgetDto
  period: string
  start: string
  end: string
  period_days: number
  total_amount: string
  allowance: string
  remaining_amount: string
  progress_percent: string | null
}

export interface CreateBudgetInput {
  category_id: string
  anchor_date: string
  period_type: PeriodType
  amount: string // e.g. "2000000.00"
  base_currency?: 'IDR'
  icon?: string | null
  description?: string | null
  sequence_order?: string
}

export interface UpdateBudgetInput {
  category_id?: string
  anchor_date?: string
  period_type?: PeriodType
  amount?: string
  icon?: string | null
  description?: string | null
  sequence_order?: string
}
