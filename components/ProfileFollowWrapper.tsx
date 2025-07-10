"use client";
import { useState, useEffect } from "react";
import FollowersFollowingToast from "@/components/FollowersFollowingToast";
import FollowUnfollowButton from "@/components/FollowUnfollowButton";
import MessageButton from "@/components/MessageButton";

interface ProfileFollowWrapperProps {
  initialFollowers: any[];
  initialFollowing: any[];
  profileId: string;
  currentUserId?: string;
}

export default function ProfileFollowWrapper({
  initialFollowers = [],
  initialFollowing = [],
  profileId,
  currentUserId,
}: ProfileFollowWrapperProps) {
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refresh followers/following data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUser();
    }, 5000);
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
      .catch(() => {})
      .finally(() => setIsLoading(false));
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
      <div className="flex flex-row items-center justify-center gap-4 mt-2">
        <FollowUnfollowButton
          profileId={profileId}
          currentUserId={currentUserId}
          followers={followers}
          onFollowChange={refetchUser}
        />
        <MessageButton profileId={profileId} currentUserId={currentUserId} />
      </div>
    </>
  );
} 