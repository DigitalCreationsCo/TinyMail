import { useEffect, useState } from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import Header from './Header';
import Drawer from './Drawer';
import { useRouter } from 'next/navigation';

export default function AppShell({ children }) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/auth/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return;
  }

  return (
    <div>
      <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
