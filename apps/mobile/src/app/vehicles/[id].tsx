import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ColorValue } from "react-native";
import { Brand, Button, Divider, InlineMessage, Panel, Screen, Stat } from "@/components/garage-ui";
import { supabase } from "@/lib/supabase";
import { buildVehicleHistory, formatHistoryDate, type VehicleHistoryEvent, type VehicleHistoryTone } from "@/lib/vehicle-history";
import { usePalette } from "@/theme";

interface Vehicle{id:string;year:number;make:string;model:string;trim:string|null;color:string|null;current_mileage:number}
interface Reminder{id:string;title:string;due_date:string|null;due_mileage:number|null}
interface VehicleDetailData{vehicle:Vehicle;photoUrl:string|null;openSymptoms:number;activeCases:number;reminders:Reminder[];history:VehicleHistoryEvent[]}

export default function VehicleDetailScreen(){
  const {id}=useLocalSearchParams<{id:string}>();const p=usePalette();const [data,setData]=useState<VehicleDetailData>();const [error,setError]=useState<string>();
  const load=useCallback(async()=>{
    if(!id)return;setError(undefined);
    const vehicleResult=await supabase.from("vehicles").select("id,year,make,model,trim,color,current_mileage").eq("id",id).maybeSingle();
    if(vehicleResult.error||!vehicleResult.data){setError("This vehicle could not be loaded. Check your connection and try again.");return}
    const [maintenance,symptoms,documents,mileage,reminders,cases,photo]=await Promise.all([
      supabase.from("maintenance_records").select("id,title,record_type,performed_at,mileage,cost").eq("vehicle_id",id).order("performed_at",{ascending:false}),
      supabase.from("symptoms").select("id,title,status,first_noticed_at,mileage,severity").eq("vehicle_id",id).order("first_noticed_at",{ascending:false}),
      supabase.from("documents").select("id,file_name,document_type,uploaded_at").eq("vehicle_id",id).order("uploaded_at",{ascending:false}),
      supabase.from("vehicle_mileage_entries").select("id,mileage,recorded_at,source").eq("vehicle_id",id).order("recorded_at",{ascending:false}),
      supabase.from("reminders").select("id,title,due_date,due_mileage").eq("vehicle_id",id).eq("status","pending").order("due_date",{ascending:true,nullsFirst:false}),
      supabase.from("repair_cases").select("id",{count:"exact",head:true}).eq("vehicle_id",id).not("status","in",'("completed","closed")'),
      supabase.from("documents").select("storage_path").eq("vehicle_id",id).eq("document_type","photo").is("repair_case_id",null).order("uploaded_at",{ascending:false}).limit(1).maybeSingle(),
    ]);
    const queryError=maintenance.error??symptoms.error??documents.error??mileage.error??reminders.error??cases.error??photo.error;
    if(queryError){setError("Some of this vehicle’s history could not be loaded. Try again in a moment.");return}
    let photoUrl:string|null=null;
    if(photo.data?.storage_path){const signed=await supabase.storage.from("vehicle-documents").createSignedUrl(photo.data.storage_path,3600);photoUrl=signed.data?.signedUrl??null}
    const symptomRows=symptoms.data??[];
    setData({
      vehicle:vehicleResult.data,
      photoUrl,
      openSymptoms:symptomRows.filter(item=>item.status!=="resolved").length,
      activeCases:cases.count??0,
      reminders:reminders.data??[],
      history:buildVehicleHistory({maintenance:maintenance.data??[],symptoms:symptomRows,documents:documents.data??[],mileage:mileage.data??[]}),
    });
  },[id]);
  useFocusEffect(useCallback(()=>{void load()},[load]));
  if(!data&&!error)return <Screen><View style={styles.loading}><ActivityIndicator color={p.teal}/></View></Screen>;
  if(error)return <Screen><Brand/><Pressable accessibilityRole="button" onPress={()=>router.back()}><Text style={[styles.back,{color:p.teal}]}>‹ My garage</Text></Pressable><InlineMessage error>{error}</InlineMessage><Button onPress={()=>void load()}>Try again</Button></Screen>;
  if(!data)return null;
  const {vehicle}=data;const attention=data.openSymptoms>0||data.activeCases>0;const status=attention?"Attention recorded":data.reminders.length?"Service planned":"No open items";
  return <Screen>
    <View style={styles.top}><Brand/><Pressable accessibilityRole="button" onPress={()=>router.back()}><Text style={[styles.back,{color:p.teal}]}>My garage</Text></Pressable></View>
    {data.photoUrl?<Image source={data.photoUrl} style={styles.photo} contentFit="cover"/>:null}
    <View style={[styles.vehicleHeader,{backgroundColor:p.amber}]}>
      <Text style={styles.vehicleMeta}>{vehicle.year}{vehicle.color?` · ${vehicle.color}`:""}</Text><Text accessibilityRole="header" style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text><Text style={styles.vehicleTrim}>{vehicle.trim??"Vehicle record"}</Text>
      <View style={[styles.status,{backgroundColor:attention?p.orange:p.teal}]}><Text style={styles.statusText}>{status}</Text></View>
      <View style={styles.mileage}><Text style={styles.mileageValue}>{vehicle.current_mileage.toLocaleString()}</Text><Text style={styles.mileageUnit}> miles</Text></View>
    </View>
    <Panel style={styles.statsPanel}><View style={styles.stats}><Stat label="Open symptoms" value={String(data.openSymptoms)} tone={data.openSymptoms?"orange":"teal"}/><Stat label="Active repairs" value={String(data.activeCases)} tone={data.activeCases?"orange":"teal"}/><Stat label="Reminders" value={String(data.reminders.length)}/></View></Panel>
    <View style={styles.quickActions}><View style={styles.action}><Button onPress={()=>router.push(`/vehicles/${id}/maintenance/new`)}>Add maintenance</Button></View><View style={styles.action}><Button variant="secondary" onPress={()=>router.push(`/vehicles/${id}/symptoms/new`)}>Log a symptom</Button></View></View>
    <SectionTitle title="Service reminders" copy="Only documented due dates and mileage."/>
    {data.reminders.length?<Panel>{data.reminders.slice(0,3).map((reminder,index)=><View key={reminder.id}>{index?<Divider/>:null}<View style={styles.reminder}><ToneIcon tone="service" symbol="bell.fill"/><View style={styles.flex}><Text style={[styles.itemTitle,{color:p.text}]}>{reminder.title}</Text><Text style={[styles.itemMeta,{color:p.muted}]}>{reminder.due_date?`Due ${formatHistoryDate(reminder.due_date)}`:"No due date"}{reminder.due_mileage!==null?` · ${reminder.due_mileage.toLocaleString()} mi`:""}</Text></View></View></View>)}</Panel>:<Panel><Text style={[styles.emptyTitle,{color:p.text}]}>No service reminders</Text><Text style={[styles.emptyCopy,{color:p.muted}]}>Future reminders will appear here without implying mechanical condition.</Text></Panel>}
    <SectionTitle title="Vehicle history" copy={`${data.history.length} documented ${data.history.length===1?"event":"events"}`}/>
    {data.history.length?<View style={styles.timeline}>{data.history.map(event=><HistoryRow event={event} key={event.id}/>)}</View>:<Panel><Text style={[styles.emptyTitle,{color:p.text}]}>No history yet</Text><Text style={[styles.emptyCopy,{color:p.muted}]}>Maintenance, symptoms, mileage, and documents will share this timeline.</Text></Panel>}
  </Screen>;
}

function SectionTitle({title,copy}:{title:string;copy:string}){const p=usePalette();return <View style={styles.sectionHeading}><Text style={[styles.sectionTitle,{color:p.text}]}>{title}</Text><Text style={[styles.sectionCopy,{color:p.muted}]}>{copy}</Text></View>}
function HistoryRow({event}:{event:VehicleHistoryEvent}){const p=usePalette();return <View style={styles.historyRow}><ToneIcon tone={event.tone} symbol={event.tone==="document"?"doc.fill":event.tone==="attention"?"exclamationmark.triangle.fill":event.tone==="service"?"wrench.fill":"checkmark"}/><View style={styles.flex}><View style={styles.historyTop}><Text style={[styles.historyLabel,{color:toneColor(event.tone,p)}]}>{event.label}</Text><Text style={[styles.historyDate,{color:p.muted}]}>{formatHistoryDate(event.date)}</Text></View><Text style={[styles.itemTitle,{color:p.text}]}>{event.title}</Text>{event.detail||event.mileage?<Text style={[styles.itemMeta,{color:p.muted}]}>{event.detail}{event.detail&&event.mileage?" · ":""}{event.mileage?`${event.mileage.toLocaleString()} mi`:""}</Text>:null}</View></View>}
function ToneIcon({tone,symbol}:{tone:VehicleHistoryTone;symbol:"bell.fill"|"doc.fill"|"exclamationmark.triangle.fill"|"wrench.fill"|"checkmark"}){const p=usePalette();return <View style={[styles.toneIcon,{backgroundColor:toneColor(tone,p)}]}><SymbolView name={symbol} tintColor={p.white as ColorValue} size={16}/></View>}
function toneColor(tone:VehicleHistoryTone,p:ReturnType<typeof usePalette>){if(tone==="attention")return p.orange;if(tone==="document")return "#3978b7";if(tone==="service")return "#a56e00";if(tone==="complete")return p.teal;return p.muted}

const styles=StyleSheet.create({loading:{minHeight:600,alignItems:"center",justifyContent:"center"},top:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:18},back:{fontSize:13,fontWeight:"800",paddingVertical:10},photo:{height:240,borderTopLeftRadius:18,borderTopRightRadius:18},vehicleHeader:{position:"relative",borderRadius:18,padding:22,overflow:"hidden"},vehicleMeta:{fontSize:11,fontWeight:"900",letterSpacing:1.2,color:"#5c4711",textTransform:"uppercase"},vehicleName:{fontSize:32,lineHeight:36,fontWeight:"900",letterSpacing:-1,color:"#191c1d",marginTop:7},vehicleTrim:{fontSize:13,color:"#584817",marginTop:5},status:{position:"absolute",top:18,right:18,borderRadius:999,paddingHorizontal:10,paddingVertical:7},statusText:{fontSize:10,fontWeight:"900",color:"#fff"},mileage:{flexDirection:"row",alignItems:"baseline",marginTop:34},mileageValue:{fontSize:38,fontWeight:"900",letterSpacing:-1.2,color:"#191c1d"},mileageUnit:{fontSize:14,fontWeight:"700",color:"#584817"},statsPanel:{marginTop:-12,marginHorizontal:12},stats:{flexDirection:"row",justifyContent:"space-between",gap:12},quickActions:{flexDirection:"row",gap:10,marginTop:14},action:{flex:1},sectionHeading:{marginTop:28,marginBottom:10},sectionTitle:{fontSize:19,fontWeight:"900",letterSpacing:-.3},sectionCopy:{fontSize:12,lineHeight:18,marginTop:3},reminder:{flexDirection:"row",alignItems:"center",gap:12},flex:{flex:1},itemTitle:{fontSize:14,fontWeight:"800"},itemMeta:{fontSize:12,lineHeight:18,marginTop:4},timeline:{gap:10},historyRow:{flexDirection:"row",alignItems:"flex-start",gap:12},historyTop:{flexDirection:"row",justifyContent:"space-between",gap:12},historyLabel:{fontSize:10,fontWeight:"900",letterSpacing:.8,textTransform:"uppercase"},historyDate:{fontSize:11},toneIcon:{width:34,height:34,borderRadius:17,alignItems:"center",justifyContent:"center"},emptyTitle:{fontSize:15,fontWeight:"800"},emptyCopy:{fontSize:13,lineHeight:20,marginTop:5}});
