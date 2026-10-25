import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  CollaborationDto,
  CreateGroupCategoryInput,
  CreateGroupInput,
  GroupCategoryDto,
  GroupCategoryMappingDto,
  GroupDto,
  GroupMemberDto,
  GroupReportDto,
  GroupSharedAccountDto,
  MembershipActionInput,
} from '../types/group'

export async function fetchGroups(): Promise<GroupDto[]> {
  const response = await apiClient.get<ApiResponse<GroupDto[]>>('/groups', {
    params: { limit: 100 },
  })
  return response.data.data
}

export async function createGroup(input: CreateGroupInput): Promise<GroupDto> {
  const response = await apiClient.post<ApiResponse<GroupDto>>('/groups', input)
  return response.data.data
}

export async function joinGroup(
  code: string,
  groupId?: string,
): Promise<GroupDto> {
  const endpoint = groupId ? `/groups/${groupId}/join` : '/groups/join'
  const response = await apiClient.post<ApiResponse<GroupDto>>(endpoint, {
    code,
  })
  return response.data.data
}

export async function fetchGroupMembers(
  groupId: string,
): Promise<GroupMemberDto[]> {
  const response = await apiClient.get<ApiResponse<GroupMemberDto[]>>(
    `/groups/${groupId}/members`,
    { params: { limit: 100 } },
  )
  return response.data.data
}

export async function manageGroupMembership(
  groupId: string,
  input: MembershipActionInput,
): Promise<void> {
  await apiClient.post<ApiResponse<null>>(
    `/groups/${groupId}/membership`,
    input,
  )
}

export async function fetchSharedAccounts(
  groupId: string,
): Promise<GroupSharedAccountDto[]> {
  const response = await apiClient.get<ApiResponse<GroupSharedAccountDto[]>>(
    `/groups/${groupId}/accounts`,
    { params: { limit: 100 } },
  )
  return response.data.data
}

export async function shareAccountWithGroup(
  groupId: string,
  account_id: string,
): Promise<unknown> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/groups/${groupId}/accounts`,
    { account_id },
  )
  return response.data.data
}

export async function unshareAccountFromGroup(
  groupId: string,
  account_id: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/groups/${groupId}/accounts`, {
    data: { account_id },
  })
}

export async function fetchGroupCollaboration(
  groupId: string,
  period: string, // YYYY-MM
  page = 1,
  limit = 20,
): Promise<CollaborationDto> {
  const response = await apiClient.get<ApiResponse<CollaborationDto>>(
    `/groups/${groupId}/collaboration`,
    { params: { period, page, limit } },
  )
  return response.data.data
}

export async function fetchGroupCategories(
  groupId: string,
): Promise<GroupCategoryDto[]> {
  const response = await apiClient.get<ApiResponse<GroupCategoryDto[]>>(
    `/groups/${groupId}/categories`,
    { params: { limit: 100 } },
  )
  return response.data.data
}

export async function createGroupCategory(
  groupId: string,
  input: CreateGroupCategoryInput,
): Promise<GroupCategoryDto> {
  const response = await apiClient.post<ApiResponse<GroupCategoryDto>>(
    `/groups/${groupId}/categories`,
    input,
  )
  return response.data.data
}

export async function deleteGroupCategory(
  groupId: string,
  group_category_id: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/groups/${groupId}/categories`, {
    data: { group_category_id },
  })
}

export async function fetchGroupCategoryMappings(
  groupId: string,
): Promise<GroupCategoryMappingDto[]> {
  const response = await apiClient.get<ApiResponse<GroupCategoryMappingDto[]>>(
    `/groups/${groupId}/category-mappings`,
    { params: { limit: 100 } },
  )
  return response.data.data
}

export async function mapCategoryToGroupCategory(
  groupId: string,
  groupCategoryId: string,
  userCategoryId: string,
): Promise<unknown> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/groups/${groupId}/categories/${groupCategoryId}/mapping`,
    { user_category_id: userCategoryId },
  )
  return response.data.data
}

export async function unmapCategoryFromGroupCategory(
  groupId: string,
  groupCategoryId: string,
  userCategoryId: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(
    `/groups/${groupId}/categories/${groupCategoryId}/mapping`,
    { data: { user_category_id: userCategoryId } },
  )
}

export async function fetchGroupReport(
  groupId: string,
  period: string, // YYYY-MM
): Promise<GroupReportDto> {
  const response = await apiClient.get<ApiResponse<GroupReportDto>>(
    `/groups/${groupId}/category-report`,
    { params: { period } },
  )
  return response.data.data
}
