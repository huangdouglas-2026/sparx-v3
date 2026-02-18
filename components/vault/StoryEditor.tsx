'use client';

import { useState, useEffect } from 'react';
import type { Story, ValueDomain } from '@/types';
import { storyManager } from '@/services/vault';

interface StoryEditorProps {
  domains: ValueDomain[];
  story?: Story;
  onSave?: (story: Story) => void;
  onCancel?: () => void;
}

export function StoryEditor({ domains, story, onSave, onCancel }: StoryEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(story?.domain_id || '');
  const [title, setTitle] = useState(story?.title || '');
  const [content, setContent] = useState(story?.content || '');
  const [tags, setTags] = useState<string[]>(story?.tags || []);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (story) {
      setSelectedDomainId(story.domain_id);
      setTitle(story.title);
      setContent(story.content);
      setTags(story.tags || []);
    }
  }, [story]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!selectedDomainId || !title.trim() || !content.trim()) {
      alert('請填寫所有必填欄位');
      return;
    }

    try {
      setIsLoading(true);

      let savedStory: Story;

      if (story) {
        // Update existing story
        savedStory = await storyManager.updateStory(story.id, {
          domain_id: selectedDomainId,
          title: title.trim(),
          content: content.trim(),
          tags,
        });
      } else {
        // Create new story
        savedStory = await storyManager.createStory({
          domain_id: selectedDomainId,
          title: title.trim(),
          content: content.trim(),
          tags,
        });
      }

      onSave?.(savedStory);

      // Reset form for new story
      if (!story) {
        setSelectedDomainId('');
        setTitle('');
        setContent('');
        setTags([]);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDomain = domains.find((d) => d.id === selectedDomainId);

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <h3 className="text-lg font-semibold text-text-dark-primary mb-4">
        {story ? '編輯故事' : '新增故事'}
      </h3>

      <div className="space-y-4">
        {/* Domain Selection */}
        <div>
          <label className="block text-sm font-medium text-text-dark-primary mb-2">
            選擇領域 <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDomainId}
            onChange={(e) => setSelectedDomainId(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
          >
            <option value="">請選擇領域</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.icon} {domain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-dark-primary mb-2">
            故事標題 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
            placeholder="例如：如何用數據說服客戶"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text-dark-primary mb-2">
            故事內容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary resize-none"
            rows={6}
            placeholder="描述你的故事或經驗..."
          />
          <p className="text-xs text-text-dark-secondary mt-1">
            {content.length} 字元
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-dark-primary mb-2">
            標籤
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="輸入標籤後按 Enter"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              新增
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-2"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        {selectedDomain && (
          <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
            <p className="text-xs text-text-dark-secondary mb-1">預覽：</p>
            <p className="text-sm text-text-dark-primary">
              <span className="mr-1">{selectedDomain.icon}</span>
              {selectedDomain.name}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isLoading || !selectedDomainId || !title.trim() || !content.trim()}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            {isLoading ? '儲存中...' : story ? '更新' : '新增故事'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 bg-background-dark text-text-dark-secondary rounded-xl font-semibold hover:text-text-dark-primary transition-colors"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
