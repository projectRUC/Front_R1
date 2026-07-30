import React from 'react';
import { UserProvider } from '@/context/UserContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans">
          <Sidebar />
          <main className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto w-full">
            <DashboardHeader />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}

