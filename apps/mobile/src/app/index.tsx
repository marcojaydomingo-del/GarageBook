import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "@/providers/session-provider";
import { usePalette } from "@/theme";

export default function Index() {
  const { session, loading } = useSession();
  const palette = usePalette();
  if (loading) return <View style={[styles.loading,{backgroundColor:palette.canvas}]}><ActivityIndicator color={palette.teal}/></View>;
  if (!session) return <Redirect href="/login" />;
  return <Redirect href={session.user.user_metadata.onboarding_completed === true ? "/(tabs)" : "/onboarding"} />;
}

const styles=StyleSheet.create({loading:{flex:1,alignItems:"center",justifyContent:"center"}});
