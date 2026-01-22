"use client";
import { useState } from "react";
import { SafeContent } from "../SafeContent";

interface PostCardProps {
  post: any;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  currentUserId: string;
}

export function PostCard({ post, onLike, onComment, currentUserId }: PostCardProps) {
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLiked = post.likes.some((like: any) => like.userId === currentUserId);

  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;
    setSubmitting(true);
    await onComment(post.id, commentContent);
    setCommentContent("");
    setSubmitting(false);
  };

  return (
    <li className="bg-purple-900/60 rounded-lg p-4 border border-purple-500">
      <div className="flex items-center gap-3 mb-2">
        <img src={post.author.image || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full border border-yellow-300" />
        <span className="font-bold text-yellow-200">{post.author.name}</span>
        <span className="text-xs text-purple-200 ml-2">Lv. {post.author.level}</span>
        {post.author.characterClass && (
          <span className="ml-2 text-xs text-blue-200 flex items-center gap-1">
            <img src={post.author.characterClass.icon} alt="class" className="w-4 h-4 inline" />
            {post.author.characterClass.name}
          </span>
        )}
      </div>
      <SafeContent content={post.content} className="text-white/90 mb-2" />
      {post.image && (
        <img src={post.image} alt="post" className="rounded-lg border border-purple-700 max-h-64 object-contain mx-auto my-2" />
      )}
      <div className="flex gap-4 text-xs text-purple-200 mt-2">
        <button
          onClick={handleLike}
          className={`hover:text-red-400 transition-colors ${isLiked ? 'text-red-400' : ''}`}
        >
          ❤️ {post._count.likes} Likes
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-blue-400 transition-colors"
        >
          💬 {post._count.comments} Comments
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-purple-700 pt-4">
          {/* Recent comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-2 mb-4">
              {post.comments.map((comment: any) => (
                <div key={comment.id} className="bg-purple-800/40 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <img src={comment.author.image || "/default-avatar.png"} alt="avatar" className="w-6 h-6 rounded-full border border-yellow-300" />
                    <span className="font-bold text-yellow-200 text-sm">{comment.author.name}</span>
                    <span className="text-xs text-purple-200">Lv. {comment.author.level}</span>
                  </div>
                  <SafeContent content={comment.content} className="text-white/80 text-sm" />
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          <div className="flex gap-2">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-purple-800/40 border border-purple-600 rounded px-3 py-2 text-white placeholder-purple-300 text-sm resize-none"
              rows={2}
              maxLength={500}
            />
            <button
              onClick={handleComment}
              disabled={submitting || !commentContent.trim()}
              className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-900 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {submitting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
