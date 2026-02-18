'use client';

import { useState, useEffect } from 'react';
import type { DashboardContact } from '@/types';
import { conversationPlanner } from '@/services/ai';
import { storyManager } from '@/services/vault';

interface ActionCardProps {
  contacts: DashboardContact[];
}

export function ActionCard({ contacts }: ActionCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<DashboardContact | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (contacts.length > 0) {
      // Select a contact that needs attention (not contacted recently)
      const needsAttention = contacts
        .sort((a, b) => new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime())
        .slice(0, 1)[0];

      setSelectedContact(needsAttention || contacts[0]);
    }
  }, [contacts]);

  useEffect(() => {
    if (selectedContact) {
      loadSuggestions();
    }
  }, [selectedContact]);

  const loadSuggestions = async () => {
    if (!selectedContact) return;

    try {
      setIsLoading(true);

      // Get conversation starters
      const starters = await conversationPlanner.generateConversationStarters(
        selectedContact,
        `職稱：${selectedContact.title}，公司：${selectedContact.company || '未知'}，產業：${selectedContact.industry || '未知'}`
      );

      setSuggestions(starters);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        `嗨 ${selectedContact.name}，最近在 ${selectedContact.company || '工作'} 還順利嗎？`,
        `${selectedContact.name}，有什麼我可以幫忙的嗎？`,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼簿');
  };

  if (!selectedContact) {
    return (
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-lg font-semibold text-text-dark-primary">互動建議</h2>
        </div>
        <div className="text-center py-4">
          <p className="text-text-dark-secondary">請先新增聯絡人</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">💡</span>
        <h2 className="text-lg font-semibold text-text-dark-primary">互動建議</h2>
      </div>

      {/* Contact Info */}
      <div className="p-3 bg-background-dark rounded-lg mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-xl">
            {selectedContact.avatarUrl ? (
              <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-10 h-10 rounded-full" />
            ) : (
              '👤'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-dark-primary truncate">
              {selectedContact.name}
            </h3>
            <p className="text-xs text-text-dark-secondary truncate">
              {selectedContact.title} {selectedContact.company ? `@ ${selectedContact.company}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {isLoading ? (
        <div className="text-center py-4 text-text-dark-secondary text-sm">
          生成建議中...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-text-dark-secondary mb-2">對話開場建議：</p>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 bg-background-dark rounded-lg border border-border-dark hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => handleCopyToClipboard(suggestion)}
            >
              <p className="text-sm text-text-dark-primary">{suggestion}</p>
              <p className="text-xs text-text-dark-secondary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                點擊複製
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-text-dark-secondary text-sm">暫無建議</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {selectedContact.linkedin && (
          <a
            href={selectedContact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 bg-[#0077b5] text-white text-center rounded-lg text-sm font-medium hover:bg-[#0077b5]/90 transition-colors"
          >
            LinkedIn
          </a>
        )}
        {selectedContact.email && (
          <a
            href={`mailto:${selectedContact.email}`}
            className="flex-1 py-2 bg-primary text-white text-center rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Email
          </a>
        )}
      </div>
    </div>
  );
}
