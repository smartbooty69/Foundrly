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
}

const StartupCard = ({ post, isOwner = false, isLoggedIn = false, userId }: StartupCardProps) => {
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
        <div className="flex items-center gap-3">
          {initialLoading ? (
            <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
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
                className={`flex items-center p-1 rounded-full transition-colors duration-200
                  ${liked ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'} ${!isLoggedIn || likeLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                type="button"
              >
                {likeLoading ? (
                  <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <ThumbsUp className="size-5 text-green-600" />
                )}
                <span className="ml-1 text-xs">{likes}</span>
              </button>
              <button
                aria-label="Dislike"
                onClick={handleDislike}
                disabled={!isLoggedIn || dislikeLoading}
                title={!isLoggedIn ? 'Log in to dislike' : ''}
                className={`flex items-center p-1 rounded-full transition-colors duration-200
                  ${disliked ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'} ${!isLoggedIn || dislikeLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                type="button"
              >
                {dislikeLoading ? (
                  <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <ThumbsDown className="size-5 text-red-600" />
                )}
                <span className="ml-1 text-xs">{dislikes}</span>
              </button>
            </>
          )}
          <div className="flex gap-1.5 ml-2">
            <EyeIcon className="size-6 text-primary" />
            <span className="text-16-medium">{typeof totalViews === 'number' ? <CountUp end={totalViews} duration={1} /> : '...'}</span>
          </div>
        </div>
      </div>

      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author?._id}`}>
            <p className="text-16-medium line-clamp-1">{author?.name}</p>
          </Link>
          <Link href={`/startup/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        <Link href={`/user/${author?._id}`}>
          <Image
            src={author?.image!}
            alt={author?.name!}
            width={48}
            height={48}
            className="rounded-full"
          />
        </Link>
      </div>

      <Link href={`/startup/${_id}`}>
        <p className="startup-card_desc">{description}</p>

        <img src={image} alt="placeholder" className="startup-card_img" />
      </Link>

      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium truncate max-w-xs whitespace-nowrap">{category}</p>
        </Link>
        <div className="action-buttons">
          <Button className="startup-card_btn" asChild>
            <Link href={`/startup/${_id}`}>Details</Link>
          </Button>
          
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