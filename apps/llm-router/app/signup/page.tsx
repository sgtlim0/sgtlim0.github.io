'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!formData.agreeToTerms) {
      alert('서비스 이용약관에 동의해주세요.')
      return
    }

    // TODO: Implement signup logic
    console.log('Signup:', formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-lr-bg-section">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-lr-primary mb-2">H Chat LLM Router</h1>
          </Link>
          <p className="text-lr-text-secondary">계정을 만들어 시작하세요</p>
        </div>

        {/* Signup Card */}
        <div className="bg-lr-bg border border-lr-border rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-lr-text-primary mb-6">
            H Chat LLM Router 시작하기
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2 text-lr-text-primary"
              >
                이름
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lr-text-muted" />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-lr-text-primary"
              >
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lr-text-muted" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-lr-text-primary"
              >
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lr-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lr-text-muted hover:text-lr-text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-lr-text-muted">최소 8자 이상</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2 text-lr-text-primary"
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lr-text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lr-text-muted hover:text-lr-text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                className="mt-1 w-4 h-4 border-lr-border rounded focus:ring-2 focus:ring-lr-primary"
                required
              />
              <label htmlFor="agreeToTerms" className="text-sm text-lr-text-secondary">
                <Link href="/terms" className="text-lr-primary hover:text-lr-primary-hover">
                  서비스 이용약관
                </Link>
                {' 및 '}
                <Link href="/privacy" className="text-lr-primary hover:text-lr-primary-hover">
                  개인정보 처리방침
                </Link>
                에 동의합니다
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-lr-primary hover:bg-lr-primary-hover text-white rounded-lg font-semibold transition-colors"
            >
              계정 만들기
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-lr-text-secondary">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-lr-primary hover:text-lr-primary-hover font-semibold">
              로그인
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-lr-text-muted hover:text-lr-text-secondary transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
