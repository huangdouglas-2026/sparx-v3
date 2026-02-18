'use client';

import { useState } from 'react';
import type { DashboardContact } from '@/types';

interface ContactListProps {
  contacts: DashboardContact[];
  onContactClick?: (contact: DashboardContact) => void;
  isEditMode?: boolean;
  selectedIds?: Set<string>;
}

type SortOption = 'name' | 'company' | 'lastContact';
type FilterCategory = 'all' | 'weekly' | 'monthly' | 'restart';

export function ContactList({ contacts, onContactClick, isEditMode = false, selectedIds = new Set() }: ContactListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('lastContact');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((contact) => {
      // Category filter
      if (filterCategory !== 'all' && contact.category !== filterCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          contact.name.toLowerCase().includes(query) ||
          contact.company?.toLowerCase().includes(query) ||
          contact.title.toLowerCase().includes(query) ||
          contact.industry?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-TW');
        case 'company':
          return (a.company || '').localeCompare(b.company || '', 'zh-TW');
        case 'lastContact':
          return new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
        default:
          return 0;
      }
    });

  const getCategoryColor = (category: FilterCategory) => {
    const colors = {
      all: 'bg-gray-500/10 text-gray-400',
      weekly: 'bg-blue-500/10 text-blue-400',
      monthly: 'bg-green-500/10 text-green-400',
      restart: 'bg-orange-500/10 text-orange-400',
    };
    return colors[category];
  };

  const getCategoryLabel = (category: DashboardContact['category']) => {
    const labels = {
      weekly: '每週',
      monthly: '每月',
      restart: '重新啟動',
    };
    return labels[category] || category;
  };

  const formatLastContact = (date: string) => {
    const now = new Date();
    const contactDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-text-dark-primary placeholder-text-dark-secondary focus:outline-none focus:border-primary"
          placeholder="搜尋姓名、公司、職稱..."
        />

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'weekly', 'monthly', 'restart'] as FilterCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-background-dark text-text-dark-secondary hover:text-text-dark-primary'
              }`}
            >
              {category === 'all' ? '全部' : getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-dark-secondary">
            顯示 {filteredContacts.length} 位聯絡人
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 bg-background-dark border border-border-dark rounded-lg text-sm text-text-dark-primary focus:outline-none focus:border-primary"
          >
            <option value="lastContact">最近聯繫</option>
            <option value="name">姓名排序</option>
            <option value="company">公司排序</option>
          </select>
        </div>
      </div>

      {/* Contact List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-dark-secondary">
            {searchQuery || filterCategory !== 'all'
              ? '沒有找到符合的聯絡人'
              : '還沒有任何聯絡人'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContacts.map((contact) => {
            const isSelected = selectedIds.has(contact.id);

            return (
              <div
                key={contact.id}
                onClick={() => onContactClick?.(contact)}
                className={`p-3 bg-surface-dark rounded-lg border transition-colors ${
                  isEditMode
                    ? `cursor-pointer hover:border-primary/50 ${isSelected ? 'border-primary bg-primary/10' : 'border-border-dark'}`
                    : 'border-border-dark hover:border-primary/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Selection Checkbox (only in edit mode) */}
                  {isEditMode && (
                    <div className="flex items-center justify-center w-6 h-6">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onContactClick?.(contact)}
                        className="w-5 h-5 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
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

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-text-dark-primary truncate">
                      {contact.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(contact.category)}`}>
                      {getCategoryLabel(contact.category)}
                    </span>
                  </div>
                  <p className="text-sm text-text-dark-secondary truncate">
                    {contact.title}
                    {contact.company && ` @ ${contact.company}`}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-dark-secondary">
                    <span>📅 {formatLastContact(contact.lastContact)}</span>
                    {contact.industry && <span>🏢 {contact.industry}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  {contact.linkedin && (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-text-dark-secondary hover:text-[#0077b5] transition-colors"
                      title="LinkedIn"
                    >
                      🔗
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-text-dark-secondary hover:text-primary transition-colors"
                      title="Email"
                    >
                      ✉️
                    </a>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
