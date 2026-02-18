'use client';

import { useMemo } from 'react';
import type { DashboardContact } from '@/types';

interface NetworkAnalyticsProps {
  contacts: DashboardContact[];
}

export function NetworkAnalytics({ contacts }: NetworkAnalyticsProps) {
  // 1. 產業分佈統計
  const industryDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    contacts.forEach((contact) => {
      if (contact.industry) {
        distribution.set(contact.industry, (distribution.get(contact.industry) || 0) + 1);
      }
    });
    return Array.from(distribution.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  }, [contacts]);

  // 2. 聯絡人分類統計 (weekly/monthly/restart)
  const categoryDistribution = useMemo(() => {
    const distribution = {
      weekly: 0,
      monthly: 0,
      restart: 0,
    };
    contacts.forEach((contact) => {
      distribution[contact.category]++;
    });
    return distribution;
  }, [contacts]);

  // 3. 聯繫頻率分析
  const contactFrequency = useMemo(() => {
    const now = new Date();
    const ranges = {
      withinWeek: 0,
      withinMonth: 0,
      withinQuarter: 0,
      withinHalfYear: 0,
      overHalfYear: 0,
      never: 0,
    };

    contacts.forEach((contact) => {
      const lastContact = new Date(contact.lastContact);
      const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) ranges.never++;
      else if (diffDays <= 7) ranges.withinWeek++;
      else if (diffDays <= 30) ranges.withinMonth++;
      else if (diffDays <= 90) ranges.withinQuarter++;
      else if (diffDays <= 180) ranges.withinHalfYear++;
      else ranges.overHalfYear++;
    });

    return ranges;
  }, [contacts]);

  // 4. 公司分佈（前 5 名）
  const companyDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    contacts.forEach((contact) => {
      if (contact.company) {
        distribution.set(contact.company, (distribution.get(contact.company) || 0) + 1);
      }
    });
    return Array.from(distribution.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [contacts]);

  // 5. 即將到來的生日（未來 30 天）
  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const currentYear = now.getFullYear();

    return contacts
      .filter((contact) => contact.birthday)
      .map((contact) => {
        const [month, day] = contact.birthday!.split('-').slice(1).map(Number);
        const nextBirthday = new Date(currentYear, month - 1, day);

        // 如果今年的生日已經過了，就用明年的
        if (nextBirthday < now) {
          nextBirthday.setFullYear(currentYear + 1);
        }

        const daysUntil = Math.floor((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return { contact, daysUntil, birthdayDate: nextBirthday };
      })
      .filter(({ daysUntil }) => daysUntil >= 0 && daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [contacts]);

  // 輔助函數：取得類別標籤
  const getCategoryLabel = (category: DashboardContact['category']) => {
    const labels = {
      weekly: '每週',
      monthly: '每月',
      restart: '重新啟動',
    };
    return labels[category] || category;
  };

  // 輔助函數：取得類別顏色
  const getCategoryColor = (category: DashboardContact['category']) => {
    const colors = {
      weekly: 'bg-blue-500',
      monthly: 'bg-green-500',
      restart: 'bg-orange-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  // 計算百分比
  const getPercentage = (count: number) => {
    return contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* 總覽卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
          <div className="text-3xl mb-1">👥</div>
          <div className="text-2xl font-bold text-text-dark-primary">{contacts.length}</div>
          <div className="text-sm text-text-dark-secondary">總聯絡人數</div>
        </div>
        <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
          <div className="text-3xl mb-1">🏢</div>
          <div className="text-2xl font-bold text-text-dark-primary">{industryDistribution.length}</div>
          <div className="text-sm text-text-dark-secondary">產業類別數</div>
        </div>
      </div>

      {/* 聯絡人分類統計 */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">📊 聯絡人分類</h3>
        <div className="space-y-3">
          {(['weekly', 'monthly', 'restart'] as DashboardContact['category'][]).map((category) => {
            const count = categoryDistribution[category];
            const percentage = getPercentage(count);
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-dark-primary">
                    {getCategoryLabel(category)}
                  </span>
                  <span className="text-sm text-text-dark-secondary">
                    {count} 人 ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-background-dark rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${getCategoryColor(category)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 產業分佈 */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">🏭 產業分佈</h3>
        {industryDistribution.length === 0 ? (
          <div className="text-center py-8 text-text-dark-secondary">
            尚無產業資料
          </div>
        ) : (
          <div className="space-y-2">
            {industryDistribution.slice(0, 6).map(({ industry, count }) => {
              const percentage = getPercentage(count);
              return (
                <div key={industry} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-dark-primary truncate">{industry}</span>
                      <span className="text-sm text-text-dark-secondary ml-2">
                        {count} 人
                      </span>
                    </div>
                    <div className="w-full bg-background-dark rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {industryDistribution.length > 6 && (
              <div className="text-xs text-text-dark-secondary text-center pt-2">
                還有 {industryDistribution.length - 6} 個產業類別...
              </div>
            )}
          </div>
        )}
      </div>

      {/* 聯繫頻率分析 */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">📅 聯繫頻率</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
            <div className="text-xs text-text-dark-secondary mb-1">一週內</div>
            <div className="text-xl font-bold text-text-dark-primary">
              {contactFrequency.withinWeek}
            </div>
            <div className="text-xs text-text-dark-secondary">人</div>
          </div>
          <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
            <div className="text-xs text-text-dark-secondary mb-1">一個月內</div>
            <div className="text-xl font-bold text-text-dark-primary">
              {contactFrequency.withinMonth}
            </div>
            <div className="text-xs text-text-dark-secondary">人</div>
          </div>
          <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
            <div className="text-xs text-text-dark-secondary mb-1">三個月內</div>
            <div className="text-xl font-bold text-text-dark-primary">
              {contactFrequency.withinQuarter}
            </div>
            <div className="text-xs text-text-dark-secondary">人</div>
          </div>
          <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
            <div className="text-xs text-text-dark-secondary mb-1">半年以上</div>
            <div className="text-xl font-bold text-text-dark-primary">
              {contactFrequency.overHalfYear}
            </div>
            <div className="text-xs text-text-dark-secondary">人</div>
          </div>
        </div>
      </div>

      {/* 公司分佈 Top 5 */}
      {companyDistribution.length > 0 && (
        <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
          <h3 className="text-lg font-semibold text-text-dark-primary mb-4">🏛️ 公司分佈 Top 5</h3>
          <div className="space-y-2">
            {companyDistribution.map(({ company, count }, index) => (
              <div
                key={company}
                className="flex items-center justify-between p-2 bg-background-dark rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary w-6">{index + 1}</span>
                  <span className="text-sm text-text-dark-primary truncate">{company}</span>
                </div>
                <span className="text-sm text-text-dark-secondary ml-2">{count} 人</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 即將到來的生日 */}
      {upcomingBirthdays.length > 0 && (
        <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
          <h3 className="text-lg font-semibold text-text-dark-primary mb-4">🎂 即將到來的生日</h3>
          <div className="space-y-2">
            {upcomingBirthdays.map(({ contact, daysUntil }) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-2 bg-background-dark rounded-lg"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-dark-primary truncate">
                    {contact.name}
                  </div>
                  <div className="text-xs text-text-dark-secondary">
                    {daysUntil === 0 ? '今天就是生日！' : daysUntil === 1 ? '明天' : `${daysUntil} 天後`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
