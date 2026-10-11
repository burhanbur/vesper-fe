import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  CreateGroupInput,
  GroupDto,
  GroupMemberDto,
  GroupReportDto,
  JoinGroupInput,
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
  groupId: string,
  input: JoinGroupInput,
): Promise<unknown> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/groups/${groupId}/join`,
    input,
  )
  return response.data.data
}

export async function fetchGroupMembers(
  groupId: string,
): Promise<GroupMemberDto[]> {
  const response = await apiClient.get<ApiResponse<GroupMemberDto[]>>(
    `/groups/${groupId}/members`,
  )
  return response.data.data
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
