import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  CreateInstrumentInput,
  CreateInvestmentTransactionInput,
  CreatePriceInput,
  HoldingDto,
  InstrumentDto,
  InstrumentPriceDto,
  SnapshotDto,
} from '../types/investment'

export async function fetchInstruments(
  search?: string,
): Promise<InstrumentDto[]> {
  const response = await apiClient.get<ApiResponse<InstrumentDto[]>>(
    '/instruments',
    {
      params: { limit: 100, search },
    },
  )
  return response.data.data
}

export async function createInstrument(
  input: CreateInstrumentInput,
): Promise<InstrumentDto> {
  const response = await apiClient.post<ApiResponse<InstrumentDto>>(
    '/instruments',
    input,
  )
  return response.data.data
}

export async function fetchPrices(
  instrument_id?: string,
): Promise<InstrumentPriceDto[]> {
  const response = await apiClient.get<ApiResponse<InstrumentPriceDto[]>>(
    '/instrument-prices',
    { params: { instrument_id, limit: 100 } },
  )
  return response.data.data
}

export async function createPrice(
  input: CreatePriceInput,
): Promise<InstrumentPriceDto> {
  const response = await apiClient.post<ApiResponse<InstrumentPriceDto>>(
    '/instrument-prices',
    input,
  )
  return response.data.data
}

export async function createInvestmentTransaction(
  input: CreateInvestmentTransactionInput,
): Promise<unknown> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    '/investment-transactions',
    input,
  )
  return response.data.data
}

export async function fetchAccountHoldings(
  accountId: string,
): Promise<HoldingDto[]> {
  const response = await apiClient.get<ApiResponse<HoldingDto[]>>(
    `/accounts/${accountId}/holdings`,
  )
  return response.data.data
}

export async function fetchAccountPortfolioSnapshot(
  accountId: string,
  date: string,
): Promise<SnapshotDto[]> {
  const response = await apiClient.get<ApiResponse<SnapshotDto[]>>(
    `/accounts/${accountId}/portfolio-snapshot`,
    { params: { date } },
  )
  return response.data.data
}
