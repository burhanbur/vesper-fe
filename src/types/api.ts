export interface Pagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  timestamp: string
  total_data: number
  data: T
  pagination?: Pagination
}
