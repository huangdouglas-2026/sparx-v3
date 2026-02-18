'use client';

import { useState, useEffect } from 'react';
import { ImpactZone, ActionCard, GrowthMetrics, SocialNotificationsList } from '@/components/today';
import type { SocialNotification } from '@/components/today';
import { contactService } from '@/services/contactService';
import { createClient } from '@/lib/supabase/client';
import type { DashboardContact } from '@/types';

export default function TodayPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<DashboardContact[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    loadContacts();
    loadNotifications();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const supabase = createClient();

      // 獲取最近 7 天的社交媒體通知
      const { data, error } = await supabase
        .from('social_notifications')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  // Get today's date
  const today = new Date().toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-dark-primary mb-1">
          {getGreeting()}！今日戰場
        </h1>
        <p className="text-text-dark-secondary">{today} · 人脈行動指南</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-text-dark-secondary">
            載入中...
          </div>
        ) : contacts.length === 0 ? (
          /* Empty State */
          <div className="p-6 bg-surface-dark rounded-xl border border-border-dark text-center">
            <div className="text-4xl mb-3">👋</div>
            <h3 className="text-lg font-semibold text-text-dark-primary mb-2">
              開始建立你的人脈網絡
            </h3>
            <p className="text-text-dark-secondary text-sm mb-4">
              新增第一個聯絡人，開始你的人脈管理之旅
            </p>
            <button
              onClick={() => {
                // TODO: Navigate to add contact page
                alert('新增聯絡人功能開發中');
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              新增聯絡人
            </button>
          </div>
        ) : (
          <>
            {/* Social Notifications */}
            <SocialNotificationsList notifications={notifications} isLoading={isLoadingNotifications} />

            {/* Impact Zone */}
            <ImpactZone contacts={contacts} />

            {/* Action Card */}
            <ActionCard contacts={contacts} />

            {/* Growth Metrics */}
            <GrowthMetrics />

            {/* Quick Actions */}
            <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
              <h3 className="text-sm font-semibold text-text-dark-primary mb-3">快速操作</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    // TODO: Navigate to add contact
                    alert('新增聯絡人功能開發中');
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-background-dark rounded-lg hover:bg-surface-dark/80 transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-xs text-text-dark-secondary">新增聯絡人</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Navigate to vault
                    window.location.href = '/vault';
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-background-dark rounded-lg hover:bg-surface-dark/80 transition-colors"
                >
                  <span className="text-xl">📖</span>
                  <span className="text-xs text-text-dark-secondary">新增故事</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Navigate to network
                    window.location.href = '/network';
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-background-dark rounded-lg hover:bg-surface-dark/80 transition-colors"
                >
                  <span className="text-xl">📊</span>
                  <span className="text-xs text-text-dark-secondary">查看網絡</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
