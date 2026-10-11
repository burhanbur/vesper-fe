export type InstrumentType =
  'STOCK' | 'MUTUAL_FUND' | 'CRYPTO' | 'BOND' | 'GOLD' | 'OTHER'

export type InvestmentTransactionType = 'BUY' | 'SELL' | 'DIVIDEND'

export interface InstrumentDto {
  id: string
  code: string
  name: string
  type: InstrumentType
  currency: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface InstrumentPriceDto {
  id: string
  instrument_id: string
  price_date: string
  close_price: string
  source: 'MANUAL'
  updated_by: string
  created_at: string
  updated_at: string
}

export interface HoldingDto {
  instrument: InstrumentDto
  quantity_held: string
  avg_cost_price: string
  latest_price?: string | null
  market_value?: string | null
  unrealized_pl?: string | null
}

export interface SnapshotDto extends HoldingDto {
  account_id: string
  snapshot_date: string
  market_price: string | null
  market_value: string | null
  unrealized_pl: string | null
}

export interface CreateInstrumentInput {
  code: string
  name: string
  type: InstrumentType
  currency?: 'IDR'
}

export interface CreatePriceInput {
  instrument_id: string
  price_date: string // "YYYY-MM-DD"
  close_price: string
  source?: 'MANUAL'
}

export interface CreateInvestmentTransactionInput {
  instrument_id: string
  account_id: string
  cash_account_id?: string | null
  type: InvestmentTransactionType
  quantity: string
  price_per_unit: string
  fee?: string
  transacted_at: string
  description?: string | null
}
