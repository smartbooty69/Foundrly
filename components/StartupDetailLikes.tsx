'use client';

import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface StartupDetailLikesProps {
  startupId: string;
  isLoggedIn?: boolean;
  userId?: string;
}

const StartupDetailLikes = ({ startupId, isLoggedIn = false, userId }: StartupDetailLikesProps) => {
  const [likes, setLikes] = React.useState(0);
  const [dislikes, setDislikes] = React.useState(0);
  const [liked, setLiked] = React.useState(false);
  const [disliked, setDisliked] = React.useState(false);
  const [likeLoading, setLikeLoading] = React.useState(false);
  const [dislikeLoading, setDislikeLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    if (!startupId) return;

    Promise.all([
      fetch(`/api/likes?id=${startupId}`).then(res => res.json()),
      fetch(`/api/dislikes?id=${startupId}`).then(res => res.json())
    ]).then(([likeData, dislikeData]) => {
      setLikes(likeData.likes ?? 0);
      setLiked(userId ? (likeData.likedBy ?? []).includes(userId) : false);
      setDislikes(dislikeData.dislikes ?? 0);
      setDisliked(userId ? (dislikeData.dislikedBy ?? []).includes(userId) : false);
      setInitialLoading(false);
    });
  }, [startupId, userId]);

  const handleLike = async () => {
    if (!userId || likeLoading) return;
    setLikeLoading(true);
    const res = await fetch(`/api/likes?id=${startupId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setLikes(data.likes ?? 0);
    setDislikes(data.dislikes ?? 0);
    setLiked(data.likedBy?.includes(userId) ?? false);
    setDisliked(data.dislikedBy?.includes(userId) ?? false);
    setLikeLoading(false);
  };

  const handleDislike = async () => {
    if (!userId || dislikeLoading) return;
    setDislikeLoading(true);
    const res = await fetch(`/api/dislikes?id=${startupId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setLikes(data.likes ?? 0);
    setDislikes(data.dislikes ?? 0);
    setLiked(data.likedBy?.includes(userId) ?? false);
    setDisliked(data.dislikedBy?.includes(userId) ?? false);
    setDislikeLoading(false);
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      {initialLoading ? (
        <svg className="animate-spin h-7 w-7 text-gray-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <>
          <button
            aria-label="Like"
            onClick={handleLike}
            disabled={!isLoggedIn || likeLoading}
            title={!isLoggedIn ? 'Log in to like' : ''}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
              ${liked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'}
              ${!isLoggedIn || likeLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            type="button"
          >
            {likeLoading ? (
              <svg className="animate-spin h-5 w-5 text-green-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <>
                <ThumbsUp className="size-5" />
                <span className="font-medium text-green-700">Likes</span>
              </>
            )}
            <span className="font-medium">{likes}</span>
          </button>
          <button
            aria-label="Dislike"
            onClick={handleDislike}
            disabled={!isLoggedIn || dislikeLoading}
            title={!isLoggedIn ? 'Log in to dislike' : ''}
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
              ${disliked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'}
              ${!isLoggedIn || dislikeLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            type="button"
          >
            {dislikeLoading ? (
              <svg className="animate-spin h-5 w-5 text-red-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <>
                <ThumbsDown className="size-5" />
                <span className="font-medium text-red-700">Dislikes</span>
              </>
            )}
            <span className="font-medium">{dislikes}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default StartupDetailLikes; 