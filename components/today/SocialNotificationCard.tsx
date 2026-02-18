'use client';

import { useState } from 'react';

export interface SocialNotification {
  id: string;
  platform: 'linkedin' | 'facebook' | 'instagram';
  type: 'post' | 'comment' | 'mention' | 'like' | 'connection' | 'profile_view' | 'birthday' | 'other';
  from: string;
  subject: string;
  content: string;
  url?: string;
  timestamp: string;
  created_at: string;
}

interface SocialNotificationCardProps {
  notification: SocialNotification;
}

export function SocialNotificationCard({ notification }: SocialNotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 平台圖示與顏色
  const getPlatformStyle = () => {
    switch (notification.platform) {
      case 'linkedin':
        return {
          icon: '🔗',
          bgColor: 'bg-[#0077b5]/10',
          textColor: 'text-[#0077b5]',
          label: 'LinkedIn',
        };
      case 'facebook':
        return {
          icon: '📘',
          bgColor: 'bg-[#1877F2]/10',
          textColor: 'text-[#1877F2]',
          label: 'Facebook',
        };
      case 'instagram':
        return {
          icon: '📷',
          bgColor: 'bg-[#E4405F]/10',
          textColor: 'text-[#E4405F]',
          label: 'Instagram',
        };
      default:
        return {
          icon: '📱',
          bgColor: 'bg-background-dark',
          textColor: 'text-text-dark-secondary',
          label: 'Social',
        };
    }
  };

  // 通知類型圖示
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'post':
        return '📝';
      case 'comment':
        return '💬';
      case 'mention':
        return '🏷️';
      case 'like':
        return '👍';
      case 'connection':
        return '🤝';
      case 'profile_view':
        return '👀';
      case 'birthday':
        return '🎂';
      default:
        return '📬';
    }
  };

  // 格式化時間
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} 小時前`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} 天前`;
  };

  const platformStyle = getPlatformStyle();

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark hover:border-border-dark/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon()}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${platformStyle.textColor}`}>
                {platformStyle.label}
              </span>
              <span className="text-xs text-text-dark-tertiary">
                {formatTime(notification.timestamp)}
              </span>
            </div>
            {notification.from && (
              <p className="text-sm text-text-dark-primary mt-0.5">
                {notification.from}
              </p>
            )}
          </div>
        </div>

        {notification.url && (
          <a
            href={notification.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            查看原文 →
          </a>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-dark-primary">
          {notification.subject}
        </p>

        {notification.content && (
          <p className={`text-sm text-text-dark-secondary ${isExpanded ? '' : 'line-clamp-2'}`}>
            {notification.content}
          </p>
        )}

        {notification.content && notification.content.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-text-dark-tertiary hover:text-text-dark-secondary transition-colors"
          >
            {isExpanded ? '收起' : '展開更多'}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-3 border-t border-border-dark flex gap-2">
        <button
          onClick={() => {
            // TODO: Quick reply functionality
            console.log('Quick reply:', notification);
          }}
          className="flex-1 px-3 py-2 text-xs bg-background-dark text-text-dark-primary rounded-lg font-medium hover:bg-surface-dark/80 transition-colors"
        >
          💬 快速回應
        </button>
        <button
          onClick={() => {
            // TODO: Save for later functionality
            console.log('Save notification:', notification);
          }}
          className="px-3 py-2 text-xs bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-text-dark-primary transition-colors"
        >
          🔖 保存
        </button>
      </div>
    </div>
  );
}

interface SocialNotificationsListProps {
  notifications: SocialNotification[];
  isLoading?: boolean;
}

export function SocialNotificationsList({ notifications, isLoading }: SocialNotificationsListProps) {
  if (isLoading) {
    return (
      <div className="p-6 bg-surface-dark rounded-xl border border-border-dark text-center">
        <div className="text-text-dark-secondary">載入中...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 bg-surface-dark rounded-xl border border-border-dark text-center">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-text-dark-primary mb-2">
          尚未連結社交媒體
        </h3>
        <p className="text-text-dark-secondary text-sm mb-4">
          連結 Google 帳號，自動同步 LinkedIn 和 Facebook 通知
        </p>
        <button
          onClick={() => {
            window.location.href = '/profile?tab=social';
          }}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          前往設定
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-dark-primary">
          最近通知 ({notifications.length})
        </h3>
        <span className="text-xs text-text-dark-tertiary">最近 7 天</span>
      </div>
      {notifications.map((notification) => (
        <SocialNotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
