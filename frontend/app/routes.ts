import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('routes/app-layout.tsx', [
    // "/" redirects to the first screen.
    index('routes/home.tsx'),
    route('/triage', 'routes/triage.tsx'),
    route('/records', 'routes/records.tsx'),
    route('/attachments', 'routes/attachments.tsx'),
    // Style reference for the UI kit, not a product screen: reachable by URL, not linked from the nav.
    route('/components', 'routes/components.tsx'),
    // Inside the layout so an unknown URL keeps the sidebar; its loader sets HTTP 404.
    route('*', 'routes/not-found.tsx'),
  ]),
] satisfies RouteConfig
