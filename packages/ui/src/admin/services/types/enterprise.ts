/**
 * Enterprise API type definitions
 * Based on 웍스AI 기업 사용자용 API 이용가이드 v260226
 */

// --- Common ---
export interface EnterpriseApiResponse<T> {
  result: 'ok' | 'error';
  data: T;
}

export interface EnterpriseErrorResponse {
  status: 'error';
  code: number;
  message: string;
}

export interface BulkSummary {
  total: number;
  success: number;
  fail: number;
}

// --- Departments ---
export interface Department {
  id: number;
  name: string;
  code: string;
  parentCode: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}

export interface DepartmentBulkItem {
  id: { code: string };
  delete?: boolean;
  meta?: {
    parentCode: string;
    name: string;
  };
}

export interface DepartmentBulkResultItem {
  code: string;
  action: 'update' | 'insert' | 'delete' | 'skip';
  success: boolean;
  error?: { code: string; message: string };
}

export interface DepartmentBulkResult {
  result: DepartmentBulkResultItem[];
  summary: BulkSummary;
}

// --- Users ---
export type EnterpriseUserRole = 'ENTERPRISE_MANAGER' | 'WORKSPACE_MANAGER' | 'WORKSPACE_USER';

export interface EnterpriseUser {
  id: number;
  userName: string;
  workspaceId: number;
  workspaceName: string;
  email: string;
  createdAt: string;
  role: EnterpriseUserRole;
  roleId: number;
  usageLimit: number;
  enabled: boolean;
  wsUserUsageLimit: number;
  departmentId: number;
  departmentCode: string;
  departmentFullName: string;
  employeeId: number;
}

export interface UserBulkItem {
  id: { userId: number } | { email: string };
  delete?: boolean;
  meta?: {
    departmentCode?: string;
    name?: string;
    enabled?: boolean;
    role?: EnterpriseUserRole;
    usageLimit?: number;
    employeeId?: string;
  };
}

export interface UserBulkResultItem {
  id: string;
  action: 'update' | 'delete' | 'skip';
  success: boolean;
  error?: { code: string; message: string };
}

export interface UserBulkResult {
  result: UserBulkResultItem[];
  summary: BulkSummary;
}

// --- Audit Logs ---
export interface UserActionLog {
  id: string;
  createdAt: string;
  workspaceName: string;
  userName: string;
  email: string;
  event: string;
  eventDetail: string;
  ipAddress: string;
  device: string;
  browser: string;
}

export type AuditEventType = 'login' | 'upload' | 'download';

export interface AuditLogQuery {
  from?: string;
  to?: string;
  workspaceId?: number;
  name?: string;
  email?: string;
  eventDetail?: AuditEventType;
  isXlsx?: boolean;
  sort?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// --- SSO ---
export interface SSOConfig {
  companyCode: string;
  encryptionKey: string;
  baseUrl: string;
  enabled: boolean;
  apiEndpoint: 'production' | 'government';
}
