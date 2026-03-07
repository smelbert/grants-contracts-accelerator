import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

/**
 * GlobalActivityTracker — mounts once in Layout.
 * Tracks: page views, clicks, keypresses (counts, not content), and time on page.
 * All data goes to UserActivity entity with activity_type="app_interaction".
 */
export default function GlobalActivityTracker({ userEmail }) {
  const location = useLocation();
  const sessionRef = useRef({
    page: location.pathname,
    enterTime: Date.now(),
    clicks: 0,
    keystrokes: 0,
    flushTimer: null,
  });

  const flush = async (reason = 'navigation') => {
    const s = sessionRef.current;
    const durationSeconds = Math.round((Date.now() - s.enterTime) / 1000);
    if (!userEmail || durationSeconds < 2) return;

    try {
      await base44.entities.UserActivity.create({
        user_email: userEmail,
        activity_type: 'page_visit',
        related_entity_type: 'page',
        related_entity_id: s.page,
        metadata: {
          page: s.page,
          duration_seconds: durationSeconds,
          clicks: s.clicks,
          keystrokes: s.keystrokes,
          flush_reason: reason,
          user_agent: navigator.userAgent.slice(0, 100),
        }
      });
    } catch (_) {
      // silent fail — never disrupt UI
    }
  };

  // On page change: flush previous, reset
  useEffect(() => {
    const prev = sessionRef.current;
    if (prev.page !== location.pathname) {
      flush('navigation');
      sessionRef.current = {
        page: location.pathname,
        enterTime: Date.now(),
        clicks: 0,
        keystrokes: 0,
        flushTimer: null,
      };
    }
  }, [location.pathname]);

  // Periodic flush every 60s (for long sessions)
  useEffect(() => {
    const interval = setInterval(() => flush('periodic'), 60000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // Flush on tab close / hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush('tab_hidden');
    };
    const handleBeforeUnload = () => flush('unload');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userEmail]);

  // Count clicks
  useEffect(() => {
    const handleClick = () => { sessionRef.current.clicks++; };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  // Count keystrokes (not content, just count)
  useEffect(() => {
    const handleKey = () => { sessionRef.current.keystrokes++; };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, []);

  return null;
}