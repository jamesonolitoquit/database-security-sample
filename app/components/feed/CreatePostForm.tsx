"use client";
import { useState } from "react";

interface CreatePostFormProps {
  onPost: (content: string, image?: string) => void;
  submitting: boolean;
}

export function CreatePostForm({ onPost, submitting }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onPost(content, image || undefined);
    setContent("");
    setImage("");
  };

  return (
    <div className="bg-purple-900/60 rounded-lg p-4 border border-purple-500 mb-6">
      <h3 className="text-lg font-bold text-yellow-200 mb-4">Share Your Adventure</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What adventures have you been on today?"
          className="w-full bg-purple-800/40 border border-purple-600 rounded px-3 py-2 text-white placeholder-purple-300 resize-none"
          rows={3}
          maxLength={1000}
          required
        />
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL (optional)"
          className="w-full bg-purple-800/40 border border-purple-600 rounded px-3 py-2 text-white placeholder-purple-300"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-900 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
          >
            {submitting ? "Posting..." : "Share Adventure"}
          </button>
        </div>
      </form>
    </div>
  );
}
