'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Help Me Recipe</h1>
            <UserMenu />
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
} 