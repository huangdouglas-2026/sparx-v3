'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data) {
        // Successful login - redirect to profile or home
        window.location.href = '/profile';
      }
    } catch (err: any) {
      setError(err.message || '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Google 登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-dark-primary mb-2">
            SparX
          </h1>
          <p className="text-text-dark-secondary">
            你的人脈資本 AI 戰略顧問
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-1">
              電子郵件
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-dark-primary focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-1">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-dark-primary focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••"
            />
          </div>

          {loading ? (
            <button
              type="submit"
              disabled
              className="w-full py-2 bg-primary text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
            >
              登入中...
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                className="flex flex-col items-center justify-center px-6 py-2 bg-surface-dark border border-border-dark rounded-lg hover:bg-surface-dark/80 transition-colors"
              >
                <span className="text-lg mb-1">📧</span>
                <span className="text-sm text-text-dark-primary">電子郵件登入</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex flex-col items-center justify-center px-6 py-2 bg-surface-dark border border-border-dark rounded-lg hover:bg-surface-dark/80 transition-colors"
              >
                <span className="text-lg mb-1">🔗</span>
                <span className="text-sm text-text-dark-primary">Google 快速登入</span>
              </button>
            </div>
          )}
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-text-dark-secondary text-sm">
            還沒有帳號？
            <button
              onClick={() => setShowMagicLink(true)}
              className="text-primary hover:underline text-sm font-medium"
            >
              立即註冊
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
