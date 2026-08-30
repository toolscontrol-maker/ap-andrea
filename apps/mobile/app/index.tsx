import React from 'react';
import { Redirect } from 'expo-router';
import { useDev } from '../src/context/DevContext';
import LoginScreen from './(auth)/login';

export default function IndexScreen() {
  const { isAuthenticated, isLoaded } = useDev();

  if (isLoaded && isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <LoginScreen />;
}
