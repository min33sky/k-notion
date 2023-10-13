import { useEffect, useState } from 'react';

/**
 * 미디어쿼리 훅
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 *
 * @param query Media query string
 */
export default function useMediaQuery(query: string) {
  const getMatches = (query: string) => {
    // Prevents SSR Issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState(getMatches(query));

  const handleChange = () => {
    setMatches(getMatches(query));
  };

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    /**
     * Before Safari 14, MediaQueryList is based on EventTarget and only supports addListener/removeListener for media queries.
     * If you don't support these versions you may remove these checks. Read more about this on .
     */
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener('change', handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener('change', handleChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}
