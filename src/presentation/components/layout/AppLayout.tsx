"use client"

import { Sidebar } from "./Sidebar"
import { MobileMenu } from "./MobileMenu"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MobileMenu />
      <Sidebar />
      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
