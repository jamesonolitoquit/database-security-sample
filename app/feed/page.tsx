"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CreatePostForm } from "../components/feed/CreatePostForm";
import { PostCard } from "../components/feed/PostCard";

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth");
      return;
    }
    fetchPosts();
  }, [session, status, router]);

  const fetchPosts = () => {
    fetch("/api/post")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        } else if (res.status === 401) {
          router.push("/auth");
        } else {
          setError("Failed to load posts");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load posts");
        setLoading(false);
      });
  };

  const handleCreatePost = async (content: string, image?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      alert("Failed to create post");
    }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/post/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });

      if (res.ok) {
        // Refresh posts to get updated like counts
        fetchPosts();
      }
    } catch (error) {
      alert("Failed to like post");
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content })
      });

      if (res.ok) {
        // Refresh posts to get updated comments
        fetchPosts();
      }
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  if (loading) return <div className="text-center text-white/80">Loading feed...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">Adventurer Feed</h2>
      <CreatePostForm onPost={handleCreatePost} submitting={submitting} />
      {posts.length === 0 ? (
        <div className="bg-purple-800/40 rounded-lg p-6 border border-purple-400 text-center">
          <span className="text-purple-200">No posts yet. Be the first to share your adventure!</span>
        </div>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              currentUserId={(session?.user as any)?.id || ""}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
