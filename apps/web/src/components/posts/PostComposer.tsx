import { useState } from 'react';
import { EmotionPicker } from '../emotion/EmotionPicker';
import { UrgencyPicker } from '../emotion/UrgencyPicker';
import { CategoryPicker } from './CategoryPicker';
import type { PostCategory } from '@shared-types/enums';

interface PostComposerProps {
  onSubmit: (data: PostComposerData) => Promise<void>;
  initialData?: Partial<PostComposerData>;
  isLoading?: boolean;
}

interface PostComposerData {
  title: string;
  body: string;
  category: PostCategory;
  emotion?: string;
  urgencyLevel?: string;
}

export function PostComposer({ onSubmit, initialData = {}, isLoading = false }: PostComposerProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [body, setBody] = useState(initialData.body || '');
  const [category, setCategory] = useState<PostCategory>(initialData.category || 'GENERAL');
  const [emotion, setEmotion] = useState<string>(initialData.emotion || '');
  const [urgency, setUrgency] = useState<string>(initialData.urgencyLevel || '');
  const [errors, setErrors] = useState<Partial<Record<keyof PostComposerData, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validate = () => {
    const newErrors: Partial<Record<keyof PostComposerData, string>> = {};
    let isValid = true;

    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
      isValid = false;
    }
    if (!body.trim() || body.trim().length < 10) {
      newErrors.body = 'Body must be at least 10 characters';
      isValid = false;
    }
    if (!category) {
      newErrors.category = 'Please select a category';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        category,
        emotion: emotion || undefined,
        urgencyLevel: urgency || undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-composer">
      <div className="composer-field">
        <label htmlFor="title" className="field-label">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's on your mind? (min 5 characters)"
          className={`field-input ${errors.title ? 'error' : ''}`}
          disabled={isLoading}
          maxLength={200}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <span id="title-error" className="field-error">
            {errors.title}
          </span>
        )}
      </div>

      <div className="composer-field">
        <label htmlFor="body" className="field-label">
          Share your thoughts
        </label>
        <textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your post here... (min 10 characters)"
          className={`field-textarea ${errors.body ? 'error' : ''}`}
          disabled={isLoading}
          rows={6}
          maxLength={10000}
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? 'body-error' : undefined}
        />
        {errors.body && (
          <span id="body-error" className="field-error">
            {errors.body}
          </span>
        )}
      </div>

      <CategoryPicker selectedCategory={category} onSelect={setCategory} />

      <div className="composer-field">
        <label className="field-label">How are you feeling? (optional)</label>
        <EmotionPicker selectedEmotion={emotion as any} onSelect={setEmotion} />
      </div>

      <div className="composer-field">
        <label className="field-label">Urgency level (optional)</label>
        <UrgencyPicker selectedUrgency={urgency as any} onSelect={setUrgency} />
      </div>

      {submitError && <div className="submit-error">{submitError}</div>}

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post Anonymously'}
      </button>

      <style jsx>{`
        .post-composer {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .composer-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }
        .field-input,
        .field-textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          background: white;
          font-family: inherit;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .field-input:focus,
        .field-textarea:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
        }
        .field-input.error,
        .field-textarea.error {
          border-color: #ef4444;
        }
        .field-textarea {
          resize: vertical;
          min-height: 120px;
        }
        .field-error {
          font-size: 12px;
          color: #ef4444;
        }
        .submit-error {
          padding: 10px 12px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 13px;
        }
        .submit-btn {
          align-self: flex-start;
          padding: 12px 24px;
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.1s ease,
            box-shadow 0.15s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}

export default PostComposer;
