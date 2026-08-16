"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemePreference="light"|"dark"|"system";

const options=[
  {value:"light" as const,label:"Light",icon:Sun},
  {value:"dark" as const,label:"Dark",icon:Moon},
  {value:"system" as const,label:"System",icon:Laptop},
];

function applyTheme(preference:ThemePreference){
  const dark=preference==="dark"||(preference==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme=dark?"dark":"light";
  document.documentElement.style.colorScheme=dark?"dark":"light";
}

export function ThemeToggle(){
  const [preference,setPreference]=useState<ThemePreference>("system");
  useEffect(()=>{
    const saved=window.localStorage.getItem("garagebook-theme");
    const initial=saved==="light"||saved==="dark"?saved:"system";
    applyTheme(initial);
    const frame=window.requestAnimationFrame(()=>setPreference(initial));
    const media=window.matchMedia("(prefers-color-scheme: dark)");
    const update=()=>{if((window.localStorage.getItem("garagebook-theme")??"system")==="system")applyTheme("system")};
    media.addEventListener("change",update);return()=>{window.cancelAnimationFrame(frame);media.removeEventListener("change",update)};
  },[]);
  function select(value:ThemePreference){
    setPreference(value);
    if(value==="system")window.localStorage.removeItem("garagebook-theme");else window.localStorage.setItem("garagebook-theme",value);
    applyTheme(value);
  }
  return <div className="theme-toggle" aria-label="Color theme" role="group">
    {options.map(({value,label,icon:Icon})=><button aria-label={`Use ${label.toLowerCase()} theme`} aria-pressed={preference===value} className="theme-toggle-button" key={value} onClick={()=>select(value)} title={`${label} theme`} type="button"><Icon size={15}/><span className="sr-only">{label}</span></button>)}
  </div>;
}
