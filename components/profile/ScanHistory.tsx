'use client';

import { useState, useEffect } from 'react';
import type { DashboardContact } from '@/types';

export interface ScanHistory {
  id: string;
  scanned_at: string;
  contact: {
    name: string;
    title: string;
    company: string;
  };
  status: 'pending' | 'confirmed' | 'declined';
}

interface ScanHistoryProps {
  onContactClick?: (contactId: string) => void;
}

export function ScanHistory({ onContactClick }: ScanHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<ScanHistory[]>([]);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      setIsLoading(true);
      // TODO: Load from database when table exists
      // For now, return mock data
      const mockHistory: ScanHistory[] = [
        {
          id: '1',
          scanned_at: new Date(Date.now() - 86400000).toISOString(),
          contact: {
            name: '張大明',
            title: '產品經理',
            company: '科技公司',
          },
          status: 'confirmed',
        },
        {
          id: '2',
          scanned_at: new Date(Date.now() - 172800000).toISOString(),
          contact: {
            name: '李小花',
            title: '行銷經理',
            company: '行銷公司',
          },
          status: 'pending',
        },
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
    return date.toLocaleDateString('zh-TW');
  };

  const getStatusBadge = (status: ScanHistory['status']) => {
    const badges = {
      pending: { label: '待處理', color: 'bg-yellow-500/10 text-yellow-400' },
      confirmed: { label: '已確認', color: 'bg-green-500/10 text-green-400' },
      declined: { label: '已拒絕', color: 'bg-red-500/10 text-red-400' },
    };
    return badges[status];
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-2">掃描歷史</h3>
        <div className="text-center py-4 text-text-dark-secondary text-sm">
          載入中...
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-2">掃描歷史</h3>
        <div className="text-center py-4">
          <p className="text-sm text-text-dark-secondary">尚無掃描記錄</p>
          <p className="text-xs text-text-dark-secondary mt-1">
            掃描的名片將會顯示在這裡
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-dark-primary">掃描歷史</h3>
        <button
          onClick={() => {
            // TODO: Navigate to full history page
            alert('查看全部掃描記錄功能開發中');
          }}
          className="text-xs text-primary hover:underline"
        >
          查看全部 ({history.length})
        </button>
      </div>

      <div className="space-y-3">
        {history.slice(0, 3).map((item) => {
          const statusBadge = getStatusBadge(item.status);
          return (
            <div
              key={item.id}
              onClick={() => onContactClick?.(item.id)}
              className="p-3 bg-background-dark rounded-lg border border-border-dark hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  📷
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-text-dark-primary truncate">
                      {item.contact.name}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-dark-secondary">
                    {item.contact.title} @ {item.contact.company}
                  </p>
                  <p className="text-xs text-text-dark-secondary mt-1">
                    {formatRelativeTime(item.scanned_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {history.length > 3 && (
          <button
            onClick={() => {
              alert('查看全部掃描記錄功能開發中');
            }}
            className="w-full py-2 text-sm text-primary hover:underline"
          >
            查看全部 {history.length} 筆記錄
          </button>
        )}
      </div>
    </div>
  );
}
