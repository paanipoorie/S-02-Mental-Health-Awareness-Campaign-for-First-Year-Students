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
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-2 rounded-sm border border-gray-200 bg-gray-50/30 p-4"
    >
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your reply..."
        className={`bg-background-100 text-copy-14 resize-vertical min-h-[80px] rounded-sm border border-gray-200 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900 ${
          error ? 'border-red-300' : ''
        }`}
        disabled={isLoading}
        rows={3}
        maxLength={5000}
      />
      {error && <div className="text-label-12 font-semibold text-red-600">{error}</div>}
      <button
        type="submit"
        className="bg-primary text-button-14 text-background-100 self-end rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading || !body.trim()}
      >
        {isLoading ? 'Posting...' : 'Post Reply'}
      </button>
    </form>
  );
}
