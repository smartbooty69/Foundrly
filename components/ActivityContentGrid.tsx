'use client';

import { useEffect, useState } from 'react';
import ActivityGridItem from './ActivityGridItem';
import StartupCard from './StartupCard';
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
          

        } else if (activityType === 'dislikes') {
          // Use the existing query for dislikes (same as likes but for disliked content)
          const query = USER_ACTIVITY_QUERY(activityType, startDate, endDate);
          const params = { userId, startDate, endDate };
          data = await client.fetch(query, params);
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
      <div className="pr-20">
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
  } else if (activityType === 'comments') {
    // For comments, check only comments
    if (comments.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments found</p>
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
    <div className="pr-20">
      {/* Render startups (for likes and reported startups) */}
      {startups.length > 0 && (
        <ul className="card_grid-compact">
      {startups.map((startup) => (
            <StartupCard 
          key={startup._id} 
              post={startup}
              isOwner={false}
              isLoggedIn={!!userId}
              userId={userId}
              showDescription={false}
              showCategory={false}
              showDetailsButton={false}
        />
      ))}
        </ul>
      )}
      
      {/* Render comments (for comments section and reported comments) */}
      {comments.length > 0 && (
        <div className="mt-6">
          <ul className="card_grid-compact">
            {comments.map((comment) => {
              // Convert comment data to startup data format for StartupCard
              const startupData = {
                _id: comment.startup._id,
                title: comment.startup.title,
                slug: comment.startup.slug,
                _createdAt: comment.createdAt,
                author: comment.author,
                views: 0,
                description: comment.text,
                category: '',
                image: comment.startup.image,
                likes: comment.likes,
                dislikes: comment.dislikes,
                commentsCount: 0,
                activityType: 'comment'
              };
              
              return (
                <StartupCard 
                  key={comment._id} 
                  post={startupData}
                  isOwner={false}
                  isLoggedIn={!!userId}
                  userId={userId}
                  showDescription={false}
                  showCategory={false}
                  showDetailsButton={false}
                  showComment={true}
                  commentType={activityType === 'reviews' ? 'report' : (comment.parentComment ? 'reply' : 'comment')}
                  showLikesDislikes={false}
                />
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActivityContentGrid;
