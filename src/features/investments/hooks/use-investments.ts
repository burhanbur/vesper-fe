import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountKeys } from '@/features/accounts/hooks/use-accounts'
import { dashboardKeys } from '@/features/dashboard'
import {
  createInstrument,
  createInvestmentTransaction,
  createPrice,
  fetchAccountHoldings,
  fetchAccountPortfolioSnapshot,
  fetchInstruments,
  fetchPrices,
} from '../api/investment-api'
import type {
  CreateInstrumentInput,
  CreateInvestmentTransactionInput,
  CreatePriceInput,
} from '../types/investment'

export const investmentKeys = {
  all: ['investments'] as const,
  instruments: (search?: string) =>
    [...investmentKeys.all, 'instruments', search] as const,
  prices: (instrument_id?: string) =>
    [...investmentKeys.all, 'prices', instrument_id] as const,
  holdings: (accountId: string) =>
    [...investmentKeys.all, 'holdings', accountId] as const,
  snapshot: (accountId: string, date: string) =>
    [...investmentKeys.all, 'snapshot', accountId, date] as const,
}

export function useInstruments(search?: string) {
  return useQuery({
    queryKey: investmentKeys.instruments(search),
    queryFn: () => fetchInstruments(search),
  })
}

export function usePrices(instrument_id?: string) {
  return useQuery({
    queryKey: investmentKeys.prices(instrument_id),
    queryFn: () => fetchPrices(instrument_id),
  })
}

export function useAccountHoldings(accountId: string) {
  return useQuery({
    queryKey: investmentKeys.holdings(accountId),
    queryFn: () => fetchAccountHoldings(accountId),
    enabled: Boolean(accountId),
  })
}

export function useAccountPortfolioSnapshot(accountId: string, date: string) {
  return useQuery({
    queryKey: investmentKeys.snapshot(accountId, date),
    queryFn: () => fetchAccountPortfolioSnapshot(accountId, date),
    enabled: Boolean(accountId && date),
  })
}

export function useCreateInstrument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInstrumentInput) => createInstrument(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: investmentKeys.instruments(),
      })
    },
  })
}

export function useCreatePrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePriceInput) => createPrice(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: investmentKeys.prices() })
      void queryClient.invalidateQueries({ queryKey: investmentKeys.all })
    },
  })
}

export function useCreateInvestmentTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInvestmentTransactionInput) =>
      createInvestmentTransaction(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: investmentKeys.all })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}
