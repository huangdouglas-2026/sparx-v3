'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContactEditor } from '@/components/network';
import { contactService } from '@/services/contactService';
import type { DashboardContact } from '@/types';

export default function EditContactPage() {
  const router = useRouter();
  const params = useParams();
  const [contact, setContact] = useState<DashboardContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSave = () => {
    router.push(`/network/${contact?.id}`);
  };

  const handleCancel = () => {
    router.back();
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-surface-dark rounded-lg text-text-dark-primary hover:bg-surface-dark/80 transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-text-dark-primary">編輯聯絡人</h1>
      </div>

      {/* Content */}
      <ContactEditor
        contact={contact}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
