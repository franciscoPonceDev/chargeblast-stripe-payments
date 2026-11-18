import { tz } from '@date-fns/tz';

// Trade-off: fixed UTC app timezone; identical SSR/CSR output and filter bounds, but times show in UTC, not the viewer's zone.
export const APP_TIME_ZONE = 'UTC';
export const appTz = tz(APP_TIME_ZONE);
