
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

/**
 * Converts an object with unknown values to a Record<string, string>.
 * Filters out null and undefined values.
 * @param obj - Object to convert
 * @returns Record with all values stringified
 */
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

/**
 * Parses a fetch Response, validates the EnterpriseApiResponse envelope,
 * and extracts the typed data payload.
 * @param res - Fetch Response object
 * @returns Resolved data of type T
 * @throws Error if response is not OK or API result is not 'ok'
 */
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

/**
 * Enterprise API client for department, user, and audit log management.
 * All requests are proxied through `/api/enterprise` to protect server-side API keys.
 */
export const enterpriseApi = {
  /**
   * Fetches a paginated list of departments.
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 1000)
   * @returns Object containing the departments array
   */
  getDepartments: (page = 1, limit = 1000): Promise<{ departments: Department[] }> =>
    fetch(`${API_PROXY_BASE}/admin/departments?page=${page}&limit=${limit}`)
      .then(res => handleResponse<{ departments: Department[] }>(res)),

  /**
   * Performs a bulk create/update/delete of departments.
   * @param items - Array of department bulk operation items
   * @param implicitDeletion - If true, departments not in the list are deleted (default: false)
   * @returns Bulk operation result with success/failure counts
   */
  bulkUpdateDepartments: (
    items: DepartmentBulkItem[],
    implicitDeletion = false
  ): Promise<DepartmentBulkResult> =>
    fetch(`${API_PROXY_BASE}/admin/departments/bulk?implicitDeletion=${implicitDeletion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).then(res => handleResponse<DepartmentBulkResult>(res)),

  /**
   * Fetches a filtered and paginated list of enterprise users.
   * @param params - Query parameters (workspaceId, name, email, page, limit)
   * @returns Object containing users array and totalUserCount
   */
  getUsers: (params: {
    workspaceId?: number;
    name?: string;
    email?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: EnterpriseUser[]; totalUserCount: number }> =>
    fetch(`${API_PROXY_BASE}/admin/users?${new URLSearchParams(toStringRecord(params))}`)
      .then(res => handleResponse<{ users: EnterpriseUser[]; totalUserCount: number }>(res)),

  /**
   * Performs a bulk create/update/delete of users.
   * @param items - Array of user bulk operation items
   * @param idType - Identifier type for matching ('userId' or 'email', default: 'userId')
   * @param implicitDeletion - If true, users not in the list are deleted (default: false)
   * @returns Bulk operation result with success/failure counts
   */
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

  /**
   * Fetches audit logs (user action logs) with optional filters.
   * @param query - Filter criteria (date range, user, action type, etc.)
   * @returns Object containing the userActionLogs array
   */
  getAuditLogs: (query: AuditLogQuery = {}): Promise<{ userActionLogs: UserActionLog[] }> =>
    fetch(`${API_PROXY_BASE}/admin/userActionLogs?${new URLSearchParams(toStringRecord(query))}`)
      .then(res => handleResponse<{ userActionLogs: UserActionLog[] }>(res)),

  /**
   * Downloads audit logs as an Excel (.xlsx) file blob.
   * @param query - Filter criteria (same as getAuditLogs, minus isXlsx)
   * @returns Blob containing the Excel file data
   * @throws Error if the HTTP response is not OK
   */
  downloadAuditLogsExcel: (query: Omit<AuditLogQuery, 'isXlsx'>): Promise<Blob> =>
    fetch(`${API_PROXY_BASE}/admin/userActionLogs?${new URLSearchParams(toStringRecord({ ...query, isXlsx: true }))}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      }),
};
