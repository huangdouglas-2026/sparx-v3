'use client';

import { useState, useEffect } from 'react';
import type { DashboardContact, MatchResult } from '@/types';
import { storyMatcher } from '@/services/ai';
import { storyManager } from '@/services/vault';

interface ImpactZoneProps {
  contacts: DashboardContact[];
}

export function ImpactZone({ contacts }: ImpactZoneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    loadImpactOpportunities();
  }, [contacts]);

  const loadImpactOpportunities = async () => {
    try {
      setIsLoading(true);

      // Get all user stories
      const stories = await storyManager.getAllStories();

      if (stories.length === 0) {
        setMatches([]);
        setIsLoading(false);
        return;
      }

      // Get top contacts based on relationship score and recent interaction
      const topContacts = contacts
        .sort((a, b) => {
          // Prioritize contacts with lower relationship score (need more attention)
          // or those who haven't been contacted recently
          const dateA = new Date(a.lastContact).getTime();
          const dateB = new Date(b.lastContact).getTime();
          return dateA - dateB;
        })
        .slice(0, 5);

      // Match stories with contacts
      const allMatches: MatchResult[] = [];

      for (const contact of topContacts) {
        // Create a mock activity for matching
        const activity = {
          contact_id: contact.id,
          platform: 'linkedin' as const,
          activity_type: 'post' as const,
          content: `${contact.title} at ${contact.company || 'Unknown'} - ${contact.industry || 'Unknown industry'}`,
          created_at: new Date().toISOString(),
        };

        const contactMatches = await storyMatcher.matchStories(activity, stories);
        allMatches.push(...contactMatches);
      }

      // Sort by score and get top 3
      const topMatches = allMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(topMatches);
    } catch (error) {
      console.error('Error loading impact opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContactInfo = (contactId: string) => {
    return contacts.find((c) => c.id === contactId);
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔥</span>
          <h2 className="text-lg font-semibold text-text-dark-primary">今日機會</h2>
        </div>
        <div className="text-center py-4 text-text-dark-secondary">載入中...</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔥</span>
          <h2 className="text-lg font-semibold text-text-dark-primary">今日機會</h2>
        </div>
        <div className="text-center py-4">
          <p className="text-text-dark-secondary mb-2">尚無今日機會</p>
          <p className="text-xs text-text-dark-secondary">
            {contacts.length === 0 ? '請先新增聯絡人' : '請先在價值庫建立故事'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <h2 className="text-lg font-semibold text-text-dark-primary">今日機會</h2>
        <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
          {matches.length} 個機會
        </span>
      </div>

      <div className="space-y-3">
        {matches.map((match, index) => {
          const contact = getContactInfo(match.story.user_id);
          return (
            <div
              key={`${match.story.id}-${index}`}
              className="p-3 bg-background-dark rounded-lg border border-border-dark hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-dark-primary truncate">
                    {match.story.title}
                  </h3>
                  <p className="text-xs text-text-dark-secondary line-clamp-2 mt-1">
                    {match.reason}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      相關度 {match.score}%
                    </span>
                    {match.story.success_rate > 0 && (
                      <span className="text-xs text-text-dark-secondary">
                        成功率 {match.story.success_rate.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {match.suggested_message && (
                <div className="mt-2 pt-2 border-t border-border-dark">
                  <p className="text-xs text-text-dark-secondary mb-1">建議訊息：</p>
                  <p className="text-xs text-text-dark-primary italic">
                    {match.suggested_message}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
