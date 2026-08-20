---
name: OTTOKO
description: A connected, evidence-first vehicle history workspace.
colors:
  service-amber: "#f3bd3d"
  service-amber-soft: "#fff0c2"
  health-teal: "#14897f"
  health-teal-dark: "#0f6c65"
  warning-orange: "#e97732"
  garage-charcoal: "#191c1d"
  warm-canvas: "#f4f0e9"
  paper-card: "#fffdf9"
  soft-surface: "#ebe6dd"
  quiet-text: "#66706e"
  seam: "#dedbd4"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "2.7rem"
    fontWeight: 720
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.3
rounded:
  control: "10px"
  panel: "14px"
  composition: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.service-amber}"
    textColor: "{colors.garage-charcoal}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.garage-charcoal}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  panel:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.garage-charcoal}"
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design System: OTTOKO

## Overview

**Creative North Star: "The Service Ledger Cockpit"**

OTTOKO combines the clarity of a durable service ledger with the decisive hierarchy of an automotive cockpit. Large, connected regions replace generic card grids: vehicle identity, scheduled service, the repair journey, and chronological evidence each occupy a recognizable place.

The interface is warm and practical in daylight and becomes a low-glare charcoal workspace at night. Amber identifies service and action, while teal is reserved for documented health and confirmation.

**Key Characteristics:**
- Asymmetric split compositions with connected seams.
- Matte warm paper and charcoal materials.
- Dense, readable history rather than decorative analytics.
- One persistent light, dark, or system theme preference.

## Colors

The palette pairs service amber with warm neutrals; health teal remains semantic and intentionally scarce.

**The Evidence Color Rule.** Teal communicates confirmed, healthy, or complete states only. Amber owns primary action and scheduled service. Orange identifies problems that need attention, and blue identifies documents or estimates. Semantic color is concentrated in history, reminders, and evidence-bearing status; it is not decorative.

**The Mustard Bridge Rule.** Amber bands connect related stages and anchor major page headers. Icons inside an amber band remain muted monochrome charcoal or cream. Never place a row of multi-colored icons inside the amber repair journey.

## Typography

OTTOKO uses Geist as a compact workhorse across headings, controls, measurements, and body copy. Display headings are bold and tightly tracked; operational labels remain small but never faint.

**The Measurement Rule.** Mileage and costs may use stronger scale, but never mimic gauges or automotive-instrument decoration.

## Layout

Desktop surfaces use a maximum content width near 1480px. The dashboard begins with a 58/42 split between the vehicle command panel and service planner, followed by one continuous amber repair-journey ribbon and a charcoal history-plus-paper-sidecar workspace. At tablet widths the split stacks; at phone widths every action becomes a full-width row and primary navigation moves to the floating warm-paper bottom bar with a central amber add action.

Spacing follows an 8px-derived rhythm, with 16–24px panel padding and more separation between sections than inside related groups.

## Elevation & Depth

Tonal layering and 1px seams carry most depth. Soft ambient shadows are reserved for the main cockpit and the overlapping repair ribbon; routine cards remain flat.

**The Matte Surface Rule.** Do not use glass, colored glow, or shadows on every panel.

## Shapes

Controls use restrained 10px corners, working panels use 14px, and major compositions use 16px. Pills are limited to compact status labels and circular journey markers.

## Components

### Buttons

Primary buttons are amber with charcoal text. Secondary buttons match the current paper surface with a 1px seam. Focus uses a visible teal ring and all controls keep a minimum 42–44px target.

### Cards / Containers

Cards are flat paper or charcoal panels with a single border. Prefer connected regions, lists, and split panels over collections of equal-size cards.

### Inputs / Fields

Inputs inherit the active theme surface, use a 10px corner and 1px seam, and shift to teal on focus. Errors state both the problem and the recovery.

### Navigation

Desktop navigation sits in a compact top bar. The active destination uses a soft amber field. Mobile navigation remains fixed at the bottom, with the same four destinations across the authenticated app and a raised central add action.

### Repair Journey

The repair journey is a connected linear control, never a collection of unrelated status chips. On its amber bridge, every stage icon is monochrome; completion and current-state meaning comes from checkmarks, contrast, labels, and position. Teal and orange return in the evidence history and reminders where they carry record meaning.

### Page Families

- Authenticated forms use an amber page banner, a paper record frame, and a quiet amber section label.
- Vehicle and repair pages use the same banners and surfaces while preserving chronological evidence as the visual anchor.
- Shop discovery uses an amber search field above a connected results-and-map workspace.
- Authentication uses a charcoal product-story field paired with a focused paper form.
- Onboarding uses large editorial copy, paper forms, amber progress, and no invented vehicle condition.

## Do's and Don'ts

### Do:
- **Do** keep vehicle identity, mileage, service, and evidence visible within one scan.
- **Do** use real uploaded vehicle photos as contextual material when available.
- **Do** preserve familiar controls and accessible contrast in both themes.

### Don't:
- **Don't** use speedometers, racing motifs, neon, glassmorphism, or luxury-car advertising language.
- **Don't** turn the dashboard into a generic bento grid of equal cards.
- **Don't** imply mechanical diagnosis from record completeness or status colors.
