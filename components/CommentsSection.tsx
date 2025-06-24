"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, ThumbsDown, Smile, Paperclip, AtSign, Send, Trash2, LogIn } from "lucide-react";
import dynamic from "next/dynamic";
import markdownit from "markdown-it";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const EmojiPickerClient = dynamic(() => import("./EmojiPickerClient"), { ssr: false });

// Render a single comment (with replies) - moved outside to prevent re-renders
function CommentCard({ 
  c, 
  depth = 0, 
  userId, 
  isLoggedIn, 
  onLike, 
  onDislike, 
  onReply, 
  onDelete, 
  replyingTo, 
  setReplyingTo, 
  replyText, 
  setReplyText, 
  handleReply, 
  actionLoading, 
  likeLoading, 
  dislikeLoading 
}: { 
  c: any, 
  depth?: number,
  userId?: string,
  isLoggedIn: boolean,
  onLike: (id: string) => void,
  onDislike: (id: string) => void,
  onReply: (id: string) => void,
  onDelete: (id: string) => void,
  replyingTo: string | null,
  setReplyingTo: (id: string | null) => void,
  replyText: string,
  setReplyText: (text: string) => void,
  handleReply: (parentId: string, replyText: string) => void,
  actionLoading: string | null,
  likeLoading: string | null,
  dislikeLoading: string | null
}) {
  const liked = userId && c.likedBy?.includes(userId);
  const disliked = userId && c.dislikedBy?.includes(userId);
  const score = (c.likes || 0) - (c.dislikes || 0);
  let scoreColor = "text-gray-700";
  if (score > 0) scoreColor = "text-green-600";
  else if (score < 0) scoreColor = "text-red-600";
  
  // Check if comment is deleted
  const isDeleted = c.deleted;
  
  // Create unique ref for this reply textarea
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  return (
    <div className={`mb-6 ${depth > 0 ? "ml-6 border-l-2 border-gray-200 pl-4" : ""}`}> 
      <div className="flex space-x-3">
        <Link href={`/user/${c.author?._id}`}>
          <Avatar className="w-9 h-9">
            {c.author?.image ? (
              <AvatarImage src={c.author.image} alt={c.author.name || c.author.username || "?"} />
            ) : (
              <AvatarFallback>{c.author?.name?.[0] || c.author?.username?.[0] || "?"}</AvatarFallback>
            )}
          </Avatar>
        </Link>
        <div className="flex-1">
          <p className="font-semibold">{c.author?.name || "User"} <span className="text-sm text-gray-500 ml-2">{new Date(c.createdAt).toLocaleString()}</span></p>
          {isDeleted ? (
            <p className="mt-1 text-gray-500 italic">[deleted]</p>
          ) : (
            <p className="mt-1 text-gray-800" dangerouslySetInnerHTML={{ __html: markdownit().render(c.text) }} />
          )}
          {!isDeleted && (
            <div className="flex items-center space-x-4 mt-2">
              <button
                className={`flex items-center p-1 rounded-full transition-colors duration-200 ${liked ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'} ${!isLoggedIn || likeLoading === c._id ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={!isLoggedIn || likeLoading === c._id}
                onClick={() => onLike(c._id)}
                title={!isLoggedIn ? 'Log in to like' : ''}
                type="button"
              >
                {likeLoading === c._id ? (
                  <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <ThumbsUp className="size-5 text-green-600" />
                )}
                <span className="ml-1 text-xs">{c.likes || 0}</span>
              </button>
              <button
                className={`flex items-center p-1 rounded-full transition-colors duration-200 ${disliked ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'} ${!isLoggedIn || dislikeLoading === c._id ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={!isLoggedIn || dislikeLoading === c._id}
                onClick={() => onDislike(c._id)}
                title={!isLoggedIn ? 'Log in to dislike' : ''}
                type="button"
              >
                {dislikeLoading === c._id ? (
                  <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <ThumbsDown className="size-5 text-red-600" />
                )}
                <span className="ml-1 text-xs">{c.dislikes || 0}</span>
              </button>
              <button 
                className={`flex items-center space-x-1 text-gray-500 ${!isLoggedIn ? 'opacity-75 cursor-not-allowed' : 'hover:text-gray-700'}`}
                disabled={!isLoggedIn}
                onClick={() => { if (isLoggedIn) { setReplyingTo(c._id); setReplyText(""); } }}
                title={!isLoggedIn ? 'Log in to reply' : 'Reply'}
              > 
                <MessageSquare size={16} /> 
                <span>Reply</span>
              </button>
              {userId === c.author?._id && (
                <button
                  className={`flex items-center p-1 rounded-full transition-colors duration-200 text-gray-500 hover:bg-red-50 hover:text-red-600 ${actionLoading === c._id + "-delete" ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={actionLoading === c._id + "-delete"}
                  onClick={() => onDelete(c._id)}
                  title="Delete comment"
                  type="button"
                >
                  {actionLoading === c._id + "-delete" ? (
                    <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <Trash2 className="size-5 text-red-600" />
                  )}
                </button>
              )}
            </div>
          )}
          {replyingTo === c._id && isLoggedIn && (
            <div className="mt-3">
              <textarea
                ref={replyTextareaRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Add reply..."
                maxLength={1000}
                className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200" 
                  onClick={() => { handleReply(c._id, replyText); }} 
                  disabled={actionLoading === c._id + "-reply" || !replyText.trim()}
                >
                  {actionLoading === c._id + "-reply" ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MessageSquare size={16} />
                      <span>Reply</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
          {c.replies && c.replies.length > 0 && c.replies.map((r: any) => (
            <CommentCard 
              key={r._id} 
              c={r} 
              depth={depth + 1}
              userId={userId}
              isLoggedIn={isLoggedIn}
              onLike={onLike}
              onDislike={onDislike}
              onReply={onReply}
              onDelete={onDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReply={handleReply}
              actionLoading={actionLoading}
              likeLoading={likeLoading}
              dislikeLoading={dislikeLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Props: startupId, userId, isLoggedIn
export default function CommentsSection({ startupId, userId, isLoggedIn }: { startupId: string, userId?: string, isLoggedIn: boolean }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Track cursor position for comment and reply editors
  const [commentCursor, setCommentCursor] = useState(0);
  const [replyCursor, setReplyCursor] = useState(0);

  // Track open formatting for toggle mode
  const [openFormat, setOpenFormat] = useState<{ type: string, isReply: boolean, pos: number } | null>(null);

  // Emoji dropdown state
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
  const [showReplyEmojiDropdown, setShowReplyEmojiDropdown] = useState(false);
  const emojiList = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😜", "😝", "😛", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
  ];

  const md = markdownit();

  const [sort, setSort] = useState<'best' | 'newest' | 'oldest'>('best');

  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [dislikeLoading, setDislikeLoading] = useState<string | null>(null);

  const { toast } = useToast();

  // Fetch comments (PUBLIC - no auth required)
  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/comments?startupId=${startupId}`, { cache: 'no-store' });
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);
  }, [startupId]);
  
  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Post new comment (REQUIRES AUTH)
  const handleSubmit = useCallback(async () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a comment.",
        variant: "destructive",
      });
      return;
    }
    
    if (!comment.trim()) return;
    setActionLoading("submit");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment, startupId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to post comment");
      }
      
      setComment("");
      toast({
        title: "Comment posted",
        description: "Your comment was posted successfully.",
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }, [comment, startupId, fetchComments, isLoggedIn, toast]);

  // Like a comment (REQUIRES AUTH)
  const handleLike = useCallback(async (commentId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }
    
    setLikeLoading(commentId);
    setActionLoading(commentId + 'like');
    try {
      const res = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to like comment");
      }
      
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like comment.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setLikeLoading(null);
    }
  }, [isLoggedIn, userId, fetchComments, toast]);

  // Dislike a comment (REQUIRES AUTH)
  const handleDislike = useCallback(async (commentId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to dislike comments.",
        variant: "destructive",
      });
      return;
    }
    
    setDislikeLoading(commentId);
    setActionLoading(commentId + 'dislike');
    try {
      const res = await fetch('/api/comments/dislike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to dislike comment");
      }
      
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to dislike comment.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setDislikeLoading(null);
    }
  }, [isLoggedIn, userId, fetchComments, toast]);

  // Post reply (REQUIRES AUTH)
  const handleReply = useCallback(async (parentId: string, replyText: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to reply to comments.",
        variant: "destructive",
      });
      return;
    }
    
    if (!replyText.trim()) return;
    setActionLoading(parentId + "-reply");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", text: replyText, parentId, startupId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to post reply");
      }
      
      setReplyingTo(null);
      setReplyText("");
      toast({
        title: "Reply posted",
        description: "Your reply was posted successfully.",
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }, [startupId, fetchComments, isLoggedIn, toast]);

  // Delete a comment (REQUIRES AUTH)
  const handleDelete = useCallback(async (commentId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete comments.",
        variant: "destructive",
      });
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) return;
    setActionLoading(commentId + "-delete");
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete comment");
      }
      toast({
        title: "Comment deleted",
        description: "Your comment was deleted successfully.",
      });
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }, [fetchComments, isLoggedIn, toast]);

  // Refs for comment and reply editors
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sort comments (top-level only)
  const getSortedComments = useCallback(() => {
    const sorted = [...comments];
    if (sort === 'best') {
      sorted.sort((a, b) => ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0)));
    } else if (sort === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return sorted;
  }, [comments, sort]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Comment Input Section */}
      <div className="bg-white shadow rounded-xl p-4">
        {isLoggedIn ? (
          <>
            <textarea
              ref={commentTextareaRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              onSelect={e => setCommentCursor(e.currentTarget.selectionStart)}
              onClick={e => setCommentCursor(e.currentTarget.selectionStart)}
              placeholder="Add comment..."
              maxLength={1000}
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-2"
            />
            <div className="flex items-center justify-end mt-2">
              <Button 
                className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200" 
                onClick={handleSubmit} 
                disabled={!comment.trim() || actionLoading === "submit"}
                size="sm"
              >
                {actionLoading === "submit" ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Posting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send size={16} />
                    <span>Post Comment</span>
                  </div>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <LogIn className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Log in to comment</span>
            </div>
            <Link href="/auth/signin">
              <Button className="bg-blue-500 text-white hover:bg-blue-600">
                Log In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Comments Display Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Comments</h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="comment-sort" className="text-sm text-gray-500">Sort by:</label>
            <select
              id="comment-sort"
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="best">Best</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
        {loading && comments.length > 0 && (
          <div className="text-center text-gray-400 mb-2">Refreshing comments...</div>
        )}
        {comments.length === 0 && !loading ? (
          <div className="text-center text-gray-400">No comments yet.</div>
        ) : (
          getSortedComments().map((c) => (
            <CommentCard 
              key={c._id} 
              c={c}
              userId={userId}
              isLoggedIn={isLoggedIn}
              onLike={handleLike}
              onDislike={handleDislike}
              onReply={() => {}}
              onDelete={handleDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReply={handleReply}
              actionLoading={actionLoading}
              likeLoading={likeLoading}
              dislikeLoading={dislikeLoading}
            />
          ))
        )}
      </div>
    </div>
  );
} 