"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LuSun, LuMoon, LuLogOut } from "react-icons/lu"
import { Button } from "@/components/ui/button"

interface BreadcrumbStep {
  label: string
  href?: string
  active?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbStep[]
}

export function DashboardLayout({
  children,
  breadcrumbs = [],
}: DashboardLayoutProps) {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Initialize theme status on mount
  useEffect(() => {
    const root = window.document.documentElement
    // Default to light mode as requested by user
    if (!root.classList.contains("dark") && !root.classList.contains("light")) {
      root.classList.add("light")
    }
    const initialTheme = root.classList.contains("dark") ? "dark" : "light"
    setTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const root = window.document.documentElement
    if (theme === "light") {
      root.classList.remove("light")
      root.classList.add("dark")
      setTheme("dark")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
      setTheme("light")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.refresh()
      router.push("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-border bg-background/45 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-foreground cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-border"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                    EdTech Platform
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {breadcrumbs.map((step, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      {step.active || !step.href ? (
                        <BreadcrumbPage className="text-foreground font-medium">{step.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={step.href} className="text-muted-foreground hover:text-foreground">
                          {step.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-foreground hover:bg-secondary/40"
            >
              {theme === "light" ? (
                <LuMoon className="size-4" />
              ) : (
                <LuSun className="size-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log Out"
              title="Выйти"
              className="rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <LuLogOut className="size-4" />
            </Button>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col bg-background text-foreground overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
