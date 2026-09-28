import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('routes/app-layout.tsx', [
    index('routes/home.tsx'),
    route('/components', 'routes/components.tsx'),
    // Inside the layout so an unknown URL keeps the sidebar; its loader sets HTTP 404.
    route('*', 'routes/not-found.tsx'),
  ]),
] satisfies RouteConfig
