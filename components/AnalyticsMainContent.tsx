"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ActivityContentGrid from './ActivityContentGrid';
import SortFilterModal from './SortFilterModal';
import StartupAnalyticsDashboard from './StartupAnalyticsDashboard';

interface FilterState {
  sortBy: 'newest' | 'oldest';
  startDate: {
    month: string;
    day: string;
    year: string;
  };
  endDate: {
    month: string;
    day: string;
    year: string;
  };
}

interface AnalyticsMainContentProps {
  activeSection: string;
}

const interactionTabs = [
  { value: 'likes', label: 'Likes' },
  { value: 'dislikes', label: 'Dislikes' },
  { value: 'comments', label: 'Comments' },
  { value: 'views', label: 'Views' },
];

export default function AnalyticsMainContent({ activeSection }: AnalyticsMainContentProps) {
  const { data: session } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('likes');
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    sortBy: 'newest',
    startDate: { month: 'January', day: '1', year: '2025' },
    endDate: { month: 'December', day: '31', year: '2025' }
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);
  };

  const getSortText = () => currentFilters.sortBy === 'newest' ? 'Newest to oldest' : 'Oldest to newest';

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'engagement-audience':
        return 'Engagement & Network';
      case 'startup-analytics':
      default:
        return 'Startup Analytics';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'engagement-audience':
        return 'Track likes, dislikes, comments, views, and your follower network growth';
      case 'startup-analytics':
      default:
        return 'Compare your startups with market benchmarks and similar startups using AI-powered analytics';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 sm:p-8 bg-white border-b border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{getSectionTitle()}</h1>
          <p className="text-gray-600 mt-1">{getSectionDescription()}</p>
        </div>

        {activeSection === 'engagement-audience' && (
          <div className="space-y-6">
            {/* Tabs */}
            <nav className="flex items-center space-x-8 border-b border-gray-200 mb-6">
              {interactionTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`pb-3 font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors
                    ${
                      selectedTab === tab.value
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Filters */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-sm sm:text-base">{getSortText()}</h3>
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleOpenModal}
                  className="font-semibold text-sm hover:text-primary transition-colors"
                >
                  Sort & filter
                </button>
                <button className="font-semibold text-sm text-blue-500 hover:text-blue-400">
                  Select
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={activeSection === 'engagement-audience' ? 'p-4 pt-2 sm:pt-4 sm:px-8' : 'p-4 sm:p-8'}>
          {activeSection === 'engagement-audience' ? (
            <ActivityContentGrid 
              activityType={selectedTab}
              userId={session?.user?.id}
              filters={currentFilters}
              onlyOwnStartups={true}
            />
          ) : (
            <div className="space-y-6">
              {selectedStartupId ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedStartupId(null)}
                      className="flex items-center gap-2"
                    >
                      ← Back to Startup List
                    </Button>
                    <h2 className="text-xl font-semibold">Startup Analytics Dashboard</h2>
                  </div>
                  <StartupAnalyticsDashboard startupId={selectedStartupId} />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select a Startup to Analyze</h2>
                  <p className="text-gray-600 mb-6">
                    Choose one of your startups to see detailed market comparison analytics, AI insights, and performance metrics.
                  </p>
                  
                  {/* Category Tabs */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-8 border-b border-gray-200">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`pb-3 font-semibold text-sm tracking-wider uppercase transition-colors ${
                          selectedCategory === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedCategory('technology')}
                        className={`pb-3 font-semibold text-sm tracking-wider uppercase transition-colors ${
                          selectedCategory === 'technology'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Technology
                      </button>
                      <button
                        onClick={() => setSelectedCategory('healthcare')}
                        className={`pb-3 font-semibold text-sm tracking-wider uppercase transition-colors ${
                          selectedCategory === 'healthcare'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Healthcare
                      </button>
                      <button
                        onClick={() => setSelectedCategory('finance')}
                        className={`pb-3 font-semibold text-sm tracking-wider uppercase transition-colors ${
                          selectedCategory === 'finance'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Finance
                      </button>
                      <button
                        onClick={() => setSelectedCategory('e-commerce')}
                        className={`pb-3 font-semibold text-sm tracking-wider uppercase transition-colors ${
                          selectedCategory === 'e-commerce'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        E-commerce
                      </button>
                      <button
                        onClick={() => setSelectedCategory('education')}
                        className={`pb-3 font-semibold text-sm tracking-wider uppercase transition-colors ${
                          selectedCategory === 'education'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Education
                      </button>
                    </div>
                  </div>
                  
                  <ActivityContentGrid 
                    activityType="startup-selection"
                    userId={session?.user?.id}
                    filters={currentFilters}
                    onlyOwnStartups={true}
                    onStartupSelect={setSelectedStartupId}
                    selectedCategory={selectedCategory}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sort & Filter Modal */}
      {activeSection === 'engagement-audience' && (
        <SortFilterModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApply={handleApplyFilters}
        />
      )}
    </div>
  );
}
