'use client';

import { useEffect, useState } from 'react';
import ActivityGridItem from './ActivityGridItem';
import StartupCard from './StartupCard';
import { client } from '@/sanity/lib/client';
import { USER_ACTIVITY_QUERY, TEST_REPORTS_QUERY, ALL_REPORTS_QUERY, STARTUP_IDS_FROM_REPORTS_QUERY, STARTUPS_BY_IDS_QUERY, USER_REPORTED_CONTENT_QUERY } from '@/sanity/lib/activity-queries';
import InlineSparkline from './InlineSparkline';
import AnalyticsPeriodSparkline from './AnalyticsPeriodSparkline';

interface StartupData {
  _id: string;
  title: string;
  slug: { current: string };
  _createdAt: string;
  author: {
    _id: string;
    name: string;
    image?: string;
    bio?: string;
  };
  views: number;
  description: string;
  category: string;
  image?: string;
  likes: number;
  dislikes: number;
  commentsCount: number;
  activityType: string;
  userComments?: Array<{
    _id: string;
    text: string;
    createdAt: string;
    likes: number;
    dislikes: number;
  }>;
  userReports?: Array<{
    _id: string;
    reason: string;
    timestamp: string;
    status: string;
  }>;
}

interface CommentData {
  _id: string;
  text: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  parentComment?: {
    _id: string;
    text: string;
    author?: {
      _id: string;
      name: string;
    };
  };
  startup: {
    _id: string;
    title: string;
    slug: { current: string };
    image?: string;
  };
  author: {
    _id: string;
    name: string;
    image?: string;
  };
  userReports: Array<{
    _id: string;
    reason: string;
    timestamp: string;
    status: string;
  }>;
}

interface ReportedContentData {
  startups: StartupData[];
  comments: CommentData[];
}

interface ActivityContentGridProps {
  activityType: string;
  userId?: string;
  filters?: {
    sortBy: 'newest' | 'oldest';
    startDate?: {
      month: string;
      day: string;
      year: string;
    };
    endDate?: {
      month: string;
      day: string;
      year: string;
    };
  };
  onlyOwnStartups?: boolean;
  onStartupSelect?: (startupId: string) => void;
  selectedCategory?: string;
}

const ActivityContentGrid = ({ activityType, userId, filters, onlyOwnStartups, onStartupSelect, selectedCategory }: ActivityContentGridProps) => {
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      if (!userId) {
        setStartups([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert date filters to ISO strings if provided
        let startDate, endDate;
        if (filters?.startDate && filters?.endDate) {
          startDate = new Date(
            parseInt(filters.startDate.year),
            new Date(`${filters.startDate.month} 1, ${filters.startDate.year}`).getMonth(),
            parseInt(filters.startDate.day)
          ).toISOString();
          
          endDate = new Date(
            parseInt(filters.endDate.year),
            new Date(`${filters.endDate.month} 1, ${filters.endDate.year}`).getMonth(),
            parseInt(filters.endDate.day)
          ).toISOString();
        }

        let data;
        
        if (activityType === 'reviews') {
          // Use the new query for reports that handles both startups and comments
          data = await client.fetch(USER_REPORTED_CONTENT_QUERY, { userId });
        } else if (activityType === 'dislikes') {
          // Use the existing query for dislikes (same as likes but for disliked content)
          const query = USER_ACTIVITY_QUERY(activityType, startDate, endDate);
          const params = { userId, startDate, endDate };
          data = await client.fetch(query, params);
        } else if (activityType === 'views') {
          // Fetch startups authored by the user, ordered by views desc
          data = await client.fetch(`
            *[_type == "startup" && author._ref == $userId] | order(views desc) {
              _id,
              title,
              slug,
              _createdAt,
              author -> { _id, name, image, bio },
              views,
              description,
              category,
              image,
              likes,
              dislikes,
              "commentsCount": count(comments),
              "activityType": "views"
            }
          `, { userId });
        } else if (activityType === 'likes' && onlyOwnStartups) {
          // Fetch startups authored by the user when showing analytics for own startups
          data = await client.fetch(`
            *[_type == "startup" && author._ref == $userId] | order(_createdAt desc) {
              _id,
              title,
              slug,
              _createdAt,
              author -> { _id, name, image, bio },
              views,
              description,
              category,
              image,
              likes,
              dislikes,
              "commentsCount": count(comments)
            }
          `, { userId });
        } else if (activityType === 'startup-selection') {
          // Explicit selection list: only show startups authored by the user
          const categoryFilter = selectedCategory && selectedCategory !== 'all' 
            ? `&& category == "${selectedCategory}"` 
            : '';
          
          data = await client.fetch(`
            *[_type == "startup" && author._ref == $userId ${categoryFilter}] | order(_createdAt desc) {
              _id,
              title,
              slug,
              _createdAt,
              author -> { _id, name, image, bio },
              views,
              description,
              category,
              image,
              likes,
              dislikes,
              "commentsCount": count(comments)
            }
          `, { userId });
        } else {
          // Use the existing query for likes
          const query = USER_ACTIVITY_QUERY(activityType, startDate, endDate);
          const params = { userId, startDate, endDate };
          data = await client.fetch(query, params);
        }
        

        

        
        // Handle data based on activity type
        if (activityType === 'reviews') {
          // For reports, we have both startups and comments
          const reportedData = data as ReportedContentData;
          
          // Sort startups
          let sortedStartups = [...(reportedData.startups || [])];
          if (filters?.sortBy === 'oldest') {
            sortedStartups.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
          } else {
            sortedStartups.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime());
          }
          
          // Sort comments
          let sortedComments = [...(reportedData.comments || [])];
          if (filters?.sortBy === 'oldest') {
            sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          } else {
            sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
          
          setStartups(sortedStartups);
          setComments(sortedComments);
        } else if (activityType === 'dislikes') {
          // For dislikes, we only have startups
          let sortedData = [...data];
          if (filters?.sortBy === 'oldest') {
            sortedData.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
          } else {
            sortedData.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime());
          }
          
          setStartups(sortedData);
          setComments([]);
        } else if (activityType === 'views') {
          // For views, we only have startups
          let sortedData = [...data];
          if (filters?.sortBy === 'oldest') {
            sortedData.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
          } else {
            sortedData.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime());
          }
          
          setStartups(sortedData);
          setComments([]);
        } else if (activityType === 'likes' && onlyOwnStartups) {
          // For likes, we only have startups
          let sortedData = [...data];
          if (filters?.sortBy === 'oldest') {
            sortedData.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
          } else {
            sortedData.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime());
          }
          
          setStartups(sortedData);
          setComments([]);
        } else if (activityType === 'startup-selection') {
          // For selection, show user's own startups
          let sortedData = [...data];
          if (filters?.sortBy === 'oldest') {
            sortedData.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
          } else {
            sortedData.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime());
          }

          setStartups(sortedData);
          setComments([]);
        } else {
          // For likes, we only have startups
          let sortedData = [...data];
          if (filters?.sortBy === 'oldest') {
            sortedData.sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime());
          } else {
            sortedData.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime());
          }
          
          setStartups(sortedData);
          setComments([]);
        }
      } catch (err) {
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [activityType, userId, filters, onlyOwnStartups, selectedCategory]);

  if (loading) {
    return (
      <div className="pr-80">
        <ul className="card_grid-compact">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index}>
              <div className="startup-card_skeleton animate-pulse"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (activityType === 'reviews') {
    // For reports, check if we have any startups or comments
    if (startups.length === 0 && comments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No reports found</p>
          <div className="mt-4 text-sm text-gray-400">
            <p>This tab shows content you have reported (startups and comments).</p>
            <p>To test this feature, try reporting some content first.</p>
          </div>
        </div>
      );
    }
  } else if (activityType === 'dislikes') {
    // For dislikes, check only startups
    if (startups.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No disliked content found</p>
        </div>
      );
    }
  } else if (activityType === 'views') {
    // For views, check only startups
    if (startups.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No startups found</p>
        </div>
      );
    }
  } else if (activityType === 'likes' && onlyOwnStartups) {
    // For likes, check only startups
    if (startups.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No {activityType} found</p>
        </div>
      );
    }
  } else {
    // For likes, check only startups
    if (startups.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No {activityType} found</p>
        </div>
      );
    }
  }

  return (
    <div className="pr-80">
      {/* Render startups (for likes and reported startups) */}
      {startups.length > 0 && (
        <ul className={(activityType === 'likes' || activityType === 'dislikes' || activityType === 'comments' || activityType === 'views') ? 'grid grid-cols-1 gap-8' : 'card_grid-compact'}>
          {startups.map((startup) => (
            <StartupCard 
              key={startup._id}
              post={{
                ...startup,
                _createdAt: typeof startup._createdAt === 'string' ? startup._createdAt.replace(/^\s*[•.]+\s*/, "") : startup._createdAt
              }}
              isOwner={false}
              isLoggedIn={!!userId}
              userId={userId}
              showDescription={activityType === 'startup-selection'}
              showCategory={activityType === 'startup-selection'}
              showDetailsButton={activityType === 'startup-selection'}
              analyticsContent={activityType === 'likes' ? (
                <AnalyticsPeriodSparkline startupId={startup._id} currentValue={startup.likes || 0} apiPath={'/api/analytics/likes'} />
              ) : activityType === 'dislikes' ? (
                <AnalyticsPeriodSparkline startupId={startup._id} currentValue={startup.dislikes || 0} apiPath={'/api/analytics/dislikes'} />
              ) : activityType === 'comments' ? (
                <AnalyticsPeriodSparkline startupId={startup._id} currentValue={startup.commentsCount || 0} apiPath={'/api/analytics/comments'} />
              ) : activityType === 'views' ? (
                <AnalyticsPeriodSparkline startupId={startup._id} currentValue={startup.views || 0} apiPath={'/api/analytics/views'} />
              ) : activityType === 'startup-selection' ? (
                <div className="mt-3">
                  <button
                    onClick={() => onStartupSelect?.(startup._id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Analyze This Startup
                  </button>
                </div>
              ) : undefined}
              hideActions={activityType === 'likes' || activityType === 'dislikes' || activityType === 'comments' || activityType === 'views'}
              hideImage={activityType === 'likes' || activityType === 'dislikes' || activityType === 'comments' || activityType === 'views'}
              hideViews={activityType === 'likes' || activityType === 'dislikes' || activityType === 'comments' || activityType === 'views'}
            />
          ))}
        </ul>
      )}
      
      {/* Comments rendering removed */}
    </div>
  );
};

export default ActivityContentGrid;
