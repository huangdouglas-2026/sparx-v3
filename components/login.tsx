'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Login error:', error)
      alert(`登入失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background-dark">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold text-text-dark-primary mb-2">
          星火 <span className="text-primary">(Spark)</span>
        </h1>
        <p className="text-text-dark-secondary mb-8">智慧人脈系統</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-64 h-12 bg-white text-gray-800 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? '處理中...' : '使用 Google 登入'}
        </button>
      </div>
    </div>
  )
}
