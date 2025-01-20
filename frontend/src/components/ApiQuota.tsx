'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ApiQuota() {
  const [quota, setQuota] = useState<{ used: string; remaining: string } | null>(null);

  useEffect(() => {
    const checkQuota = async () => {
      try {
        const response = await fetch(`${API_URL}/recipes/quota`);
        if (!response.ok) throw new Error('Failed to fetch quota');
        const data = await response.json();
        setQuota(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    checkQuota();
  }, []);

  if (!quota) return null;

  return (
    <div className="text-sm text-gray-600 text-right">
      <p>API Requests Today: {quota.used}</p>
      <p>Remaining: {quota.remaining}</p>
    </div>
  );
} 