import type { Department, EnterpriseUser, UserActionLog, SSOConfig } from './types/enterprise';

export const mockDepartments: Department[] = [
  { id: 1, name: '현대자동차', code: 'HMC', parentCode: '', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 2, name: 'DX본부', code: 'DX', parentCode: 'HMC', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 3, name: 'AI연구팀', code: 'AI_TEAM', parentCode: 'DX', memo: '생성형 AI 연구', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 4, name: '데이터플랫폼팀', code: 'DATA_TEAM', parentCode: 'DX', memo: null, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 5, name: '기아', code: 'KIA', parentCode: '', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 6, name: 'IT기획팀', code: 'IT_PLAN', parentCode: 'KIA', memo: null, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 7, name: '현대모비스', code: 'MOBIS', parentCode: '', memo: null, createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z' },
  { id: 8, name: 'SW개발실', code: 'SW_DEV', parentCode: 'MOBIS', memo: null, createdAt: '2025-02-10T00:00:00Z', updatedAt: '2025-02-10T00:00:00Z' },
];

export const mockEnterpriseUsers: EnterpriseUser[] = [
  { id: 1, userName: '홍길동', workspaceId: 1, workspaceName: '현대자동차', email: 'hong@hyundai.com', createdAt: '2025-02-01T00:00:00Z', role: 'ENTERPRISE_MANAGER', roleId: 1, usageLimit: 0, enabled: true, wsUserUsageLimit: 0, departmentId: 2, departmentCode: 'DX', departmentFullName: '현대자동차/DX본부', employeeId: 20103021 },
  { id: 2, userName: '김철수', workspaceId: 1, workspaceName: '현대자동차', email: 'kimcs@hyundai.com', createdAt: '2025-02-15T00:00:00Z', role: 'WORKSPACE_MANAGER', roleId: 2, usageLimit: 100000, enabled: true, wsUserUsageLimit: 100000, departmentId: 3, departmentCode: 'AI_TEAM', departmentFullName: '현대자동차/DX본부/AI연구팀', employeeId: 20205018 },
  { id: 3, userName: '이영희', workspaceId: 1, workspaceName: '현대자동차', email: 'lee.yh@hyundai.com', createdAt: '2025-03-01T00:00:00Z', role: 'WORKSPACE_USER', roleId: 3, usageLimit: 50000, enabled: true, wsUserUsageLimit: 50000, departmentId: 3, departmentCode: 'AI_TEAM', departmentFullName: '현대자동차/DX본부/AI연구팀', employeeId: 20310045 },
  { id: 4, userName: '박민수', workspaceId: 1, workspaceName: '현대자동차', email: 'parkms@hyundai.com', createdAt: '2025-03-10T00:00:00Z', role: 'WORKSPACE_USER', roleId: 3, usageLimit: 50000, enabled: false, wsUserUsageLimit: 50000, departmentId: 4, departmentCode: 'DATA_TEAM', departmentFullName: '현대자동차/DX본부/데이터플랫폼팀', employeeId: 20412033 },
  { id: 5, userName: '최수진', workspaceId: 2, workspaceName: '기아', email: 'choisj@kia.com', createdAt: '2025-02-20T00:00:00Z', role: 'WORKSPACE_MANAGER', roleId: 2, usageLimit: 0, enabled: true, wsUserUsageLimit: 0, departmentId: 6, departmentCode: 'IT_PLAN', departmentFullName: '기아/IT기획팀', employeeId: 30102087 },
  { id: 6, userName: '정대호', workspaceId: 3, workspaceName: '현대모비스', email: 'jung.dh@mobis.com', createdAt: '2025-03-05T00:00:00Z', role: 'WORKSPACE_USER', roleId: 3, usageLimit: 30000, enabled: true, wsUserUsageLimit: 30000, departmentId: 8, departmentCode: 'SW_DEV', departmentFullName: '현대모비스/SW개발실', employeeId: 40205019 },
];

export const mockAuditLogs: UserActionLog[] = [
  { id: '67aad1ddb01bcc1533d3c1fa', createdAt: '2026-03-03T10:28:13Z', workspaceName: '현대자동차', userName: '홍길동', email: 'hong@hyundai.com', event: 'Download', eventDetail: 'Download, monthly_report.xlsx', ipAddress: '10.0.1.23', device: 'Macintosh', browser: 'Chrome 122' },
  { id: '67aad1ddb01bcc1533d3c1fb', createdAt: '2026-03-03T09:15:00Z', workspaceName: '현대자동차', userName: '김철수', email: 'kimcs@hyundai.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.0.1.45', device: 'Windows', browser: 'Edge 121' },
  { id: '67aad1ddb01bcc1533d3c1fc', createdAt: '2026-03-02T18:30:45Z', workspaceName: '현대자동차', userName: '이영희', email: 'lee.yh@hyundai.com', event: 'Upload', eventDetail: 'Upload, project_data.csv', ipAddress: '10.0.2.12', device: 'Macintosh', browser: 'Safari 17' },
  { id: '67aad1ddb01bcc1533d3c1fd', createdAt: '2026-03-02T14:22:30Z', workspaceName: '기아', userName: '최수진', email: 'choisj@kia.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.1.0.88', device: 'Windows', browser: 'Chrome 122' },
  { id: '67aad1ddb01bcc1533d3c1fe', createdAt: '2026-03-02T11:05:12Z', workspaceName: '현대자동차', userName: '박민수', email: 'parkms@hyundai.com', event: 'Download', eventDetail: 'Download, ai_usage_stats.pdf', ipAddress: '10.0.3.67', device: 'Windows', browser: 'Chrome 122' },
  { id: '67aad1ddb01bcc1533d3c1ff', createdAt: '2026-03-01T16:45:00Z', workspaceName: '현대모비스', userName: '정대호', email: 'jung.dh@mobis.com', event: 'Login', eventDetail: 'Login via SSO', ipAddress: '10.2.1.34', device: 'Macintosh', browser: 'Chrome 122' },
  { id: '67aad1ddb01bcc1533d3c200', createdAt: '2026-03-01T09:00:00Z', workspaceName: '현대자동차', userName: '홍길동', email: 'hong@hyundai.com', event: 'Login', eventDetail: 'Login', ipAddress: '10.0.1.23', device: 'Macintosh', browser: 'Chrome 122' },
  { id: '67aad1ddb01bcc1533d3c201', createdAt: '2026-02-28T17:30:00Z', workspaceName: '현대자동차', userName: '김철수', email: 'kimcs@hyundai.com', event: 'Upload', eventDetail: 'Upload, training_data.json', ipAddress: '10.0.1.45', device: 'Windows', browser: 'Edge 121' },
];

export const mockSSOConfig: SSOConfig = {
  companyCode: 'hyundai',
  encryptionKey: '••••••••••••••••••••••••',
  baseUrl: 'https://wrks.ai',
  enabled: true,
  apiEndpoint: 'production',
};
