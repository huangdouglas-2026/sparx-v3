'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContactEditor } from '@/components/network';
import type { DashboardContact } from '@/types';

export default function NewContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scannedData, setScannedData] = useState<Partial<DashboardContact> | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam)) as Partial<DashboardContact>;
        setScannedData(data);
      } catch (error) {
        console.error('Error parsing scanned data:', error);
      }
    }
  }, [searchParams]);

  const handleSave = () => {
    router.push('/network');
  };

  const handleCancel = () => {
    router.back();
  };

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
        <h1 className="text-xl font-bold text-text-dark-primary">
          {scannedData ? '確認聯絡人資訊' : '新增聯絡人'}
        </h1>
      </div>

      {/* Content */}
      <ContactEditor
        initialData={scannedData}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
