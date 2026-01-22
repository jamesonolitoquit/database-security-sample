"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SafeContent } from "../components/SafeContent";

export default function CommentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth");
      return;
    }
    fetchComments();
  }, [session, status, router]);

  const fetchComments = () => {
    fetch("/api/comment")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        } else if (res.status === 401) {
          router.push("/auth");
        } else {
          setError("Failed to load comments");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load comments");
        setLoading(false);
      });
  };

  if (loading) return <div className="text-center text-white/80">Loading comments...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">Recent Comments</h2>
      {comments.length === 0 ? (
        <div className="bg-purple-800/40 rounded-lg p-6 border border-purple-400 text-center">
          <span className="text-purple-200">No comments yet. Be the first to comment!</span>
        </div>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-purple-900/60 rounded-lg p-4 border border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <img src={comment.author.image || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full border border-yellow-300" />
                <span className="font-bold text-yellow-200">{comment.author.name}</span>
                <span className="text-xs text-purple-200 ml-2">Lv. {comment.author.level}</span>
                {comment.author.characterClass && (
                  <span className="ml-2 text-xs text-blue-200 flex items-center gap-1">
                    <img src={comment.author.characterClass.icon} alt="class" className="w-4 h-4 inline" />
                    {comment.author.characterClass.name}
                  </span>
                )}
              </div>
              <SafeContent content={comment.content} className="text-white/90 mb-2" />
              <div className="flex gap-4 text-xs text-purple-200 mt-2">
                <span>📝 On post: {comment.post.content.slice(0, 40)}...</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
