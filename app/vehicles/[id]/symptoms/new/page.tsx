import { AppShell } from "@/components/app-shell";
import { SymptomForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
export default function NewSymptomPage(){return <AppShell><div className="mx-auto max-w-3xl"><PageHeader eyebrow="2014 MINI Cooper S Paceman" title="Log a symptom" description="Capture what you notice before a repair. This becomes the beginning of a traceable repair case."/><SymptomForm/></div></AppShell>}
