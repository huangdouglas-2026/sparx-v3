'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContactProfile, ConversationSuggestions, InteractionHistory } from '@/components/network';
import { contactService } from '@/services/contactService';
import type { DashboardContact } from '@/types';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [contact, setContact] = useState<DashboardContact | null>(null);

  useEffect(() => {
    if (params.id) {
      loadContact(params.id as string);
    }
  }, [params.id]);

  const loadContact = async (id: string) => {
    try {
      setIsLoading(true);
      const contacts = await contactService.getContacts();
      const foundContact = contacts.find((c) => c.id === id);

      if (!foundContact) {
        alert('找不到聯絡人');
        router.back();
        return;
      }

      setContact(foundContact);
    } catch (error) {
      console.error('Error loading contact:', error);
      alert('載入失敗');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-text-dark-secondary">
          載入中...
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-dark-secondary">找不到聯絡人</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-surface-dark rounded-lg text-text-dark-primary hover:bg-surface-dark/80 transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-text-dark-primary">聯絡人詳情</h1>
        </div>
        <button
          onClick={() => router.push(`/network/${contact.id}/edit`)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span>✏️</span>
          <span>編輯</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 pb-20">
        <ContactProfile contact={contact} />
        <InteractionHistory contact={contact} />
        <ConversationSuggestions contact={contact} />
      </div>
    </div>
  );
}
