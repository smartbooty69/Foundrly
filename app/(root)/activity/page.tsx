'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ActivitySidebar from "@/components/ActivitySidebar";
import ActivityMainContent from "@/components/ActivityMainContent";

export default function ActivityPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState('interactions');

  // Debug: Log state changes
  console.log('ActivityPage state:', { activeSection, session: !!session?.user?.id });

  const handleSectionChange = (section: string) => {
    console.log('ActivityPage: Section change requested:', section);
    setActiveSection(section);
  };

  if (!session?.user?.id) {
    return (
      <div className="h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-gray-900 overflow-hidden">
      <div className="flex h-full">
        <ActivitySidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <ActivityMainContent activeSection={activeSection} />
      </div>
    </div>
  );
}
