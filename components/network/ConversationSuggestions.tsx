'use client';

import { useState, useEffect } from 'react';
import type { DashboardContact } from '@/types';
import { conversationPlanner } from '@/services/ai';
import { storyManager } from '@/services/vault';
import type { Story } from '@/types';

interface ConversationSuggestionsProps {
  contact: DashboardContact;
}

export function ConversationSuggestions({ contact }: ConversationSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'linkedin' | 'facebook' | 'line' | 'email'>('linkedin');
  const [suggestion, setSuggestion] = useState<string>('');
  const [starters, setStarters] = useState<string[]>([]);

  useEffect(() => {
    loadSuggestions();
  }, [contact, selectedPlatform]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);

      // Get user's stories
      const allStories = await storyManager.getAllStories();

      // Get conversation starters
      const conversationStarters = await conversationPlanner.generateConversationStarters(
        contact as any,
        `職稱：${contact.title}，公司：${contact.company || '未知'}，產業：${contact.industry || '未知'}`
      );

      setStories(allStories);
      setStarters(conversationStarters);

      // Generate conversation plan for selected story (if available)
      if (allStories.length > 0) {
        const topStory = allStories[0];
        const plan = await conversationPlanner.planConversation(
          contact as any,
          topStory,
          selectedPlatform
        );
        setSuggestion(plan.suggested_message);
      } else {
        setSuggestion('');
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼簿');
  };

  const platforms = [
    { id: 'linkedin' as const, label: 'LinkedIn', icon: '🔗' },
    { id: 'facebook' as const, label: 'Facebook', icon: '👍' },
    { id: 'line' as const, label: 'LINE', icon: '💬' },
    { id: 'email' as const, label: 'Email', icon: '✉️' },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-3">🎯 AI 對話建議</h3>

        {/* Platform Selection */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedPlatform === platform.id
                  ? 'bg-primary text-white'
                  : 'bg-background-dark text-text-dark-secondary hover:text-text-dark-primary'
              }`}
            >
              <span>{platform.icon}</span>
              <span>{platform.label}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-text-dark-secondary text-sm">
            生成建議中...
          </div>
        ) : (
          <>
            {/* Conversation Starters */}
            {starters.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-text-dark-secondary mb-2">對話開場：</p>
                <div className="space-y-2">
                  {starters.map((starter, index) => (
                    <div
                      key={index}
                      onClick={() => handleCopyToClipboard(starter)}
                      className="p-3 bg-background-dark rounded-lg border border-border-dark hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-text-dark-primary">{starter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Story-based Suggestion */}
            {stories.length > 0 && suggestion ? (
              <div>
                <p className="text-xs text-text-dark-secondary mb-2">故事分享建議：</p>
                <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
                  <p className="text-sm text-text-dark-primary mb-2">{suggestion}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(suggestion)}
                      className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      複製
                    </button>
                    <a
                      href={selectedPlatform === 'email'
                        ? `mailto:${contact.workEmail || contact.email}?subject=你好&body=${encodeURIComponent(suggestion)}`
                        : selectedPlatform === 'linkedin' && contact.linkedin
                        ? contact.linkedin
                        : '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-background-dark text-text-dark-primary rounded-lg text-xs font-medium text-center hover:bg-surface-dark/80 transition-colors"
                    >
                      前往 {platforms.find(p => p.id === selectedPlatform)?.label}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-text-dark-secondary mt-2">
                  基於故事「{stories[0].title}」生成
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-text-dark-secondary mb-2">
                  還沒有故事可分享
                </p>
                <button
                  onClick={() => (window.location.href = '/vault')}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  前往價值庫
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
