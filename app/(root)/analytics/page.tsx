"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AnalyticsSidebar from "@/components/AnalyticsSidebar";
import AnalyticsMainContent from "@/components/AnalyticsMainContent";
import UserSidebarWrapper from "@/components/UserSidebarWrapper";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState('engagement-audience');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  if (!session?.user?.id) {
    return (
      <div className="h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white text-gray-900 overflow-hidden">
      <div className="flex h-full">
        <AnalyticsSidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          heading="Your Analytics"
        />
        <div className="flex-1 flex">
          <AnalyticsMainContent 
            activeSection={activeSection}
          />
          <UserSidebarWrapper 
            userId={session.user.id} 
            isOwnProfile={true} 
          />
        </div>
      </div>
    </div>
  );
}
