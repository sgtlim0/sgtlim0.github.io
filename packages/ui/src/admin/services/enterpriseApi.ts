'use client';

import type {
  Department,
  DepartmentBulkItem,
  DepartmentBulkResult,
  EnterpriseUser,
  UserBulkItem,
  UserBulkResult,
  UserActionLog,
  AuditLogQuery,
  EnterpriseApiResponse,
} from './types/enterprise';

function toStringRecord(obj: Record<string, unknown> | unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        result[key] = String(value);
      }
    }
  }
  return result;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  const json: EnterpriseApiResponse<T> = await res.json();
  if (json.result !== 'ok') {
    throw new Error('API returned error');
  }
  return json.data;
}

const API_PROXY_BASE = '/api/enterprise';

export const enterpriseApi = {
  // Departments
  getDepartments: (page = 1, limit = 1000): Promise<{ departments: Department[] }> =>
    fetch(`${API_PROXY_BASE}/admin/departments?page=${page}&limit=${limit}`)
      .then(res => handleResponse<{ departments: Department[] }>(res)),

  bulkUpdateDepartments: (
    items: DepartmentBulkItem[],
    implicitDeletion = false
  ): Promise<DepartmentBulkResult> =>
    fetch(`${API_PROXY_BASE}/admin/departments/bulk?implicitDeletion=${implicitDeletion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).then(res => handleResponse<DepartmentBulkResult>(res)),

  // Users
  getUsers: (params: {
    workspaceId?: number;
    name?: string;
    email?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: EnterpriseUser[]; totalUserCount: number }> =>
    fetch(`${API_PROXY_BASE}/admin/users?${new URLSearchParams(toStringRecord(params))}`)
      .then(res => handleResponse<{ users: EnterpriseUser[]; totalUserCount: number }>(res)),

  bulkUpdateUsers: (
    items: UserBulkItem[],
    idType: 'userId' | 'email' = 'userId',
    implicitDeletion = false
  ): Promise<UserBulkResult> =>
    fetch(`${API_PROXY_BASE}/admin/users/bulk?idType=${idType}&implicitDeletion=${implicitDeletion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).then(res => handleResponse<UserBulkResult>(res)),

  // Audit Logs
  getAuditLogs: (query: AuditLogQuery = {}): Promise<{ userActionLogs: UserActionLog[] }> =>
    fetch(`${API_PROXY_BASE}/admin/userActionLogs?${new URLSearchParams(toStringRecord(query))}`)
      .then(res => handleResponse<{ userActionLogs: UserActionLog[] }>(res)),

  downloadAuditLogsExcel: (query: Omit<AuditLogQuery, 'isXlsx'>): Promise<Blob> =>
    fetch(`${API_PROXY_BASE}/admin/userActionLogs?${new URLSearchParams(toStringRecord({ ...query, isXlsx: true }))}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      }),
};
