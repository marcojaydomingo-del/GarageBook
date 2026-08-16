import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SessionProvider } from "@/providers/session-provider";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SessionProvider>
  );
}
