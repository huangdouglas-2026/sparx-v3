'use client';

import { useState } from 'react';
import type { ValueDomain } from '@/types';
import { domainManager } from '@/services/vault';
import { storyManager } from '@/services/vault';

interface ValueDomainProps {
  domain: ValueDomain;
  onUpdate?: (domain: ValueDomain) => void;
  onDelete?: () => void;
  onViewStories?: () => void;
}

export function ValueDomain({
  domain,
  onUpdate,
  onDelete,
  onViewStories,
}: ValueDomainProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(domain.name);
  const [editDescription, setEditDescription] = useState(domain.description);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updated = await domainManager.updateDomain(domain.id, {
        name: editName,
        description: editDescription,
      });
      setIsEditing(false);
      onUpdate?.(updated);
    } catch (error) {
      console.error('Error updating domain:', error);
      alert('更新失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${domain.name}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      setIsLoading(true);
      await domainManager.deleteDomain(domain.id);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting domain:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
            placeholder="領域名稱"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary resize-none"
            rows={3}
            placeholder="描述這個領域..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !editName.trim()}
              className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isLoading ? '儲存中...' : '儲存'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-text-dark-primary transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark hover:border-primary/50 transition-colors cursor-pointer"
         onClick={onViewStories}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${domain.color}20` }}
        >
          {domain.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-dark-primary truncate">
            {domain.name}
          </h3>
          <p className="text-sm text-text-dark-secondary line-clamp-2 mt-1">
            {domain.description || '暂無描述'}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-dark-secondary">
            <span className="flex items-center gap-1">
              📖 {domain.story_count} 個故事
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-text-dark-secondary hover:text-primary transition-colors"
            title="編輯"
          >
            ✏️
          </button>
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
