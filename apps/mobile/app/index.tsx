import React from 'react';
import { Redirect } from 'expo-router';
import { useDev } from '../src/context/DevContext';

export default function IndexScreen() {
  const { isAuthenticated } = useDev();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
