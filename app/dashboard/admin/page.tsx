"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { StatsOverview } from '@/components/dashboard/admin/stats-overview';
import { RecentFilers } from '@/components/dashboard/admin/recent-filers';
import { UsersTable } from '@/components/dashboard/admin/users-table';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    
    // Get current user information
    const currentUser = getCurrentUser();
    if (currentUser) {
      if (currentUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(currentUser);
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#af0e0e] border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview and management of Befiler platform
        </p>
      </div>
      
      <div className="space-y-8">
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentFilers />
        </div>
        
        <UsersTable />
      </div>
    </div>
  );
}