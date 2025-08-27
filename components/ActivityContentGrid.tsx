'use client';

import { useEffect, useState } from 'react';
import ActivityGridItem from './ActivityGridItem';
import { client } from '@/sanity/lib/client';
import { USER_ACTIVITY_QUERY, TEST_REPORTS_QUERY, ALL_REPORTS_QUERY, STARTUP_IDS_FROM_REPORTS_QUERY, STARTUPS_BY_IDS_QUERY, USER_REPORTED_CONTENT_QUERY } from '@/sanity/lib/activity-queries';

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
}

const ActivityContentGrid = ({ activityType, userId, filters }: ActivityContentGridProps) => {
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
        } else if (activityType === 'comments') {
          // Use a specific query for comments to get individual comments
          data = await client.fetch(`
            *[_type == "comment" && author._ref == $userId] {
              _id,
              text,
              createdAt,
              likes,
              dislikes,
              parentComment -> {
                _id,
                text,
                author -> {
                  _id,
                  name
                }
              },
              startup -> {
                _id,
                title,
                slug,
                image
              },
              author -> {
                _id,
                name,
                image
              }
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
        } else if (activityType === 'comments') {
          // For comments, we have individual comments
          let sortedComments = [...data];
          if (filters?.sortBy === 'oldest') {
            sortedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          } else {
            sortedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
          
          setStartups([]);
          setComments(sortedComments);
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
  }, [activityType, userId, filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="aspect-square bg-gray-200 animate-pulse rounded"></div>
        ))}
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
  } else if (activityType === 'comments') {
    // For comments, check only comments
    if (comments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments found</p>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
      {/* Render startups (for likes and reported startups) */}
      {startups.map((startup) => (
        <ActivityGridItem 
          key={startup._id} 
          startup={startup}
          activityType={activityType}
        />
      ))}
      
      {/* Render comments (for comments section and reported comments) */}
      {comments.map((comment) => (
        <div key={comment._id} className="aspect-square bg-white border border-gray-200 rounded-sm relative overflow-hidden">
          {/* Startup Image */}
          <div className="w-full h-1/2 relative">
            {comment.startup.image ? (
              <img 
                src={comment.startup.image} 
                alt={comment.startup.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
            {/* Overlay with startup title */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1">
              <p className="text-xs truncate">{comment.startup.title}</p>
            </div>
          </div>
          
          {/* Comment Content */}
          <div className="p-3 h-1/2 flex flex-col">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">{comment.author.name}</span>
            </div>
            
            {/* Comment Type Badge */}
            <div className="mb-1 flex items-center gap-2">
              {comment.parentComment ? (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Reply to {comment.parentComment.author?.name || 'Unknown'}</span>
                  {comment.parentComment.author?._id === comment.author._id && (
                    <span className="text-blue-500">(self)</span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>Comment</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-800 flex-1 line-clamp-2">{comment.text}</p>
            
            <div className="mt-1 text-xs text-gray-500">
              {activityType === 'reviews' ? (
                <p>Reason: {comment.userReports?.[0]?.reason || 'Unknown'}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-green-600 font-medium">{comment.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    <span className="text-red-600 font-medium">{comment.dislikes || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityContentGrid;
