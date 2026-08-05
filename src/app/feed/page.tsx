"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/components/RequireAuth";

type Like = {
  id: number;
  user_id: string;
};

type Comment = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

type Post = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  post_likes: Like[];
  comments: Comment[];
};
type FeedTab = "following" | "discover" | "challenges";

const suggestedChallenges = [
  { name: "30 Day Core Blast", progress: 72, members: "1.2k" },
  { name: "Weekend Warrior", progress: 44, members: "856" },
  { name: "Push Your Limits", progress: 28, members: "2.4k" },
];

function FeedContent() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedMessage, setFeedMessage] = useState("");
  const [activeTab, setActiveTab] = useState<FeedTab>("following");
  const [currentUserId, setCurrentUserId] = useState("");
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPosts([]); return; }
    setCurrentUserId(user.id);
    const { data, error } = await supabase.from("posts").select(`
    id,
    content,
    created_at,
    user_id,
    post_likes (
      id,
      user_id
    ),
    comments (
    id,
    user_id,
    content,
    created_at
    )
  `).eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) { setFeedMessage("Could not load posts."); return; }
    setPosts(data ?? []);
  }

  async function toggleLike(post: Post) {
    setFeedMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFeedMessage("Please log in to like posts.");
      return;
    }

    const existingLike = post.post_likes?.find((like) => like.user_id === user.id);

    if (existingLike) {
      const { error } = await supabase.from("post_likes").delete().eq("id", existingLike.id);
      if (error) {
        setFeedMessage("Could not remove your like.");
        return;
      }
    } else {
      const { error } = await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
      if (error) {
        setFeedMessage("Could not like this post.");
        return;
      }
    }

    await loadPosts();
    setFeedMessage("");
  }

  async function addComment(postId: number) {
    const text = commentText[postId]?.trim();
    if (!text) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFeedMessage("Please log in to comment.");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: text,
    });

    if (error) {
      setFeedMessage("Could not add your comment.");
      return;
    }

    setCommentText((current) => ({ ...current, [postId]: "" }));
    setCommentingOn(null);
    await loadPosts();
  }

  async function sharePost(post: Post) {
    const url = `${window.location.origin}/feed?post=${post.id}`;

    if (navigator.share) {
      await navigator.share({
        title: "RepQuest workout update",
        text: post.content,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    setFeedMessage("Post link copied.");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadPosts(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFeedMessage("Please log in first."); return; }
    setLoading(true);
    const { error } = await supabase.from("posts").insert([{ content: content.trim(), user_id: user.id }]);
    setLoading(false);
    if (error) { setFeedMessage("Could not create your post."); return; }
    setContent("");
    setFeedMessage("");
    void loadPosts();
  }

  async function deletePost(id: number) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { setFeedMessage("Could not delete the post."); return; }
    setPosts((current) => current.filter((post) => post.id !== id));
    setPendingDelete(null);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,680px)_300px]">
        <section className="space-y-6">
          <div className="rq-enter flex items-end justify-between">
            <div>
              <p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Your community</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">The Feed</h1>
              <p className="rq-muted mt-2">Show up. Share the work. Keep each other moving.</p>
            </div>
            <button type="button" className="rq-interactive hidden rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-ink)] sm:block">＋ Invite</button>
          </div>

          <div className="rq-enter rq-delay-1 rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--accent)] text-lg font-black text-[var(--accent-ink)]">RQ</div>
              <div><p className="font-bold">Share your progress</p><p className="rq-muted text-sm">What did you accomplish today?</p></div>
            </div>
            {feedMessage && (
  <p className="mb-4 text-red-400">
    {feedMessage}
  </p>
)}
            <form onSubmit={handleSubmit}>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Tell your crew about the session..." className="w-full resize-none rounded-xl border border-black/10 bg-[var(--background)] p-4 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30" />
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="rq-muted flex gap-4 text-sm"><span>📷 Photo</span><span>🏷️ Tag workout</span></div>
                <button type="submit" disabled={loading} className="rq-accent-button rq-interactive rounded-full px-5 py-2.5 text-sm font-bold disabled:cursor-wait disabled:opacity-60">{loading ? "Posting..." : "Post update"}</button>
              </div>
            </form>
          </div>

          <div className="rq-surface-muted flex gap-1 rounded-xl p-1 text-sm font-bold">
            {(["following", "discover", "challenges"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg px-3 py-2.5 capitalize transition ${activeTab === tab ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "rq-muted hover:text-[var(--foreground)]"}`}
                aria-pressed={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "challenges" && <div className="rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><p className="rq-accent text-xs font-bold uppercase tracking-[0.2em]">Train together</p><h2 className="mt-2 text-2xl font-black">Pick your next challenge</h2><p className="rq-muted mt-2">Build momentum with athletes chasing the same goal.</p></div>}

          {posts.length === 0 ? (
            <div className="rq-surface rounded-2xl p-10 text-center shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><p className="text-3xl">⚡</p><h2 className="mt-3 text-xl font-bold">Your story starts here</h2><p className="rq-muted mt-2">Share your first update and give your future self something to celebrate.</p></div>
          ) : posts.map((post, index) => {
            const isLiked = post.post_likes?.some((like) => like.user_id === currentUserId) ?? false;
            return <article key={post.id} className={`rq-enter rq-delay-${Math.min(index + 2, 5)} rq-surface overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(20,40,20,0.08)]`}>
              <div className="flex items-center justify-between p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface-muted)] font-bold">{post.user_id.slice(0, 2).toUpperCase()}</div><div><p className="font-bold">Your training log</p><p className="rq-muted text-xs">{new Date(post.created_at).toLocaleString()}</p></div></div><span className="rq-accent text-xl">✦</span></div>
              <div className="px-5 pb-4"><p className="text-lg leading-relaxed">{post.content}</p><div className="mt-4 inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold">WORKOUT UPDATE</div></div>
              <div className="rq-surface-muted flex items-center gap-5 px-5 py-3 text-sm"><button type="button" onClick={() => void toggleLike(post)} className={`rq-interactive font-bold ${isLiked ? "text-red-500" : "rq-muted"}`}>{isLiked ? "♥" : "♡"} {post.post_likes?.length ?? 0}</button><button type="button" onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)} className="rq-muted rq-interactive">◯ Comment {post.comments?.length ? post.comments.length : ""}</button><button type="button" onClick={() => void sharePost(post)} className="rq-muted rq-interactive ml-auto">↗ Share</button>{pendingDelete === post.id ? <span className="flex items-center gap-2 text-xs"><span>Delete this post?</span><button type="button" onClick={() => void deletePost(post.id)} className="font-bold text-red-500 hover:text-red-400">Yes</button><button type="button" onClick={() => setPendingDelete(null)} className="rq-muted hover:text-[var(--foreground)]">Cancel</button></span> : <button type="button" onClick={() => setPendingDelete(post.id)} className="text-xs text-red-500/70 hover:text-red-500">Delete</button>}</div>
              {post.comments?.length > 0 && <div className="space-y-2 px-5 py-3">{post.comments.map((comment) => <p key={comment.id} className="rq-muted rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm"><span className="font-bold text-[var(--foreground)]">{comment.user_id.slice(0, 2).toUpperCase()}</span> {comment.content}</p>)}</div>}
              {commentingOn === post.id && <form onSubmit={(event) => { event.preventDefault(); void addComment(post.id); }} className="flex gap-2 px-5 pb-5"><input value={commentText[post.id] ?? ""} onChange={(event) => setCommentText((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Write a comment..." className="min-w-0 flex-1 rounded-full border border-black/10 bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]" /><button type="submit" className="rq-accent-button rounded-full px-4 py-2 text-sm font-bold">Send</button></form>}
            </article>;
          })}
        </section>

        <aside className="hidden space-y-6 lg:block">
          <div className="rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Live challenges</h2><span className="rq-accent text-xl">⚡</span></div><div className="mt-5 space-y-5">{suggestedChallenges.map((challenge) => <div key={challenge.name}><div className="flex justify-between text-sm font-bold"><span>{challenge.name}</span><span className="rq-muted">{challenge.progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${challenge.progress}%` }} /></div><p className="rq-muted mt-1 text-xs">{challenge.members} athletes training together</p></div>)}</div><button type="button" className="mt-6 w-full rounded-full border border-[var(--accent)] py-2 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--accent)]/15">Explore all challenges</button></div>
          <div className="rq-surface rounded-2xl p-5 shadow-[0_12px_32px_rgba(20,40,20,0.08)]"><h2 className="text-lg font-bold">Your momentum</h2><p className="rq-muted mt-1 text-sm">Small wins compound.</p><div className="mt-5 flex items-end gap-1" aria-label="Weekly activity chart">{[35, 55, 42, 78, 60, 90, 68].map((height, index) => <div key={index} className="flex-1 rounded-t bg-[var(--accent)]/70" style={{ height: `${height}px` }} />)}</div><div className="rq-muted mt-2 flex justify-between text-[10px] font-bold uppercase"><span>M</span><span>W</span><span>F</span><span>S</span></div></div>
        </aside>
      </div>
    </main>
  );
}

export default function Feed() { return <RequireAuth><FeedContent /></RequireAuth>; }
