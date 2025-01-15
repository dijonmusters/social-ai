"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from Supabase
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, created_at, profiles(username, avatar_url)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  // Real-time updates
  useEffect(() => {
    fetchPosts();

    // Listen for new posts
    supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => {
          fetchPosts();
        }
      )
      .subscribe();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>

      {loading && <p>Loading posts...</p>}

      {!loading && posts.length === 0 && (
        <p>No posts yet. Start following people to see their updates!</p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-lg p-4 shadow-md bg-gray-800"
          >
            <div className="flex items-center mb-2">
              <img
                src={post.profiles?.avatar_url || "/default-avatar.png"}
                alt={post.profiles?.username || "User"}
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="font-bold">{post.profiles?.username}</span>
            </div>
            <p>{post.content}</p>
            <small className="text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
