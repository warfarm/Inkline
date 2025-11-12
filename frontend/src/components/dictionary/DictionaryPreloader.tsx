import { useEffect, useState } from 'react';
import { loadFullChineseDict, getChineseDictStats } from '@/lib/dictionaries/chinese';
import { useAuth } from '@/hooks/useAuth';

/**
 * Optional component to preload Chinese dictionary with visual feedback
 * Can be placed in App.tsx or any layout component
 */
export function DictionaryPreloader() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.target_language === 'zh') {
      const stats = getChineseDictStats();

      // Already loaded, no need to show UI
      if (stats.fullDictLoaded) {
        setLoaded(true);
        return;
      }

      // Start loading
      setLoading(true);
      console.log('[DictionaryPreloader] Loading Chinese dictionary...');

      loadFullChineseDict()
        .then(() => {
          const finalStats = getChineseDictStats();
          console.log('[DictionaryPreloader] Dictionary loaded:', finalStats);
          setLoading(false);
          setLoaded(true);

          // Auto-hide after 2 seconds
          setTimeout(() => {
            setLoaded(false);
          }, 2000);
        })
        .catch((err) => {
          console.error('[DictionaryPreloader] Failed to load:', err);
          setLoading(false);
          setError('Failed to load dictionary');
        });
    }
  }, [profile?.target_language]);

  // Don't show anything if not Chinese learner
  if (profile?.target_language !== 'zh') {
    return null;
  }

  // Don't show if already loaded (after timeout)
  if (!loading && !loaded && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {loading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Loading Chinese Dictionary
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                196K words • 15MB
              </p>
            </div>
          </div>
        </div>
      )}

      {loaded && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Dictionary Ready
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                196,574 words loaded
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-800 dark:bg-red-950">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  loadFullChineseDict()
                    .then(() => {
                      setLoading(false);
                      setLoaded(true);
                    })
                    .catch(() => {
                      setLoading(false);
                      setError('Retry failed');
                    });
                }}
                className="mt-1 text-xs text-red-700 underline dark:text-red-300"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
