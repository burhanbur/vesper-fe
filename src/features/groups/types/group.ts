export type GroupRole = 'OWNER' | 'MEMBER'

export interface GroupDto {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
  role: GroupRole
  code?: string
}

export interface GroupMemberDto {
  user_id: string
  role: GroupRole
  name: string
  profile: {
    full_name: string | null
    photo: string | null
  } | null
  created_at: string
}

export interface GroupReportCategoryItem {
  group_category_id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  income: string
  expense: string
}

export interface GroupReportDto {
  period: string
  categories: GroupReportCategoryItem[]
}

export interface CreateGroupInput {
  name: string
}

export interface JoinGroupInput {
  code: string
}
