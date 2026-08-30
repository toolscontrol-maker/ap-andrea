import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useDev } from '../src/context/DevContext';
import LoginScreen from './(auth)/login';

export default function IndexScreen() {
  const { isAuthenticated, isLoaded } = useDev();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAF8F5', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#EF826A" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <LoginScreen />;
}
