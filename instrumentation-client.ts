// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Client Sentry initialization is handled by sentry.client.config.ts
// This file should not call Sentry.init() to avoid duplicate SDK instances.

export const onRouterTransitionStart = Sentry.browserTracingIntegration();