"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-[#065f46]">頁面暫時顯示不到</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">請再試一次。如果問題持續，可以在選單還原示範資料。</p>
        <Button type="button" className="mt-6 h-10 px-4" onClick={() => reset()}>
          再試一次
        </Button>
      </div>
    </main>
  )
}
