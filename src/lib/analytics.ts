/**
 * Analytics shim — vendor-agnostic event tracking.
 *
 * No vendor SDK is wired up yet. Calls to `track()` are buffered to
 * `window.dataLayer` (GA4 / GTM convention) and forwarded to
 * `window.lovableAnalytics?.track(...)` if a vendor adapter has been
 * registered. In dev, events are logged for visibility.
 *
 * To plug in a real provider later (PostHog, Segment, GA4, Plausible, etc.),
 * implement an adapter that sets `window.lovableAnalytics`:
 *
 *   window.lovableAnalytics = {
 *     track: (name, props) => posthog.capture(name, props),
 *   };
 *
 * Or read from `window.dataLayer` directly via GTM.
 */

import { useEffect } from "react";

export type AnalyticsEventName =
  | "newsletter_signup"
  | "job_saved"
  | "apply_clicked"
  | "employer_page_view"
  | "pricing_page_view";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

type VendorAdapter = {
  track?: (name: string, props?: AnalyticsProps) => void;
  page?: (name: string, props?: AnalyticsProps) => void;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    lovableAnalytics?: VendorAdapter;
  }
}

const isBrowser = typeof window !== "undefined";
const isDev = import.meta.env.DEV;

export function track(name: AnalyticsEventName, props?: AnalyticsProps): void {
  if (!isBrowser) return;
  const payload = { event: name, ...(props ?? {}), ts: Date.now() };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.lovableAnalytics?.track?.(name, props);
  } catch {
    // never let analytics break the app
  }

  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props ?? {});
  }
}

/** Fire a page-view event once per mount. */
export function usePageView(name: AnalyticsEventName, props?: AnalyticsProps): void {
  // Stable serialization so the effect only re-runs if props actually change.
  const key = props ? JSON.stringify(props) : "";
  useEffect(() => {
    track(name, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
}
