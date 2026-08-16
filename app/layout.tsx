import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "GarageBook — Your vehicle history, organized", template: "%s · GarageBook" },
  description: "Track maintenance, symptoms, repairs, documents, and shops in one clear vehicle history.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "GarageBook — Every repair. One clear record.", description: "Track your complete vehicle repair journey in one trusted history.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "GarageBook — Every repair. One clear record.", description: "Track your complete vehicle repair journey in one trusted history.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`(()=>{try{const p=localStorage.getItem('garagebook-theme');const d=p==='dark'||(!p&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch{}})()`}}/></head><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
