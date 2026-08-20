"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { CircleHelp, X } from "lucide-react";
import { completeDashboardTour } from "@/app/actions";

const TOUR_VERSION = 1;
const STORAGE_KEY = `garagebook-dashboard-tour-v${TOUR_VERSION}`;
const REPLAY_EVENT = "garagebook:dashboard-tour";
const subscribeToHydration = () => () => undefined;

const steps = [
  { target: '[data-tour="vehicle"]', title: "Your vehicle at a glance", description: "See current mileage, documented status, the next service, and any open symptoms in one place." },
  { target: '[data-tour="journey"]', title: "Follow the whole repair journey", description: "OTTOKO connects the symptom, shop, estimate, repair, invoice, and final history." },
  { target: '[data-tour="history"]', title: "A trustworthy vehicle history", description: "Maintenance, repairs, symptoms, mileage, and documents all appear on one timeline." },
  { target: '[data-tour="actions"]', title: "Record what happens next", description: "Add service, log a symptom, or open your vehicle photo gallery from these quick actions." },
  { target: '[data-tour="reminders"]', title: "Stay ahead of service", description: "Use reminders to plan work by date or mileage before it becomes urgent." },
] as const;

interface HighlightRect { height:number;left:number;top:number;width:number }
interface PopoverPosition { left:number;top:number }

export function DashboardTour({initialOpen}:{initialOpen:boolean}){
  const [tourState,setTourState]=useState<"default"|"open"|"closed">("default");
  const [stepIndex,setStepIndex]=useState(0);
  const [highlight,setHighlight]=useState<HighlightRect|null>(null);
  const [popover,setPopover]=useState<PopoverPosition|null>(null);
  const [,startTransition]=useTransition();
  const primaryButtonRef=useRef<HTMLButtonElement>(null);
  const popoverRef=useRef<HTMLElement>(null);
  const step=steps[stepIndex];
  const hydrated=useSyncExternalStore(subscribeToHydration,()=>true,()=>false);
  const locallyCompleted=hydrated&&window.localStorage.getItem(STORAGE_KEY)==="done";
  const open=tourState==="open"||(tourState==="default"&&hydrated&&initialOpen&&!locallyCompleted);

  const positionStep=useCallback(()=>{
    if(!open||!step)return;
    const target=document.querySelector<HTMLElement>(step.target);
    if(!target){setHighlight(null);setPopover(null);return}
    const rect=target.getBoundingClientRect();const padding=7;const highlightLeft=Math.max(8,rect.left-padding);
    setHighlight({height:rect.height+padding*2,left:highlightLeft,top:Math.max(8,rect.top-padding),width:Math.min(window.innerWidth-highlightLeft-8,rect.width+padding*2)});
    if(window.matchMedia("(max-width: 720px)").matches){setPopover(null);return}
    const popoverWidth=360;const popoverHeight=250;const gap=18;const below=rect.bottom+gap;
    setPopover({left:Math.min(Math.max(18,rect.left),window.innerWidth-popoverWidth-18),top:below+popoverHeight<window.innerHeight?below:Math.max(18,rect.top-popoverHeight-gap)});
  },[open,step]);

  useEffect(()=>{
    const replay=()=>{setStepIndex(0);setTourState("open")};
    window.addEventListener(REPLAY_EVENT,replay);
    return()=>window.removeEventListener(REPLAY_EVENT,replay);
  },[]);

  useEffect(()=>{
    if(!open||!step)return;
    document.querySelector<HTMLElement>(step.target)?.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});
    const timer=window.setTimeout(positionStep,280);
    window.addEventListener("resize",positionStep);window.addEventListener("scroll",positionStep,true);
    primaryButtonRef.current?.focus();
    return()=>{window.clearTimeout(timer);window.removeEventListener("resize",positionStep);window.removeEventListener("scroll",positionStep,true)};
  },[open,positionStep,step]);

  const dismiss=useCallback(()=>{
    window.localStorage.setItem(STORAGE_KEY,"done");setTourState("closed");
    startTransition(()=>{void completeDashboardTour()});
  },[startTransition]);

  useEffect(()=>{
    if(!open)return;const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){dismiss();return}
      if(event.key!=="Tab")return;
      const focusable=popoverRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])');
      if(!focusable?.length)return;
      const first=focusable[0];const last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    };
    window.addEventListener("keydown",onKeyDown);return()=>window.removeEventListener("keydown",onKeyDown);
  },[dismiss,open]);

  if(!open||!step)return null;
  const isLastStep=stepIndex===steps.length-1;
  const highlightStyle=highlight?{height:highlight.height,left:highlight.left,top:highlight.top,width:highlight.width}:undefined;
  const popoverStyle=popover?{left:popover.left,top:popover.top}:undefined;

  return <>
    {!highlight&&<div className="tour-screen" aria-hidden="true"/>}
    {highlight&&<div className="tour-highlight" style={highlightStyle} aria-hidden="true"/>}
    <section ref={popoverRef} className="tour-popover" style={popoverStyle} role="dialog" aria-modal="true" aria-labelledby="dashboard-tour-title" aria-describedby="dashboard-tour-description">
      <div className="tour-topline"><span>Step {stepIndex+1} of {steps.length}</span><button type="button" onClick={dismiss} aria-label="Skip dashboard tour"><X size={18}/></button></div>
      <div className="tour-progress" aria-hidden="true">{steps.map((item,index)=><span className={index<=stepIndex?"active":""} key={item.title}/>)}</div>
      <h2 id="dashboard-tour-title">{step.title}</h2>
      <p id="dashboard-tour-description">{step.description}</p>
      <div className="tour-actions">
        <button className="tour-skip" type="button" onClick={dismiss}>Skip tour</button>
        <div>
          {stepIndex>0&&<button className="btn btn-secondary" type="button" onClick={()=>setStepIndex(index=>index-1)}>Back</button>}
          <button className="btn btn-primary" type="button" ref={primaryButtonRef} onClick={()=>isLastStep?dismiss():setStepIndex(index=>index+1)}>{isLastStep?"Finish":"Next"}</button>
        </div>
      </div>
    </section>
  </>;
}

export function DashboardTourReplay(){return <button className="btn btn-secondary dashboard-tour-replay" type="button" onClick={()=>window.dispatchEvent(new Event(REPLAY_EVENT))}><CircleHelp size={16}/>Take a tour</button>}
