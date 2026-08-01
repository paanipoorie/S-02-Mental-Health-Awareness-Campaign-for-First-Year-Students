import { useState } from 'react';
import { EmotionPicker } from '../emotion/EmotionPicker';
import { UrgencyPicker } from '../emotion/UrgencyPicker';
import { CategoryPicker } from './CategoryPicker';
import type { PostCategory } from '@shared-types/enums';
import { api } from '../../lib/api';

interface PostComposerProps {
  initialData?: Partial<PostComposerData>;
}

interface PostComposerData {
  title: string;
  body: string;
  category: PostCategory;
  emotion?: string;
  urgencyLevel?: string;
}

export function PostComposer({ initialData = {} }: PostComposerProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [body, setBody] = useState(initialData.body || '');
  const [category, setCategory] = useState<PostCategory>(initialData.category || 'GENERAL');
  const [emotion, setEmotion] = useState<string>(initialData.emotion || '');
  const [urgency, setUrgency] = useState<string>(initialData.urgencyLevel || '');
  const [errors, setErrors] = useState<Partial<Record<keyof PostComposerData, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      const response = await api.post<{ id: string }>('/posts', {
        title: title.trim(),
        body: body.trim(),
        category,
        emotion: emotion || undefined,
        urgencyLevel: urgency || undefined,
      });
      window.location.href = `/posts/${response.id}`;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-label-13 font-semibold text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's on your mind? (min 5 characters)"
          className={`bg-background-100 text-copy-14 rounded-sm border border-gray-200 px-3.5 py-2 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900 ${
            errors.title ? 'border-red-300' : ''
          }`}
          disabled={submitting}
          maxLength={200}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <span id="title-error" className="text-label-12 font-semibold text-red-600">
            {errors.title}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-label-13 font-semibold text-gray-700">
          Share your thoughts
        </label>
        <textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your post here... (min 10 characters)"
          className={`bg-background-100 text-copy-14 resize-vertical min-h-[140px] rounded-sm border border-gray-200 px-3.5 py-2 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900 ${
            errors.body ? 'border-red-300' : ''
          }`}
          disabled={submitting}
          rows={6}
          maxLength={10000}
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? 'body-error' : undefined}
        />
        {errors.body && (
          <span id="body-error" className="text-label-12 font-semibold text-red-600">
            {errors.body}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-label-13 font-semibold text-gray-700">Category</label>
        <CategoryPicker selectedCategory={category} onSelect={setCategory} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-label-13 font-semibold text-gray-700">
          How are you feeling? (optional)
        </label>
        <EmotionPicker selectedEmotion={emotion as any} onSelect={setEmotion} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-label-13 font-semibold text-gray-700">
          Urgency level (optional)
        </label>
        <UrgencyPicker selectedUrgency={urgency as any} onSelect={setUrgency} />
      </div>

      {submitError && (
        <div className="rounded-sm border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        className="bg-primary text-button-14 text-background-100 self-start rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Posting...' : 'Post Anonymously'}
      </button>
    </form>
  );
}

export default PostComposer;
