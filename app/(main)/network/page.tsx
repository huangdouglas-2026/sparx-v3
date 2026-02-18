'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContactList, BusinessCardScanner, NetworkAnalytics } from '@/components/network';
import { contactService } from '@/services/contactService';
import type { DashboardContact } from '@/types';

type ViewMode = 'list' | 'analytics';

export default function NetworkPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<DashboardContact[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    loadContacts();
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

  const handleContactClick = (contact: DashboardContact) => {
    if (isEditMode) {
      // Toggle selection
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(contact.id)) {
          newSet.delete(contact.id);
        } else {
          newSet.add(contact.id);
        }
        return newSet;
      });
    } else {
      router.push(`/network/${contact.id}`);
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedIds(new Set());
  };

  const handleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `確定要刪除 ${selectedIds.size} 個聯絡人嗎？此操作無法復原。`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      for (const id of selectedIds) {
        await contactService.deleteContact(id);
      }
      await loadContacts();
      setSelectedIds(new Set());
      setIsEditMode(false);
      alert('聯絡人已刪除');
    } catch (error) {
      console.error('Error deleting contacts:', error);
      alert('刪除失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark-primary mb-1">人脈</h1>
          <p className="text-text-dark-secondary">
            {isEditMode
              ? `已選擇 ${selectedIds.size} 個聯絡人`
              : `您的人脈網絡管理 (${contacts.length})`
            }
          </p>
        </div>
        {contacts.length > 0 && (
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                {/* Edit Mode Actions */}
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-surface-dark border border-border-dark text-text-dark-primary rounded-lg font-medium hover:bg-surface-dark/80 transition-colors"
                >
                  {selectedIds.size === contacts.length ? '取消全選' : '全選'}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>刪除 ({selectedIds.size})</span>
                </button>
                <button
                  onClick={handleToggleEditMode}
                  className="px-4 py-2 bg-surface-dark border border-border-dark text-text-dark-primary rounded-lg font-medium hover:bg-surface-dark/80 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <>
                {/* View Mode Toggle (only in normal mode) */}
                <div className="flex bg-surface-dark border border-border-dark rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-white'
                        : 'text-text-dark-secondary hover:text-text-dark-primary'
                    }`}
                  >
                    📋 清單
                  </button>
                  <button
                    onClick={() => setViewMode('analytics')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'analytics'
                        ? 'bg-primary text-white'
                        : 'text-text-dark-secondary hover:text-text-dark-primary'
                    }`}
                  >
                    📊 分析
                  </button>
                </div>

                {/* Normal Mode Actions */}
                <button
                  onClick={handleToggleEditMode}
                  className="px-4 py-2 bg-surface-dark border border-border-dark text-text-dark-primary rounded-lg font-medium hover:bg-surface-dark/80 transition-colors flex items-center gap-2"
                >
                  <span>✏️</span>
                  <span>管理</span>
                </button>
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2 bg-surface-dark border border-border-dark text-text-dark-primary rounded-lg font-medium hover:bg-surface-dark/80 transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">📷</span>
                  <span>掃描</span>
                </button>
                <button
                  onClick={() => router.push('/network/new')}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span>新增</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
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
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowScanner(true)}
              className="px-6 py-2 bg-surface-dark border border-border-dark text-text-dark-primary rounded-lg font-medium hover:bg-surface-dark/80 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">📷</span>
              <span>掃描名片</span>
            </button>
            <button
              onClick={() => router.push('/network/new')}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              手動新增
            </button>
          </div>
        </div>
      ) : viewMode === 'analytics' ? (
        /* Analytics View */
        <NetworkAnalytics contacts={contacts} />
      ) : (
        /* List View */
        <ContactList
          contacts={contacts}
          onContactClick={handleContactClick}
          isEditMode={isEditMode}
          selectedIds={selectedIds}
        />
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <BusinessCardScanner
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
