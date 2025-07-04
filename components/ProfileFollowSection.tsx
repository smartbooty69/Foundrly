'use client';
import { useState, useEffect } from 'react';
import FollowUnfollowButton from './FollowUnfollowButton';
import FollowersFollowingToast from './FollowersFollowingToast';

export default function ProfileFollowSection({
  initialFollowers = [],
  initialFollowing = [],
  profileId,
  currentUserId,
}: {
  initialFollowers: any[];
  initialFollowing: any[];
  profileId: string;
  currentUserId?: string;
}) {
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-refresh followers/following data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUser();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [profileId]);

  const refetchUser = async () => {
    setIsLoading(true);
    
    fetch(`/api/user/${profileId}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Priority': 'high'
      }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data && !data.error) {
        setFollowers(Array.isArray(data.followers) ? data.followers : []);
        setFollowing(Array.isArray(data.following) ? data.following : []);
      }
    })
    .catch(() => {
      // Silently fail - keep existing data
    })
    .finally(() => {
      setIsLoading(false);
    });
  };
  return (
    <>
      <FollowersFollowingToast
        followers={followers}
        following={following}
        isLoading={isLoading}
        profileId={profileId}
        currentUserId={currentUserId}
        onFollowChange={refetchUser}
      />
      <FollowUnfollowButton
        profileId={profileId}
        currentUserId={currentUserId}
        followers={followers}
        onFollowChange={refetchUser}
      />
    </>
  );
} 