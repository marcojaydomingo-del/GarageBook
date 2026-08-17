import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "GarageBook — Your vehicle history, organized", template: "%s · GarageBook" },
  description: "Track maintenance, symptoms, repairs, documents, and shops in one clear vehicle history.",
  icons: { icon: "/garagebook-favicon.svg", shortcut: "/garagebook-favicon.svg" },
  openGraph: { type:"website",siteName:"GarageBook",url:"/",title:"Everything about your car. One garage.",description:"Maintenance, repairs, symptoms, receipts, and vehicle history—together." },
  twitter: { card: "summary_large_image",title:"Everything about your car. One garage.",description:"Maintenance, repairs, symptoms, receipts, and vehicle history—together." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`(()=>{try{const p=localStorage.getItem('garagebook-theme');const d=p==='dark'||(!p&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch{}})()`}}/></head><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
