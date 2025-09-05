'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Activity, 
  Bookmark, 
  Heart,
  Moon, 
  Sun, 
  Flag, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface UserSidebarProps {
  userId: string;
  isOwnProfile: boolean;
}

const UserSidebar = ({ userId, isOwnProfile }: UserSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const sidebarItems = [
    {
      name: 'Settings',
      icon: Settings,
      href: '/settings',
      description: 'Manage user preferences and configurations'
    },
    {
      name: 'Your activity',
      icon: Activity,
      href: '/activity',
      description: 'View past interactions and usage'
    },
    {
      name: 'Saved',
      icon: Bookmark,
      href: '/saved',
      description: 'Access content that has been bookmarked'
    },
    {
      name: 'Interested',
      icon: Heart,
      href: '/interested',
      description: 'View startups you\'ve shown interest in'
    },
    {
      name: 'Switch appearance',
      icon: theme === 'dark' ? Sun : Moon,
      href: '#',
      description: 'Change the theme, for example, from light mode to dark mode',
      onClick: toggleTheme
    },
    {
      name: 'Report a problem',
      icon: Flag,
      href: '/report',
      description: 'Notify the developers about an issue or bug'
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleReportProblem = () => {
    console.log('Report problem clicked');
  };

  const handleItemClick = (item: any) => {
    if (item.name === 'Report a problem') {
      handleReportProblem();
    } else if (item.name === 'Switch appearance') {
      item.onClick();
    }
  };

  if (!isOwnProfile) {
    return null;
  }

  return (
    <div 
      className={cn(
        'sidebar-fixed transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-80',
        theme === 'dark' 
          ? 'bg-gray-900 border-l border-gray-700' 
          : 'bg-white border-l border-gray-200'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -left-3 top-28 rounded-full p-1 transition-colors',
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-600 hover:bg-gray-700'
            : 'bg-white border border-gray-200 hover:bg-gray-50'
        )}
      >
        {isCollapsed ? (
          <ChevronLeft className={cn(
            'w-4 h-4',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )} />
        ) : (
          <ChevronRight className={cn(
            'w-4 h-4',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )} />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="pt-20 p-4 h-full">
        <nav className={cn(
          isCollapsed ? 'space-y-2' : 'space-y-2'
        )}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            
            if (isCollapsed) {
              if (item.href === '#') {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'w-full p-3 rounded-lg transition-colors group relative flex items-center justify-center',
                      theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-100'
                    )}
                    title={item.description}
                  >
                    <Icon className={cn(
                      'w-5 h-5 mx-auto block',
                      theme === 'dark'
                        ? 'text-gray-400 group-hover:text-white'
                        : 'text-gray-600 group-hover:text-gray-900'
                    )} />
                    
                    {/* Tooltip for collapsed state */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {item.name}
                    </div>
                  </button>
                );
              } else {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'w-full p-3 rounded-lg transition-colors group relative flex items-center justify-center',
                      theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-100'
                    )}
                    title={item.description}
                  >
                    <Icon className={cn(
                      'w-5 h-5 mx-auto block',
                      theme === 'dark'
                        ? 'text-gray-400 group-hover:text-white'
                        : 'text-gray-600 group-hover:text-gray-900'
                    )} />
                    
                    {/* Tooltip for collapsed state */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {item.name}
                    </div>
                  </Link>
                );
              }
            }

            return (
              <div key={item.name}>
                {item.href === '#' ? (
                  <button
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )} />
                    <div>
                      <div className={cn(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {item.name}
                      </div>
                      <div className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )} />
                    <div>
                      <div className={cn(
                        'font-medium',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {item.name}
                      </div>
                      <div className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default UserSidebar;
