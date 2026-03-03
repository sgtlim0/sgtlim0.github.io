'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import { Moon, Sun, Menu, X } from 'lucide-react';

export interface LRNavbarProps {
  isAuthenticated?: boolean;
}

export default function LRNavbar({ isAuthenticated = false }: LRNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-lr-nav-bg border-b border-lr-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚀</span>
              <span>H Chat LLM Router</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/models"
                className="text-lr-nav-text hover:text-white transition-colors"
              >
                모델
              </Link>
              <Link
                href="/docs"
                className="text-lr-nav-text hover:text-white transition-colors"
              >
                문서
              </Link>
              <Link
                href="/playground"
                className="text-lr-nav-text hover:text-white transition-colors"
              >
                Playground
              </Link>
              <Link
                href="/pricing"
                className="text-lr-nav-text hover:text-white transition-colors"
              >
                가격
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-lr-nav-text hover:text-white transition-colors"
              aria-label="테마 전환"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-lr-primary text-white rounded-lg hover:bg-lr-primary-hover transition-colors"
                >
                  대시보드
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-lr-nav-text hover:text-white transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-lr-primary text-white rounded-lg hover:bg-lr-primary-hover transition-colors"
                  >
                    시작하기
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-lr-nav-text hover:text-white transition-colors"
              aria-label="메뉴"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-lr-border py-4 px-4 space-y-3">
            <Link
              href="/models"
              className="block py-2 text-lr-nav-text hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              모델
            </Link>
            <Link
              href="/docs"
              className="block py-2 text-lr-nav-text hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              문서
            </Link>
            <Link
              href="/playground"
              className="block py-2 text-lr-nav-text hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Playground
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-lr-nav-text hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              가격
            </Link>
            <div className="pt-3 border-t border-lr-border space-y-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 bg-lr-primary text-white rounded-lg text-center hover:bg-lr-primary-hover transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  대시보드
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-lr-nav-text hover:text-white transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 bg-lr-primary text-white rounded-lg text-center hover:bg-lr-primary-hover transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    시작하기
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
