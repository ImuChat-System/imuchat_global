'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackButtonsProps {
  helpfulText: string;
}

export default function FeedbackButtons({ helpfulText }: FeedbackButtonsProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="text-gray-700 dark:text-gray-300">{helpfulText}</span>
        <button
          onClick={() => setFeedbackGiven('yes')}
          className={`p-2 rounded-lg transition-colors ${
            feedbackGiven === 'yes'
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => setFeedbackGiven('no')}
          className={`p-2 rounded-lg transition-colors ${
            feedbackGiven === 'no'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>
      {feedbackGiven && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {feedbackGiven === 'yes' ? 'Great! Thanks for your feedback.' : "Thanks for letting us know. We'll improve this article."}
        </p>
      )}
    </div>
  );
}
