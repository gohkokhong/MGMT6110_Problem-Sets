import { redirect } from 'react-router'

// The app opens on its first screen; there is no separate home page.
export function loader() {
  return redirect('/triage')
}
