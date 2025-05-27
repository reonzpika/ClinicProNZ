import React, { useState } from 'react';

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
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="mb-2 text-lg font-semibold">💡 Got an idea to make your life easier?</h2>
        <p className="mb-4 text-sm text-gray-600">We'd love to hear from you.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            📌 What's your idea?
            <span className="text-red-500">*</span>
          </label>
          <input
            className="rounded border px-2 py-1"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            required
            maxLength={256}
            placeholder="Describe your idea in one sentence"
          />
          <label className="text-sm font-medium">✍️ Tell us more (optional)</label>
          <textarea
            className="rounded border px-2 py-1"
            value={details}
            onChange={e => setDetails(e.target.value)}
            maxLength={1024}
            placeholder="Add more details if you like"
          />
          <label className="text-sm font-medium">📧 Your email (optional)</label>
          <input
            className="rounded border px-2 py-1"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            maxLength={128}
            placeholder="If you want updates"
          />
          {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
          {success && <div className="mt-1 text-xs text-green-600">Thank you for your suggestion!</div>}
          <button
            type="submit"
            className="mt-2 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
            disabled={loading || !idea.trim()}
          >
            {loading ? 'Sending...' : '🧠 Send suggestion'}
          </button>
        </form>
      </div>
    </div>
  );
};
