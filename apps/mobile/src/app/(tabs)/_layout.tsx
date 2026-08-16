import { Redirect, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Platform, StyleSheet, View, type ColorValue } from "react-native";
import { useSession } from "@/providers/session-provider";
import { usePalette } from "@/theme";

function Icon({name,color}:{name:"house.fill"|"car.fill"|"wrench.and.screwdriver.fill"|"gearshape.fill";color:ColorValue}){return <SymbolView name={name} tintColor={color} size={22}/>}
export default function TabsLayout(){const {session,loading}=useSession();const p=usePalette();if(loading)return <View style={[styles.loading,{backgroundColor:p.canvas}]}><ActivityIndicator color={p.teal}/></View>;if(!session)return <Redirect href="/login"/>;if(session.user.user_metadata.onboarding_completed!==true)return <Redirect href="/onboarding"/>;return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:p.teal,tabBarInactiveTintColor:p.muted,tabBarStyle:{backgroundColor:p.card,borderTopColor:p.border,height:Platform.OS==="android"?76:84,paddingTop:8},tabBarLabelStyle:{fontSize:11,fontWeight:"700"}}}>
  <Tabs.Screen name="index" options={{title:"Today",tabBarIcon:({color})=><Icon name="house.fill" color={color}/>}}/>
  <Tabs.Screen name="garage" options={{title:"Garage",tabBarIcon:({color})=><Icon name="car.fill" color={color}/>}}/>
  <Tabs.Screen name="shops" options={{title:"Shops",tabBarIcon:({color})=><Icon name="wrench.and.screwdriver.fill" color={color}/>}}/>
  <Tabs.Screen name="settings" options={{title:"Settings",tabBarIcon:({color})=><Icon name="gearshape.fill" color={color}/>}}/>
  </Tabs>}
const styles=StyleSheet.create({loading:{flex:1,alignItems:"center",justifyContent:"center"}});
