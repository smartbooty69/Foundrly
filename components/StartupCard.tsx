'use client';

import { cn, formatDate } from "@/lib/utils";
import { EyeIcon, Edit, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Author, Startup } from "@/sanity/types";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteStartupButton from "./DeleteStartupButton";
import React from "react";
import CountUp from 'react-countup';

export type StartupTypeCard = Omit<Startup, "author"> & { author?: Author };

interface StartupCardProps {
  post: StartupTypeCard;
  isOwner?: boolean;
  isLoggedIn?: boolean;
  userId?: string;
  showDescription?: boolean;
  showCategory?: boolean;
  showDetailsButton?: boolean;
  showComment?: boolean;
  commentType?: 'comment' | 'reply' | 'report';
  showLikesDislikes?: boolean;
}

const StartupCard = ({ post, isOwner = false, isLoggedIn = false, userId, showDescription = true, showCategory = true, showDetailsButton = true, showComment = false, commentType = 'comment', showLikesDislikes = true }: StartupCardProps) => {
  const {
    _createdAt,
    views,
    author,
    title,
    category,
    _id,
    image,
    description,
  } = post;

  // Author data loaded

  const [likes, setLikes] = React.useState(0);
  const [dislikes, setDislikes] = React.useState(0);
  const [liked, setLiked] = React.useState(false);
  const [disliked, setDisliked] = React.useState(false);
  const [likedBy, setLikedBy] = React.useState<string[]>([]);
  const [dislikedBy, setDislikedBy] = React.useState<string[]>([]);
  const [likeLoading, setLikeLoading] = React.useState(false);
  const [dislikeLoading, setDislikeLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [totalViews, setTotalViews] = React.useState<number>(views ?? 0);
  const hasIncremented = React.useRef(false);

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/likes?id=${_id}`).then(res => res.json()),
      fetch(`/api/dislikes?id=${_id}`).then(res => res.json())
    ]).then(([likeData, dislikeData]) => {
      setLikes(likeData.likes ?? 0);
      setLikedBy(likeData.likedBy ?? []);
      setLiked(userId ? (likeData.likedBy ?? []).includes(userId) : false);
      setDislikes(dislikeData.dislikes ?? 0);
      setDislikedBy(dislikeData.dislikedBy ?? []);
      setDisliked(userId ? (dislikeData.dislikedBy ?? []).includes(userId) : false);
      setInitialLoading(false);
    });
  }, [_id, userId]);

  // Initial fetch of views
  React.useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch(`/api/views?id=${_id}`);
        if (!res.ok) return;
        const data = await res.json();
        setTotalViews(data.views);
      } catch {}
    };
    fetchViews();
  }, [_id]);

  // Increment views only once per session
  React.useEffect(() => {
    const incrementViews = async () => {
      if (hasIncremented.current) return;
      if (typeof window !== 'undefined') {
        const key = `viewed_${_id}`;
        if (sessionStorage.getItem(key)) {
          hasIncremented.current = true;
          return;
        }
      }
      try {
        const res = await fetch(`/api/views?id=${_id}`, { method: 'POST' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setTotalViews(data.views);
          hasIncremented.current = true;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`viewed_${_id}`, 'true');
          }
        }
      } catch {}
    };
    incrementViews();
  }, [_id]);

  const handleLike = async () => {
    if (!userId || likeLoading) return;
    setLikeLoading(true);
    const res = await fetch(`/api/likes?id=${_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setLikes(data.likes ?? likes);
    setDislikes(data.dislikes ?? dislikes);
    setLikedBy(data.likedBy ?? likedBy);
    setDislikedBy(data.dislikedBy ?? dislikedBy);
    setLiked(data.likedBy?.includes(userId) ?? false);
    setDisliked(data.dislikedBy?.includes(userId) ?? false);
    setLikeLoading(false);
  };

  const handleDislike = async () => {
    if (!userId || dislikeLoading) return;
    setDislikeLoading(true);
    const res = await fetch(`/api/dislikes?id=${_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setLikes(data.likes ?? likes);
    setDislikes(data.dislikes ?? dislikes);
    setLikedBy(data.likedBy ?? likedBy);
    setDislikedBy(data.dislikedBy ?? dislikedBy);
    setLiked(data.likedBy?.includes(userId) ?? false);
    setDisliked(data.dislikedBy?.includes(userId) ?? false);
    setDislikeLoading(false);
  };

  return (
    <li className="startup-card group hover:bg-blue-50 transition-colors duration-200">
      <div className="flex-between">
        <p className="startup_card_date">{formatDate(_createdAt)}</p>
        <div className="flex gap-1.5">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{typeof totalViews === 'number' ? <CountUp end={totalViews} duration={1} /> : '...'}</span>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={author?._id ? `/user/${author._id}` : "#"}>
            <p className="text-16-medium line-clamp-1">{author?.name != null ? author.name : "Unknown"}</p>
          </Link>
          <Link href={`/startup/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        <Link href={author?._id ? `/user/${author._id}` : "#"}>
          {author?.image && author.image.trim() !== "" ? (
            <Image
              src={author.image}
              alt={author?.name || "Unknown"}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
              {author?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </Link>
      </div>

      <Link href={`/startup/${_id}`}>
        {showDescription && (
          <p className="startup-card_desc">{description}</p>
        )}

        <img src={image} alt="placeholder" className="startup-card_img" />
        
                {/* Likes and Dislikes after image */}
        {showLikesDislikes && (
          <div className="flex items-center justify-center mt-4 mb-2">
            {initialLoading ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full">
                  <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  aria-label="Like"
                  onClick={handleLike}
                  disabled={!isLoggedIn || likeLoading}
                  title={!isLoggedIn ? 'Log in to like' : ''}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md
                    ${liked 
                      ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                    } 
                    ${!isLoggedIn || likeLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                  type="button"
                >
                  {likeLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <ThumbsUp className={`size-5 transition-transform duration-200 ${liked ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`} />
                  )}
                  <span className="text-sm font-medium">{likes}</span>
                </button>
                
                <button
                  aria-label="Dislike"
                  onClick={handleDislike}
                  disabled={!isLoggedIn || dislikeLoading}
                  title={!isLoggedIn ? 'Log in to dislike' : ''}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 shadow-sm hover:shadow-md
                    ${disliked 
                      ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    } 
                    ${!isLoggedIn || dislikeLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                  type="button"
                >
                  {dislikeLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <ThumbsDown className={`size-5 transition-transform duration-200 ${disliked ? 'text-white' : 'text-gray-500 group-hover:text-red-600'}`} />
                  )}
                  <span className="text-sm font-medium">{dislikes}</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Comment display with icon */}
        {showComment && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {commentType === 'reply' ? (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : commentType === 'report' ? (
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0 3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-xs font-medium text-gray-700">
                {commentType === 'reply' ? 'Reply' : commentType === 'report' ? 'Report' : 'Comment'}
              </span>
            </div>
            <p className="text-sm text-gray-800 line-clamp-3">{description}</p>
            </div>
          )}
      </Link>

      <div className="flex-between gap-3 mt-3">
        {showCategory && (
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium truncate max-w-xs whitespace-nowrap">{category}</p>
        </Link>
        )}
        <div className="action-buttons">
          {showDetailsButton && (
          <Button className="startup-card_btn" asChild>
            <Link href={`/startup/${_id}`}>Details</Link>
          </Button>
          )}
          
          {isOwner && (
            <div className="flex gap-2">
              <Button className="edit-btn p-2 h-9 w-9" asChild>
                <Link href={`/startup/${_id}/edit`} aria-label="Edit">
                  <Edit className="h-5 w-5" />
                </Link>
              </Button>
              <DeleteStartupButton 
                startupId={_id} 
                startupTitle={title || ""} 
                userId={author?._id || ""}
                iconOnly
              />
            </div>
          )}
        </div>
      </div>
      

    </li>
  );
};

export const StartupCardSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4].map((index: number) => (
      <li key={cn("skeleton", index)}>
        <Skeleton className="startup-card_skeleton" />
      </li>
    ))}
  </>
);

export default StartupCard;