'use client'

import { usePathname, useRouter } from 'next/navigation'

export function TabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { id: 'today', icon: '🔥', label: '今日' },
    { id: 'vault', icon: '💎', label: '價值庫' },
    { id: 'network', icon: '👥', label: '人脈' },
    { id: 'profile', icon: '📇', label: '我的名片' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark border-t border-border-dark z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname === `/${tab.id}`
          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/${tab.id}`)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all
                ${isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-text-dark-secondary hover:text-text-dark-primary'
                }
              `}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
