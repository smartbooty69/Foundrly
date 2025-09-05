'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import SavedStartupsList from './SavedStartupsList';
import SortFilterModal from './SortFilterModal';

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

interface SavedMainContentProps {
  activeSection: string;
}

// Tab options for saved startups
const savedStartupsTabs = [
  { value: 'all', label: 'All Saved' },
  { value: 'categories', label: 'Categories' },
];

const SavedMainContent = ({ activeSection }: SavedMainContentProps) => {
  const { data: session } = useSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    sortBy: 'newest',
    startDate: {
      month: 'January',
      day: '1',
      year: '2025'
    },
    endDate: {
      month: 'December',
      day: '31',
      year: '2025'
    }
  });

  // Handle categories loaded from child component
  const handleCategoriesLoaded = (loadedCategories: string[]) => {
    setCategories(loadedCategories);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilters(filters);
    console.log('Applied filters:', filters);
  };

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getSortText = () => {
    return currentFilters.sortBy === 'newest' ? 'Newest to oldest' : 'Oldest to newest';
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'saved-startups':
        return 'Saved Startups';
      case 'interested-startups':
        return 'Interested Startups';
      case 'saved-users':
        return 'Saved Users';
      default:
        return 'Saved Startups';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'saved-startups':
        return 'Review and manage your saved startup pitches';
      case 'interested-startups':
        return 'See which startups you\'ve shown interest in';
      case 'saved-users':
        return 'Manage your saved user profiles';
      default:
        return 'Review and manage your saved startup pitches';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 sm:p-8 bg-white border-b border-gray-200">
        {/* Section Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{getSectionTitle()}</h1>
          <p className="text-gray-600 mt-1">
            {getSectionDescription()}
          </p>
        </div>
        
        {/* Fixed Tabs and Filters for Saved Startups Section */}
        {activeSection === 'saved-startups' && (
          <div className="space-y-6">
            {/* Tabs */}
            <nav className="flex items-center space-x-8 border-b border-gray-200 mb-6">
              {savedStartupsTabs.map((tab) => (
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

            {/* Category Tabs or Filters */}
            {selectedTab === 'categories' ? (
              <div className="mb-6">
                <nav className="flex items-center space-x-6 border-b border-gray-200">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`pb-3 font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors
                        ${
                          selectedCategory === category
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 sm:p-8">
          {activeSection === 'saved-startups' ? (
            // Saved Startups Section
            <SavedStartupsList 
              savedStartups={[]} 
              userId={session?.user?.id || ''}
              selectedTab={selectedTab}
              selectedCategory={selectedCategory}
              onCategoriesLoaded={handleCategoriesLoaded}
            />
          ) : activeSection === 'interested-startups' ? (
            // Interested Startups Section
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interested startups yet</h3>
              <p className="text-gray-500 mb-4">
                Start exploring startups and show interest in the ones you find interesting!
              </p>
              <a 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Startups
              </a>
            </div>
          ) : activeSection === 'saved-users' ? (
            // Saved Users Section
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved users yet</h3>
              <p className="text-gray-500 mb-4">
                Start exploring user profiles and save the ones you want to follow!
              </p>
              <a 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Users
              </a>
            </div>
          ) : (
            // Default fallback
            <SavedStartupsList 
              savedStartups={savedStartups || []} 
              userId={session?.user?.id || ''} 
            />
          )}
        </div>
      </div>

      {/* Sort & Filter Modal */}
      <SortFilterModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default SavedMainContent;
