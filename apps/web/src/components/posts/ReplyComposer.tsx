import type { FormEvent } from 'react';
import { useState } from 'react';

interface ReplyComposerProps {
  onSubmit: (body: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReplyComposer({ onSubmit, isLoading = false }: ReplyComposerProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!body.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    if (body.trim().length > 5000) {
      setError('Reply is too long (max 5000 characters)');
      return;
    }

    try {
      await onSubmit(body.trim());
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 p-4 border border-gray-200 bg-gray-50/30 rounded-sm">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your reply..."
        className={`rounded-sm border border-gray-200 bg-background-100 px-3.5 py-2.5 text-copy-14 text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors resize-vertical min-h-[80px] ${
          error ? 'border-red-300' : ''
        }`}
        disabled={isLoading}
        rows={3}
        maxLength={5000}
      />
      {error && <div className="text-label-12 text-red-600 font-semibold">{error}</div>}
      <button
        type="submit"
        className="self-end rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !body.trim()}
      >
        {isLoading ? 'Posting...' : 'Post Reply'}
      </button>
    </form>
  );
}
