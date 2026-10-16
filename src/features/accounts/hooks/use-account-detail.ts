import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type { AccountDto } from '../types/account'
import { accountKeys } from './use-accounts'

// The backend exposes only the paginated collection, not GET /accounts/:id.
export function useAccountDetail(accountId: string) {
  return useQuery({
    queryKey: [...accountKeys.all, 'detail', accountId],
    queryFn: async () => {
      const accounts: AccountDto[] = []
      let page = 1
      while (true) {
        const response = await apiClient.get<ApiResponse<AccountDto[]>>(
          '/accounts',
          {
            params: { page, limit: 100 },
          },
        )
        accounts.push(...response.data.data)
        const account = accounts.find((entry) => entry.id === accountId)
        const parent = accounts.find(
          (entry) => entry.id === account?.parent_account_id,
        )
        if (account && (!account.parent_account_id || parent))
          return { account, parent }
        if (
          !response.data.pagination ||
          page >= response.data.pagination.last_page
        ) {
          return { account, parent }
        }
        page++
      }
    },
  })
}
