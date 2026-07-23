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
    <form onSubmit={handleSubmit} className="reply-composer">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your reply..."
        className={`reply-textarea ${error ? 'error' : ''}`}
        disabled={isLoading}
        rows={3}
        maxLength={5000}
      />
      {error && <div className="reply-error">{error}</div>}
      <button type="submit" className="reply-submit" disabled={isLoading || !body.trim()}>
        {isLoading ? 'Posting...' : 'Post Reply'}
      </button>
      <style jsx>{`
        .reply-composer {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .reply-textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          background: white;
          resize: vertical;
          font-family: inherit;
        }
        .reply-textarea:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
        }
        .reply-textarea.error {
          border-color: #ef4444;
        }
        .reply-error {
          font-size: 12px;
          color: #ef4444;
        }
        .reply-submit {
          align-self: flex-end;
          padding: 10px 20px;
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .reply-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
