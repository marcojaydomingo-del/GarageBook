import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Brand, Button, PageTitle, Panel, Screen } from "@/components/garage-ui";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/providers/session-provider";
import { usePalette } from "@/theme";
export default function SettingsScreen(){const {session}=useSession();const p=usePalette();async function signOut(){await supabase.auth.signOut();router.replace("/login")}return <Screen><Brand/><PageTitle subtitle="Account and application preferences.">Settings</PageTitle><Panel><Text style={[styles.label,{color:p.muted}]}>Signed in as</Text><Text style={[styles.email,{color:p.text}]}>{session?.user.email??"GarageBook user"}</Text><View style={styles.action}><Button variant="secondary" onPress={signOut}>Sign out</Button></View></Panel><Text style={[styles.note,{color:p.muted}]}>Vehicle records are private by default and protected by the same Supabase Row Level Security policies as the web application.</Text></Screen>}
const styles=StyleSheet.create({label:{fontSize:12,fontWeight:"700"},email:{fontSize:16,fontWeight:"700",marginTop:5},action:{marginTop:20},note:{fontSize:12,lineHeight:18,marginTop:16,paddingHorizontal:4}});
