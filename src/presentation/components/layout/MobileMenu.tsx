"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, Tags, FileText, LogOut, HardHat, Menu, X } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Despesas", href: "/expenses", icon: Receipt },
  { name: "Categorias", href: "/categories", icon: Tags },
  { name: "Relatórios", href: "/reports", icon: FileText },
]

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Erro ao sair", error)
    }
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-700"
          onClick={() => setIsOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">
          Dashboard
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/80 transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button 
                  type="button" 
                  className="-m-2.5 p-2.5" 
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              {/* Sidebar component for mobile */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                    <HardHat size={20} />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    ObraTrack
                  </span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname.startsWith(item.href)
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors ${
                                  isActive
                                    ? "bg-slate-50 text-orange-600"
                                    : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
                                }`}
                              >
                                <item.icon
                                  className={`h-5 w-5 shrink-0 ${
                                    isActive ? "text-orange-600" : "text-slate-400 group-hover:text-orange-600"
                                  }`}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <button
                        onClick={handleLogout}
                        className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                      >
                        <LogOut
                          className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-600"
                          aria-hidden="true"
                        />
                        Sair
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
