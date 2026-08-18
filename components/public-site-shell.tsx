import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicSiteShell({ children }: { children: ReactNode }) {
  return <main className="public-page">
    <header className="public-header">
      <Brand />
      <nav aria-label="Public navigation">
        <Link href="/demo">Sample garage</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div><ThemeToggle/><Link className="btn btn-primary" href="/signup">Create account</Link></div>
    </header>
    {children}
    <footer className="public-footer">
      <Brand />
      <p>Everything about your car. One garage.</p>
      <nav aria-label="Footer navigation"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></nav>
    </footer>
  </main>;
}

export function PublicDocument({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <PublicSiteShell><article className="public-document">
    <header><h1>{title}</h1><p>{intro}</p><small>Effective August 17, 2026</small></header>
    <div className="public-document-body">{children}</div>
  </article></PublicSiteShell>;
}
