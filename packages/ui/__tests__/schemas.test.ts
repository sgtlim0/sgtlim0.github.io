import { describe, it, expect } from 'vitest'
import {
  loginCredentialsSchema,
  authUserSchema,
  roiRecordSchema,
  roiDatasetSchema,
  emailSchema,
  urlSchema,
  apiKeySchema,
  phoneSchema,
  paginationSchema,
} from '../src/schemas'

describe('Auth Schemas', () => {
  describe('loginCredentialsSchema', () => {
    it('유효한 로그인 정보를 통과시킨다', () => {
      const valid = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      }
      const result = loginCredentialsSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('잘못된 이메일 형식을 거부한다', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'password123',
      }
      expect(() => loginCredentialsSchema.parse(invalid)).toThrow('올바른 이메일 형식이 아닙니다')
    })

    it('빈 비밀번호를 거부한다', () => {
      const invalid = {
        email: 'user@example.com',
        password: '',
      }
      expect(() => loginCredentialsSchema.parse(invalid)).toThrow('비밀번호를 입력해주세요')
    })

    it('rememberMe 없이도 통과한다', () => {
      const valid = {
        email: 'user@example.com',
        password: 'password123',
      }
      const result = loginCredentialsSchema.parse(valid)
      expect(result.rememberMe).toBeUndefined()
    })
  })

  describe('authUserSchema', () => {
    it('유효한 사용자 객체를 통과시킨다', () => {
      const valid = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        organization: 'ACME Corp',
        avatarUrl: 'https://example.com/avatar.jpg',
      }
      const result = authUserSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('잘못된 role을 거부한다', () => {
      const invalid = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'superadmin', // 허용되지 않는 role
        organization: 'ACME Corp',
      }
      expect(() => authUserSchema.parse(invalid)).toThrow()
    })

    it('avatarUrl 없이도 통과한다', () => {
      const valid = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'viewer',
        organization: 'ACME Corp',
      }
      const result = authUserSchema.parse(valid)
      expect(result.avatarUrl).toBeUndefined()
    })

    it('잘못된 avatarUrl 형식을 거부한다', () => {
      const invalid = {
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        organization: 'ACME Corp',
        avatarUrl: 'not-a-url',
      }
      expect(() => authUserSchema.parse(invalid)).toThrow()
    })
  })
})

describe('ROI Schemas', () => {
  describe('roiRecordSchema', () => {
    it('유효한 ROI 레코드를 통과시킨다', () => {
      const valid = {
        날짜: '2024-01-15',
        사용자ID: 'user-001',
        부서: '개발팀',
        직급: '선임',
        기능: 'Chat',
        모델: 'GPT-4',
        토큰수: 1500,
        절감시간_분: 30.5,
        만족도: 4,
      }
      const result = roiRecordSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('잘못된 날짜 형식을 거부한다', () => {
      const invalid = {
        날짜: '2024/01/15', // 슬래시 사용
        사용자ID: 'user-001',
        부서: '개발팀',
        직급: '선임',
        기능: 'Chat',
        모델: 'GPT-4',
        토큰수: 1500,
        절감시간_분: 30,
        만족도: 4,
      }
      expect(() => roiRecordSchema.parse(invalid)).toThrow('날짜 형식: YYYY-MM-DD')
    })

    it('음수 토큰수를 거부한다', () => {
      const invalid = {
        날짜: '2024-01-15',
        사용자ID: 'user-001',
        부서: '개발팀',
        직급: '선임',
        기능: 'Chat',
        모델: 'GPT-4',
        토큰수: -100,
        절감시간_분: 30,
        만족도: 4,
      }
      expect(() => roiRecordSchema.parse(invalid)).toThrow()
    })

    it('범위 밖의 만족도를 거부한다', () => {
      const invalidLow = {
        날짜: '2024-01-15',
        사용자ID: 'user-001',
        부서: '개발팀',
        직급: '선임',
        기능: 'Chat',
        모델: 'GPT-4',
        토큰수: 1500,
        절감시간_분: 30,
        만족도: 0, // 1보다 작음
      }
      expect(() => roiRecordSchema.parse(invalidLow)).toThrow()

      const invalidHigh = {
        날짜: '2024-01-15',
        사용자ID: 'user-001',
        부서: '개발팀',
        직급: '선임',
        기능: 'Chat',
        모델: 'GPT-4',
        토큰수: 1500,
        절감시간_분: 30,
        만족도: 6, // 5보다 큼
      }
      expect(() => roiRecordSchema.parse(invalidHigh)).toThrow()
    })

    it('빈 문자열 필드를 거부한다', () => {
      const invalid = {
        날짜: '2024-01-15',
        사용자ID: '', // 빈 문자열
        부서: '개발팀',
        직급: '선임',
        기능: 'Chat',
        모델: 'GPT-4',
        토큰수: 1500,
        절감시간_분: 30,
        만족도: 4,
      }
      expect(() => roiRecordSchema.parse(invalid)).toThrow()
    })
  })

  describe('roiDatasetSchema', () => {
    it('유효한 데이터셋을 통과시킨다', () => {
      const valid = [
        {
          날짜: '2024-01-15',
          사용자ID: 'user-001',
          부서: '개발팀',
          직급: '선임',
          기능: 'Chat',
          모델: 'GPT-4',
          토큰수: 1500,
          절감시간_분: 30,
          만족도: 4,
        },
        {
          날짜: '2024-01-16',
          사용자ID: 'user-002',
          부서: '마케팅팀',
          직급: '대리',
          기능: 'Translation',
          모델: 'Claude',
          토큰수: 2000,
          절감시간_분: 45,
          만족도: 5,
        },
      ]
      const result = roiDatasetSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('빈 배열을 거부한다', () => {
      expect(() => roiDatasetSchema.parse([])).toThrow('최소 1개 이상의 레코드가 필요합니다')
    })

    it('잘못된 레코드가 포함된 배열을 거부한다', () => {
      const invalid = [
        {
          날짜: '2024-01-15',
          사용자ID: 'user-001',
          부서: '개발팀',
          직급: '선임',
          기능: 'Chat',
          모델: 'GPT-4',
          토큰수: 1500,
          절감시간_분: 30,
          만족도: 4,
        },
        {
          날짜: 'invalid-date', // 잘못된 날짜
          사용자ID: 'user-002',
          부서: '마케팅팀',
          직급: '대리',
          기능: 'Translation',
          모델: 'Claude',
          토큰수: 2000,
          절감시간_분: 45,
          만족도: 5,
        },
      ]
      expect(() => roiDatasetSchema.parse(invalid)).toThrow()
    })
  })
})

describe('Common Schemas', () => {
  describe('emailSchema', () => {
    it('유효한 이메일을 통과시킨다', () => {
      const validEmails = [
        'user@example.com',
        'test.user+tag@company.co.kr',
        'admin@subdomain.example.org',
      ]
      validEmails.forEach((email) => {
        const result = emailSchema.parse(email)
        expect(result).toBe(email)
      })
    })

    it('잘못된 이메일을 거부한다', () => {
      const invalidEmails = ['not-email', '@example.com', 'user@', 'user@.com']
      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow('올바른 이메일 형식이 아닙니다')
      })
    })
  })

  describe('urlSchema', () => {
    it('유효한 URL을 통과시킨다', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.example.com/v1/users',
      ]
      validUrls.forEach((url) => {
        const result = urlSchema.parse(url)
        expect(result).toBe(url)
      })
    })

    it('잘못된 URL을 거부한다', () => {
      const invalidUrls = ['not-a-url', 'example.com', '//example.com']
      invalidUrls.forEach((url) => {
        expect(() => urlSchema.parse(url)).toThrow('올바른 URL 형식이 아닙니다')
      })
    })
  })

  describe('apiKeySchema', () => {
    it('유효한 API 키를 통과시킨다', () => {
      const validKeys = ['sk-1234567890', 'sk-abcdefghijklmnop', 'sk-ABC123xyz789']
      validKeys.forEach((key) => {
        const result = apiKeySchema.parse(key)
        expect(result).toBe(key)
      })
    })

    it('잘못된 API 키를 거부한다', () => {
      const invalidKeys = [
        'invalid-key',
        'sk-123', // 너무 짧음
        'pk-1234567890', // 잘못된 prefix
      ]
      invalidKeys.forEach((key) => {
        expect(() => apiKeySchema.parse(key)).toThrow('올바른 API 키 형식이 아닙니다')
      })
    })
  })

  describe('phoneSchema', () => {
    it('유효한 전화번호를 통과시킨다', () => {
      const validPhones = ['010-1234-5678', '01012345678', '011-123-4567', '016-9876-5432']
      validPhones.forEach((phone) => {
        const result = phoneSchema.parse(phone)
        expect(result).toBe(phone)
      })
    })

    it('잘못된 전화번호를 거부한다', () => {
      const invalidPhones = [
        '02-1234-5678', // 지역번호
        '010-12-5678', // 잘못된 형식
        '010123456', // 자릿수 부족 (9자리)
      ]
      invalidPhones.forEach((phone) => {
        expect(() => phoneSchema.parse(phone)).toThrow('올바른 전화번호 형식이 아닙니다')
      })
    })
  })

  describe('paginationSchema', () => {
    it('유효한 페이지네이션을 통과시킨다', () => {
      const valid = { page: 2, limit: 50 }
      const result = paginationSchema.parse(valid)
      expect(result).toEqual(valid)
    })

    it('기본값을 제공한다', () => {
      const result = paginationSchema.parse({})
      expect(result).toEqual({ page: 1, limit: 20 })
    })

    it('범위 밖의 값을 거부한다', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow() // page < 1
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow() // limit > 100
      expect(() => paginationSchema.parse({ limit: 0 })).toThrow() // limit < 1
    })
  })
})

describe('Edge Cases', () => {
  it('null 값을 적절히 처리한다', () => {
    expect(() => loginCredentialsSchema.parse(null)).toThrow()
    expect(() => roiRecordSchema.parse(null)).toThrow()
    expect(() => emailSchema.parse(null)).toThrow()
  })

  it('undefined 값을 적절히 처리한다', () => {
    expect(() => loginCredentialsSchema.parse(undefined)).toThrow()
    expect(() => roiRecordSchema.parse(undefined)).toThrow()
    expect(() => emailSchema.parse(undefined)).toThrow()
  })

  it('추가 속성을 무시한다', () => {
    const withExtra = {
      email: 'user@example.com',
      password: 'password123',
      extraField: 'should be ignored',
    }
    const result = loginCredentialsSchema.parse(withExtra)
    expect(result).not.toHaveProperty('extraField')
  })

  it('타입 변환을 수행한다', () => {
    const withStringNumber = {
      날짜: '2024-01-15',
      사용자ID: 'user-001',
      부서: '개발팀',
      직급: '선임',
      기능: 'Chat',
      모델: 'GPT-4',
       
      토큰수: '1500' as unknown as number,
      절감시간_분: '30.5' as unknown as number,
      만족도: '4' as unknown as number,
    }

    // Zod의 coerce를 사용하지 않으면 실패해야 함
    expect(() => roiRecordSchema.parse(withStringNumber)).toThrow()
  })
})
