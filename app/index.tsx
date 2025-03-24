import { Redirect } from 'expo-router';

export default function Index() {
  // Simple entry point that redirects to the app
  // We'll handle auth in the main layout
  return <Redirect href="/dashboard" />;
}