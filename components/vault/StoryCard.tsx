'use client';

import { useState } from 'react';
import type { Story } from '@/types';
import { storyManager } from '@/services/vault';

interface StoryCardProps {
  story: Story;
  onUpdate?: (story: Story) => void;
  onDelete?: () => void;
  onUse?: () => void;
}

export function StoryCard({ story, onUpdate, onDelete, onUse }: StoryCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${story.title}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      setIsLoading(true);
      await storyManager.deleteStory(story.id);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
  };

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-text-dark-primary truncate">
            {story.title}
          </h4>
          <p
            className={`text-sm text-text-dark-secondary mt-2 ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
          >
            {story.content}
          </p>
          {story.content.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline mt-1"
            >
              {isExpanded ? '收起' : '展開更多'}
            </button>
          )}

          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {story.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-text-dark-secondary">
            <span className="flex items-center gap-1">
              📊 使用 {story.usage_count} 次
            </span>
            <span className="flex items-center gap-1">
              ✨ 成功率 {story.success_rate.toFixed(0)}%
            </span>
            {story.last_used_at && (
              <span className="flex items-center gap-1">
                🕐 {formatDate(story.last_used_at)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {onUse && (
            <button
              onClick={onUse}
              disabled={isLoading}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              title="使用此故事"
            >
              使用
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-1.5 text-text-dark-secondary hover:text-red-500 transition-colors"
            title="刪除"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
