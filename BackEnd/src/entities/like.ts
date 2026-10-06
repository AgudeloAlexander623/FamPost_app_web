// like.ts

import { useState } from 'react';

export function useLike(postId: string, initialLiked: boolean, initialCount: number) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);

  async function toggleLike() {
    if (saving) return; // simple guard
    setSaving(true);
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setCount(c => c + (optimisticLiked ? 1 : -1));

    try {
      const res = await fetch(`/posts/${postId}/like`, {
        method: optimisticLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Network error');
      const body = await res.json();
      setLiked(body.liked);
      setCount(body.count);
    } catch (err) {
      // revert on error
      setLiked(liked);
      setCount(c => c + (liked ? 0 : 0)); // no-op here; you may re-fetch
      console.error('Like action failed', err);
    } finally {
      setSaving(false);
    }
  }

  return { liked, count, toggleLike, saving };
}