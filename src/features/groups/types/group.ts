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

export interface GroupSharedAccountDto {
  id: string
  group_id: string
  account_id: string
  name: string
}

export interface GroupCategoryDto {
  id: string
  group_id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  created_at: string
}

export interface GroupCategoryMappingDto {
  id: string
  group_id: string
  group_category_id: string
  user_category_id: string
}

export interface CollaborationBalance {
  currency: string
  balance: string
}

export interface MemberContribution {
  user_id: string
  currency: string
  income: string
  expense: string
}

export interface CollaborationFeedItem {
  id: string
  user_id: string
  currency: string
  amount: string
  type: string
  category: string
  transacted_at: string
}

export interface CollaborationDto {
  period: string
  page: number
  limit: number
  balances: CollaborationBalance[]
  contributions: MemberContribution[]
  feed: CollaborationFeedItem[]
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

export interface MembershipActionInput {
  user_id: string
  action: 'REMOVE' | 'TRANSFER_OWNER'
}

export interface CreateGroupCategoryInput {
  name: string
  type: 'INCOME' | 'EXPENSE'
}

export interface PocketBalance {
  currency: string
  balance: string
}

export interface PocketAccount {
  account_id: string
  name: string
  owner_user_id: string
  owner_name: string
  currency: string
  balance: string
}

export interface GroupPocketDto {
  id: string
  name: string
  description: string | null
  balances: PocketBalance[]
  accounts: PocketAccount[]
}

export interface CreateGroupPocketInput {
  name: string
  description?: string | undefined
}

export interface UpdateGroupPocketInput {
  name?: string | undefined
  description?: string | null | undefined
}
