'use client';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BanCheckWrapper } from "@/components/BanCheckWrapper";

function FollowUnfollowButtonContent(props: {
  profileId: string;
  currentUserId?: string;
  followers?: any[];
  onFollowChange?: () => void;
  isBanned: boolean;
  banMessage: string;
}) {
  const { profileId, currentUserId, followers = [], onFollowChange, isBanned, banMessage } = props;
  const isFollowing = Array.isArray(followers) && followers.some((f: any) => f._ref === currentUserId);
  const [following, setFollowing] = useState(isFollowing);
  
  // Update local state when followers prop changes
  useEffect(() => {
    const newIsFollowing = Array.isArray(followers) && followers.some((f: any) => f._ref === currentUserId);
    setFollowing(newIsFollowing);
  }, [followers, currentUserId]);
  const [isPressed, setIsPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFollowToggle = async () => {
    if (isBanned) {
      toast({ 
        title: 'Account Suspended', 
        description: banMessage, 
        variant: 'destructive' 
      });
      return;
    }

    if (!profileId || !currentUserId) {
      toast({ 
        title: 'Error', 
        description: 'Missing user information. Please try logging in again.', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    const action = following ? 'unfollow' : 'follow';
    setFollowing(f => !f); // Optimistic UI
    
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, currentUserId, action }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.success) {
        setFollowing(f => !f);
        toast({ 
          title: 'Error', 
          description: data.message || 'Failed to update follow status', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: action === 'follow' ? 'Followed successfully' : 'Unfollowed successfully', 
          description: action === 'follow' ? `You are now following ${profileId}` : `You unfollowed ${profileId}`,
          variant: 'default' 
        });
        if (onFollowChange) onFollowChange();
      }
    } catch (e: any) {
      setFollowing(f => !f); 
      console.error('Follow/unfollow error:', e);
      
      let errorMessage = 'Failed to update follow status';
      if (e.name === 'TypeError' && e.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render the button if viewing your own profile
  if (profileId === currentUserId) {
    return null;
  }

  // Don't render the button if user is banned
  if (isBanned) {
    return null;
  }

  return (
    <div className="flex justify-center mt-4">
      <Button
        variant={following ? "secondary" : "default"}
        onClick={handleFollowToggle}
        className={`transition-all duration-150 rounded-full px-3 py-3 shadow-md font-semibold flex items-center gap-2 text-base border-[5px] border-black bg-white text-black hover:bg-primary-100 hover:text-primary
          ${isPressed ? 'scale-95' : ''}
        `}
        style={{ minWidth: 120 }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={loading}
      >
        {loading ? (following ? 'Following...' : 'Unfollowing...') : (following ? "Unfollow" : "Follow")}
      </Button>
    </div>
  );
}

export default function FollowUnfollowButton(props: {
  profileId: string;
  currentUserId?: string;
  followers?: any[];
  onFollowChange?: () => void;
}) {
  return (
    <BanCheckWrapper>
      {({ isBanned, banMessage }) => (
        <FollowUnfollowButtonContent 
          {...props}
          isBanned={isBanned}
          banMessage={banMessage}
        />
      )}
    </BanCheckWrapper>
  );
} 