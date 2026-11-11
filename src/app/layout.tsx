import type { Metadata } from "next"
import { Noto_Sans_HK } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { StoreProvider } from "@/lib/store"
import "./globals.css"

const noto = Noto_Sans_HK({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "同事福利",
    template: "%s · 同事福利",
  },
  description: "內部員工福利平台。集中查閱經人力資源部審核的優惠，並可參與團購報名。",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-HK" className={`${noto.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <StoreProvider>
          {children}
          <Toaster position="top-center" offset={{ top: "4.75rem" }} mobileOffset={{ top: "4.75rem" }} />
        </StoreProvider>
      </body>
    </html>
  )
}
