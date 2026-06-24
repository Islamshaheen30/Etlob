import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <LocaleProvider>
          <AuthProvider>
            <OrdersProvider>
              <CartProvider>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="restaurant/[id]" />
                  <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="checkout" />
                  <Stack.Screen name="track/[orderId]" />
                </Stack>
              </CartProvider>
            </OrdersProvider>
          </AuthProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
