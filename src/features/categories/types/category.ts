export type CategoryType = 'INCOME' | 'EXPENSE'

export interface CategoryDto {
  id: string
  user_id: string
  name: string
  type: CategoryType
  version: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateCategoryInput {
  name: string
  type: CategoryType
}

export interface UpdateCategoryInput {
  version: string
  name?: string
  type?: CategoryType
}
