'use client';

import { useState, useEffect } from 'react';
import { contactService } from '@/services/contactService';
import { storyManager } from '@/services/vault';

interface Metrics {
  totalContacts: number;
  totalStories: number;
  weeklyInteractions: number;
  avgResponseRate: number;
}

export function GrowthMetrics() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    totalContacts: 0,
    totalStories: 0,
    weeklyInteractions: 0,
    avgResponseRate: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      // Get contacts count
      const contacts = await contactService.getContacts();

      // Get stories count
      const stories = await storyManager.getAllStories();

      // Calculate weekly interactions (mock data for now)
      // In real implementation, this would come from an interactions table
      const weeklyInteractions = Math.floor(Math.random() * 20) + 5;

      // Calculate average response rate from stories
      const totalSuccessRate = stories.reduce((sum, story) => sum + story.success_rate, 0);
      const avgResponseRate = stories.length > 0 ? totalSuccessRate / stories.length : 0;

      setMetrics({
        totalContacts: contacts.length,
        totalStories: stories.length,
        weeklyInteractions,
        avgResponseRate,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metricCards = [
    {
      label: '聯絡人',
      value: metrics.totalContacts,
      icon: '👥',
      color: 'bg-blue-500/10 text-blue-500',
      trend: '+3 本週',
    },
    {
      label: '故事庫',
      value: metrics.totalStories,
      icon: '📖',
      color: 'bg-purple-500/10 text-purple-500',
      trend: '+2 本週',
    },
    {
      label: '本週互動',
      value: metrics.weeklyInteractions,
      icon: '💬',
      color: 'bg-green-500/10 text-green-500',
      trend: '目標: 25',
    },
    {
      label: '平均回應率',
      value: `${metrics.avgResponseRate.toFixed(0)}%`,
      icon: '📊',
      color: 'bg-orange-500/10 text-orange-500',
      trend: '目標: 70%',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-lg font-semibold text-text-dark-primary">成長指標</h2>
        </div>
        <div className="text-center py-4 text-text-dark-secondary">載入中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h2 className="text-lg font-semibold text-text-dark-primary">成長指標</h2>
        </div>
        <span className="text-xs text-text-dark-secondary">過去 7 天</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="p-3 bg-background-dark rounded-lg border border-border-dark"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{metric.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${metric.color}`}>
                {metric.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-text-dark-primary">{metric.value}</p>
            <p className="text-xs text-text-dark-secondary mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-border-dark">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-dark-secondary">本週目標達成度</span>
          <span className="text-xs font-semibold text-text-dark-primary">
            {Math.min(100, Math.round((metrics.weeklyInteractions / 25) * 100))}%
          </span>
        </div>
        <div className="w-full h-2 bg-background-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round((metrics.weeklyInteractions / 25) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
