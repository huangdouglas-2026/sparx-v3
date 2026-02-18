'use client';

import { useState, useEffect } from 'react';
import type { DashboardContact } from '@/types';

export interface Interaction {
  id: string;
  contact_id: string;
  type: 'email' | 'call' | 'meeting' | 'message' | 'scan' | 'note';
  title: string;
  description: string;
  platform?: string;
  created_at: string;
}

interface InteractionHistoryProps {
  contact: DashboardContact;
}

export function InteractionHistory({ contact }: InteractionHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    loadInteractions();
  }, [contact.id]);

  const loadInteractions = async () => {
    try {
      setIsLoading(true);
      // TODO: Load from database when table exists
      // For now, return mock data
      const mockInteractions: Interaction[] = [
        {
          id: '1',
          contact_id: contact.id,
          type: 'scan',
          title: '掃描名片',
          description: '透過 AI OCR 掃描實體名片',
          created_at: new Date().toISOString(),
        },
      ];
      setInteractions(mockInteractions);
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatInteractionType = (type: Interaction['type']) => {
    const types = {
      email: { label: 'Email', icon: '✉️', color: 'bg-blue-500/10 text-blue-400' },
      call: { label: '電話', icon: '📞', color: 'bg-green-500/10 text-green-400' },
      meeting: { label: '會面', icon: '🤝', color: 'bg-purple-500/10 text-purple-400' },
      message: { label: '訊息', icon: '💬', color: 'bg-orange-500/10 text-orange-400' },
      scan: { label: '掃描', icon: '📷', color: 'bg-primary/10 text-primary' },
      note: { label: '備註', icon: '📝', color: 'bg-gray-500/10 text-gray-400' },
    };
    return types[type] || types.note;
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-TW');
  };

  const getInteractionIcon = (type: Interaction['type']) => {
    return formatInteractionType(type).icon;
  };

  const getInteractionColor = (type: Interaction['type']) => {
    return formatInteractionType(type).color;
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-4">互動歷史</h3>
        <div className="text-center py-4 text-text-dark-secondary text-sm">
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-dark-primary">互動歷史</h3>
        <button className="text-xs text-primary hover:underline">
          查看全部
        </button>
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-text-dark-secondary">尚無互動記錄</p>
          <p className="text-xs text-text-dark-secondary mt-1">
            與此聯絡人的互動將顯示在這裡
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.slice(0, 3).map((interaction) => {
            const typeInfo = formatInteractionType(interaction.type);
            return (
              <div
                key={interaction.id}
                className="flex items-start gap-3 p-3 bg-background-dark rounded-lg border border-border-dark hover:border-primary/50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${typeInfo.color} flex-shrink-0`}
                >
                  {typeInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-text-dark-primary">
                      {interaction.title}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  {interaction.description && (
                    <p className="text-xs text-text-dark-secondary line-clamp-2">
                      {interaction.description}
                    </p>
                  )}
                  <p className="text-xs text-text-dark-secondary mt-1">
                    {formatRelativeTime(interaction.created_at)}
                  </p>
                </div>
              </div>
            );
          })}

          {interactions.length > 3 && (
            <button
              onClick={() => {
                // TODO: Navigate to full history page
                alert('查看全部功能開發中');
              }}
              className="w-full py-2 text-sm text-primary hover:underline"
            >
              查看全部 {interactions.length} 筆記錄
            </button>
          )}
        </div>
      )}
    </div>
  );
}
