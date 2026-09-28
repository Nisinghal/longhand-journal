import { Redirect } from 'expo-router';

/**
 * Boot. Onboarding lives behind a settings flag; until that screen is built,
 * land straight in the composer.
 */
export default function Index() {
  return <Redirect href="/(tabs)/today" />;
}
