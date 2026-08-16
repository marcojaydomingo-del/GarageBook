import { useColorScheme } from "react-native";

export const palettes={
  light:{canvas:"#f4f0e9",card:"#fffdf9",surface:"#ebe6dd",text:"#191c1d",muted:"#66706e",border:"#dedbd4",amber:"#f3bd3d",amberSoft:"#fff0c2",teal:"#14897f",tealSoft:"#e5f3f1",orange:"#e97732",danger:"#b42318",white:"#ffffff"},
  dark:{canvas:"#0d1011",card:"#171a1b",surface:"#202425",text:"#f4f0e9",muted:"#aab2b0",border:"#333839",amber:"#f3bd3d",amberSoft:"#3a3018",teal:"#4dbbb0",tealSoft:"#173a37",orange:"#ef8b4d",danger:"#ff8a80",white:"#ffffff"},
} as const;
export function usePalette(){return palettes[useColorScheme()==="dark"?"dark":"light"]}
