/* eslint-disable react-dom/no-missing-button-type */
import { useState } from 'react';

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { idea: string; details?: string; email?: string }) => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose, onSubmit, loading, error, success }) => {
  const [idea, setIdea] = useState('');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      return;
    }
    onSubmit({ idea, details, email });
  };

  React.useEffect(() => {
    if (success) {
      setIdea('');
      setDetails('');
      setEmail('');
    }
  }, [success]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
        <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="mb-2 text-lg font-semibold">Share your feedback</h2>
        <p className="mb-4 text-sm text-gray-600">Whether it's a bug report, feature idea, or general feedback - we'd love to hear from you.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="idea-input" className="text-sm font-medium">
            What would you like to share?
            <span className="text-red-500">*</span>
          </label>
          <input
            id="idea-input"
            className="rounded border px-2 py-1"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            required
            maxLength={256}
            placeholder="Describe your feedback, bug report, or idea"
          />
          <label htmlFor="details-textarea" className="text-sm font-medium">Tell us more (optional)</label>
          <textarea
            id="details-textarea"
            className="rounded border px-2 py-1"
            value={details}
            onChange={e => setDetails(e.target.value)}
            maxLength={1024}
            placeholder="Add more details if you like"
          />
          <label htmlFor="email-input" className="text-sm font-medium">Your email (optional)</label>
          <input
            id="email-input"
            className="rounded border px-2 py-1"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            maxLength={128}
            placeholder="If you want updates"
          />
          {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
          {success && <div className="mt-1 text-xs text-green-600">Thank you for your feedback!</div>}
          <button
            type="submit"
            className="mt-2 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
            disabled={loading || !idea.trim()}
          >
            {loading ? 'Sending...' : 'Send feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};
