'use client';

import { useState, useEffect } from 'react';
import { ValueDomain, StoryCard, StoryEditor } from '@/components/vault';
import { domainManager, storyManager } from '@/services/vault';
import type { ValueDomain as ValueDomainType, Story } from '@/types';

type View = 'domains' | 'stories' | 'add-story' | 'edit-story';

export default function VaultPage() {
  const [view, setView] = useState<View>('domains');
  const [domains, setDomains] = useState<ValueDomainType[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<ValueDomainType | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDomain, setIsCreatingDomain] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainDescription, setNewDomainDescription] = useState('');

  // Load domains
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setIsLoading(true);
      const data = await domainManager.getDomains();
      setDomains(data);
    } catch (error) {
      console.error('Error loading domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStories = async (domainId: string) => {
    try {
      setIsLoading(true);
      const data = await storyManager.getStories(domainId);
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDomain = async () => {
    if (!newDomainName.trim()) {
      alert('請輸入領域名稱');
      return;
    }

    try {
      const newDomain = await domainManager.createDomain({
        name: newDomainName.trim(),
        description: newDomainDescription.trim(),
      });
      setDomains([newDomain, ...domains]);
      setNewDomainName('');
      setNewDomainDescription('');
      setIsCreatingDomain(false);
    } catch (error) {
      console.error('Error creating domain:', error);
      alert('建立失敗，請稍後再試');
    }
  };

  const handleViewStories = (domain: ValueDomainType) => {
    setSelectedDomain(domain);
    setView('stories');
    loadStories(domain.id);
  };

  const handleAddStory = () => {
    setSelectedStory(undefined);
    setView('add-story');
  };

  const handleEditStory = (story: Story) => {
    setSelectedStory(story);
    setView('edit-story');
  };

  const handleStorySaved = (story: Story) => {
    if (selectedDomain) {
      loadStories(selectedDomain.id);
    }
    setView('stories');
  };

  const handleBackToDomains = () => {
    setSelectedDomain(null);
    setStories([]);
    setView('domains');
  };

  // Render domains view
  const renderDomains = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-dark-primary">💎 價值領域</h2>
        <button
          onClick={() => setIsCreatingDomain(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          + 新增領域
        </button>
      </div>

      {isCreatingDomain && (
        <div className="p-4 bg-surface-dark rounded-xl border border-border-dark space-y-3">
          <input
            type="text"
            value={newDomainName}
            onChange={(e) => setNewDomainName(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
            placeholder="領域名稱"
            autoFocus
          />
          <textarea
            value={newDomainDescription}
            onChange={(e) => setNewDomainDescription(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary resize-none"
            rows={2}
            placeholder="描述此領域..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateDomain}
              className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              建立
            </button>
            <button
              onClick={() => {
                setIsCreatingDomain(false);
                setNewDomainName('');
                setNewDomainDescription('');
              }}
              className="px-4 py-2 bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-text-dark-primary transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-text-dark-secondary">載入中...</div>
      ) : domains.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-dark-secondary mb-4">還沒有任何價值領域</p>
          <p className="text-sm text-text-dark-secondary">
            點擊「新增領域」開始建立你的第一個領域
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <ValueDomain
              key={domain.id}
              domain={domain}
              onUpdate={(updated) => {
                setDomains(domains.map((d) => (d.id === updated.id ? updated : d)));
              }}
              onDelete={() => {
                setDomains(domains.filter((d) => d.id !== domain.id));
              }}
              onViewStories={() => handleViewStories(domain)}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Render stories view
  const renderStories = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleBackToDomains}
          className="p-2 bg-surface-dark rounded-lg text-text-dark-primary hover:bg-surface-dark/80 transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-dark-primary">
            {selectedDomain?.icon} {selectedDomain?.name}
          </h2>
          <p className="text-sm text-text-dark-secondary">
            {stories.length} 個故事
          </p>
        </div>
        <button
          onClick={handleAddStory}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          + 新增故事
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-text-dark-secondary">載入中...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-dark-secondary mb-4">此領域還沒有任何故事</p>
          <p className="text-sm text-text-dark-secondary">
            點擊「新增故事」開始記錄你的經驗
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onUpdate={(updated) => {
                setStories(stories.map((s) => (s.id === updated.id ? updated : s)));
              }}
              onDelete={() => {
                setStories(stories.filter((s) => s.id !== story.id));
              }}
              onUse={() => handleEditStory(story)}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Render story editor view
  const renderStoryEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setView('stories')}
          className="p-2 bg-surface-dark rounded-lg text-text-dark-primary hover:bg-surface-dark/80 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-text-dark-primary">
          {selectedStory ? '編輯故事' : '新增故事'}
        </h2>
      </div>

      <StoryEditor
        domains={domains}
        story={selectedStory}
        onSave={handleStorySaved}
        onCancel={() => setView('stories')}
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-dark-primary mb-2">價值庫</h1>
        <p className="text-text-dark-secondary">您的知識與經驗資產庫</p>
      </div>

      {view === 'domains' && renderDomains()}
      {view === 'stories' && renderStories()}
      {(view === 'add-story' || view === 'edit-story') && renderStoryEditor()}
    </div>
  );
}
