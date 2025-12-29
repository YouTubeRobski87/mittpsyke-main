/**
 * Vercel Speed Insights initialization
 * This file injects the Speed Insights tracking script
 * For Eleventy (which falls under the "other" framework category)
 */

import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights
// This will add the tracking script to your app
injectSpeedInsights();
