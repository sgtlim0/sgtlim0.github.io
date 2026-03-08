import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import DepartmentManagement from '../src/admin/DepartmentManagement'
import AuditLogViewer from '../src/admin/AuditLogViewer'
import SSOConfigPanel from '../src/admin/SSOConfigPanel'

// ════════════════════════════════════════════════════════════════════
// 1. DepartmentManagement
// ════════════════════════════════════════════════════════════════════
describe('DepartmentManagement', () => {
  it('should render page title', () => {
    render(<DepartmentManagement />)
    expect(screen.getByText('부서 관리')).toBeDefined()
  })

  it('should render department count', () => {
    render(<DepartmentManagement />)
    expect(screen.getByText('총 8개 부서')).toBeDefined()
  })

  it('should render search input', () => {
    render(<DepartmentManagement />)
    expect(screen.getByPlaceholderText('부서명 또는 코드 검색...')).toBeDefined()
  })

  it('should render action buttons', () => {
    render(<DepartmentManagement />)
    expect(screen.getByText('동기화')).toBeDefined()
    expect(screen.getByText('부서 추가')).toBeDefined()
  })

  it('should render department tree structure', () => {
    render(<DepartmentManagement />)
    expect(screen.getByText('부서 구조')).toBeDefined()
    expect(screen.getByText('현대자동차')).toBeDefined()
    expect(screen.getByText('DX본부')).toBeDefined()
    expect(screen.getByText('AI연구팀')).toBeDefined()
    expect(screen.getByText('기아')).toBeDefined()
    expect(screen.getByText('현대모비스')).toBeDefined()
  })

  it('should render user counts for departments', () => {
    render(<DepartmentManagement />)
    expect(screen.getByText('156')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText('15')).toBeDefined()
  })

  it('should show default empty state when no department selected', () => {
    render(<DepartmentManagement />)
    expect(screen.getByText('부서를 선택하면 상세 정보가 표시됩니다')).toBeDefined()
  })

  it('should show department detail when department clicked', () => {
    render(<DepartmentManagement />)
    fireEvent.click(screen.getByText('AI연구팀'))
    expect(screen.getByText('부서 정보')).toBeDefined()
    expect(screen.getByText('AI_TEAM')).toBeDefined()
    expect(screen.getByText('15명')).toBeDefined()
    expect(screen.getByText('수정')).toBeDefined()
    expect(screen.getByText('삭제')).toBeDefined()
  })

  it('should show parent department name in detail', () => {
    render(<DepartmentManagement />)
    fireEvent.click(screen.getByText('AI연구팀'))
    expect(screen.getAllByText('DX본부').length).toBeGreaterThanOrEqual(2)
  })

  it('should show 최상위 for root departments', () => {
    render(<DepartmentManagement />)
    fireEvent.click(screen.getByText('현대자동차'))
    expect(screen.getByText('최상위')).toBeDefined()
  })

  it('should filter departments by search query', () => {
    render(<DepartmentManagement />)
    const input = screen.getByPlaceholderText('부서명 또는 코드 검색...')
    fireEvent.change(input, { target: { value: 'AI' } })
    expect(screen.getByText('AI연구팀')).toBeDefined()
    expect(screen.queryByText('현대자동차')).toBeNull()
  })

  it('should show sync results on sync button click', () => {
    render(<DepartmentManagement />)
    fireEvent.click(screen.getByText('동기화'))
    expect(screen.getByText('동기화 결과')).toBeDefined()
    expect(screen.getByText(/성공:/)).toBeDefined()
    expect(screen.getByText(/8건/)).toBeDefined()
  })

  it('should open add department modal', () => {
    render(<DepartmentManagement />)
    fireEvent.click(screen.getByText('부서 추가'))
    expect(screen.getByText('부서 코드')).toBeDefined()
    expect(screen.getByText('부서 이름')).toBeDefined()
    expect(screen.getByText('상위 부서')).toBeDefined()
    expect(screen.getByText('취소')).toBeDefined()
    expect(screen.getByText('추가')).toBeDefined()
  })

  it('should close add modal on cancel', () => {
    render(<DepartmentManagement />)
    fireEvent.click(screen.getByText('부서 추가'))
    expect(screen.getByText('부서 코드')).toBeDefined()
    fireEvent.click(screen.getByText('취소'))
    expect(screen.queryByText('부서 코드')).toBeNull()
  })
})

// ════════════════════════════════════════════════════════════════════
// 2. AuditLogViewer
// ════════════════════════════════════════════════════════════════════
describe('AuditLogViewer', () => {
  it('should render page title', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('감사 로그')).toBeDefined()
  })

  it('should render subtitle', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('모든 사용자 활동을 추적합니다')).toBeDefined()
  })

  it('should render excel download button', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('Excel 다운로드')).toBeDefined()
  })

  it('should render event type filter tabs', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('전체')).toBeDefined()
    expect(screen.getByText('로그인')).toBeDefined()
    expect(screen.getByText('업로드')).toBeDefined()
    expect(screen.getByText('다운로드')).toBeDefined()
  })

  it('should render sort toggle button', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('최신순')).toBeDefined()
  })

  it('should render table headers', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('시각')).toBeDefined()
    expect(screen.getByText('사용자')).toBeDefined()
    expect(screen.getByText('이메일')).toBeDefined()
    expect(screen.getByText('이벤트')).toBeDefined()
    expect(screen.getByText('상세')).toBeDefined()
    expect(screen.getByText('IP 주소')).toBeDefined()
  })

  it('should render audit log entries', () => {
    render(<AuditLogViewer />)
    // '홍길동' appears in 2 rows (ids 1 and 7)
    expect(screen.getAllByText('홍길동').length).toBeGreaterThanOrEqual(1)
    // '김철수' appears in 2 rows (ids 2 and 8)
    expect(screen.getAllByText('김철수').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('이영희')).toBeDefined()
    expect(screen.getAllByText('hong@hyundai.com').length).toBeGreaterThanOrEqual(1)
  })

  it('should render event badges', () => {
    render(<AuditLogViewer />)
    const loginBadges = screen.getAllByText('Login')
    expect(loginBadges.length).toBeGreaterThanOrEqual(1)
    const downloadBadges = screen.getAllByText('Download')
    expect(downloadBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('should filter by 로그인 tab', () => {
    render(<AuditLogViewer />)
    fireEvent.click(screen.getByText('로그인'))
    const loginBadges = screen.getAllByText('Login')
    expect(loginBadges.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Download')).toBeNull()
    expect(screen.queryByText('Upload')).toBeNull()
  })

  it('should filter by 다운로드 tab', () => {
    render(<AuditLogViewer />)
    fireEvent.click(screen.getByText('다운로드'))
    const downloadBadges = screen.getAllByText('Download')
    expect(downloadBadges.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Login')).toBeNull()
  })

  it('should toggle sort order', () => {
    render(<AuditLogViewer />)
    expect(screen.getByText('최신순')).toBeDefined()
    fireEvent.click(screen.getByText('최신순'))
    expect(screen.getByText('오래된순')).toBeDefined()
  })

  it('should search by user name', () => {
    render(<AuditLogViewer />)
    const input = screen.getByPlaceholderText('사용자 검색')
    fireEvent.change(input, { target: { value: '이영희' } })
    expect(screen.getByText('이영희')).toBeDefined()
    expect(screen.queryByText('김철수')).toBeNull()
  })

  it('should search by email', () => {
    render(<AuditLogViewer />)
    const input = screen.getByPlaceholderText('사용자 검색')
    fireEvent.change(input, { target: { value: 'choisj@kia' } })
    expect(screen.getByText('최수진')).toBeDefined()
    expect(screen.queryByText('이영희')).toBeNull()
  })

  it('should expand row detail on click', () => {
    render(<AuditLogViewer />)
    // Click on '이영희' row - unique user
    fireEvent.click(screen.getByText('이영희'))
    expect(screen.getByText('Device:')).toBeDefined()
    expect(screen.getByText('Browser:')).toBeDefined()
    expect(screen.getByText('Workspace:')).toBeDefined()
  })

  it('should collapse expanded row on second click', () => {
    render(<AuditLogViewer />)
    fireEvent.click(screen.getByText('이영희'))
    expect(screen.getByText('Device:')).toBeDefined()
    fireEvent.click(screen.getByText('이영희'))
    expect(screen.queryByText('Device:')).toBeNull()
  })

  it('should show empty state when no results match', () => {
    render(<AuditLogViewer />)
    const input = screen.getByPlaceholderText('사용자 검색')
    fireEvent.change(input, { target: { value: 'nonexistentuser' } })
    expect(screen.getByText('데이터가 없습니다.')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 3. SSOConfigPanel
// ════════════════════════════════════════════════════════════════════
describe('SSOConfigPanel', () => {
  it('should render page title', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('SSO 설정')).toBeDefined()
  })

  it('should render SSO activation section', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('SSO 활성화')).toBeDefined()
    expect(screen.getByText('SSO 인증 활성화')).toBeDefined()
  })

  it('should render company code section', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('회사 코드 설정')).toBeDefined()
    expect(screen.getByText('회사 코드')).toBeDefined()
    expect(screen.getByDisplayValue('hyundai')).toBeDefined()
  })

  it('should render API endpoint section', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('API 엔드포인트')).toBeDefined()
    expect(screen.getByText(/상용.*gateway-api/)).toBeDefined()
    expect(screen.getByText(/공공.*gov-api/)).toBeDefined()
  })

  it('should have production selected by default', () => {
    render(<SSOConfigPanel />)
    const productionRadio = screen.getByLabelText(/상용/)
    expect((productionRadio as HTMLInputElement).checked).toBe(true)
  })

  it('should switch to public endpoint', () => {
    render(<SSOConfigPanel />)
    const publicRadio = screen.getByLabelText(/공공/)
    fireEvent.click(publicRadio)
    expect((publicRadio as HTMLInputElement).checked).toBe(true)
    const productionRadio = screen.getByLabelText(/상용/)
    expect((productionRadio as HTMLInputElement).checked).toBe(false)
  })

  it('should render encryption key section (masked)', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('암호화 키')).toBeDefined()
    expect(screen.getByText('변경')).toBeDefined()
  })

  it('should toggle encryption key visibility', () => {
    render(<SSOConfigPanel />)
    fireEvent.click(screen.getByText('변경'))
    expect(screen.getByText('aB3dEf7hIjKlMnOpQrStUvWx')).toBeDefined()
    expect(screen.getByText('숨기기')).toBeDefined()
    fireEvent.click(screen.getByText('숨기기'))
    expect(screen.queryByText('aB3dEf7hIjKlMnOpQrStUvWx')).toBeNull()
  })

  it('should render SSO test section', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('SSO 테스트')).toBeDefined()
    expect(screen.getByLabelText('사번')).toBeDefined()
    expect(screen.getByLabelText('이름')).toBeDefined()
    expect(screen.getByText('테스트 URL 생성')).toBeDefined()
  })

  it('should generate test URL with inputs', () => {
    render(<SSOConfigPanel />)
    // Use ASCII-only values since btoa in Node.js doesn't support non-ASCII
    fireEvent.change(screen.getByLabelText('사번'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: 'TestUser' } })
    fireEvent.click(screen.getByText('테스트 URL 생성'))
    // After URL generation, the copy button should appear
    expect(screen.getByText('복사')).toBeDefined()
    // The generated URL container should exist
    const urlContainer = screen.getByText(/wrks\.ai\/ko\/signin\/company\/hyundai/)
    expect(urlContainer).toBeDefined()
  })

  it('should show alert when test URL generated without inputs', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<SSOConfigPanel />)
    fireEvent.click(screen.getByText('테스트 URL 생성'))
    expect(alertSpy).toHaveBeenCalledWith('사번과 이름을 입력해주세요.')
    alertSpy.mockRestore()
  })

  it('should update company code in config', () => {
    render(<SSOConfigPanel />)
    const input = screen.getByDisplayValue('hyundai')
    fireEvent.change(input, { target: { value: 'kia' } })
    expect(screen.getByDisplayValue('kia')).toBeDefined()
  })

  it('should render save button', () => {
    render(<SSOConfigPanel />)
    expect(screen.getByText('저장')).toBeDefined()
  })

  it('should call alert on save', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<SSOConfigPanel />)
    fireEvent.click(screen.getByText('저장'))
    expect(alertSpy).toHaveBeenCalledWith('SSO 설정이 저장되었습니다.')
    alertSpy.mockRestore()
  })
})
