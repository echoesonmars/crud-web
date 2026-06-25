"use client"

import * as React from "react"
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
import { LuSun, LuMoon } from "react-icons/lu"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  // Initialize theme status on mount
  React.useEffect(() => {
    const root = window.document.documentElement
    const initialTheme = root.classList.contains("dark") ? "dark" : "light"
    setTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const root = window.document.documentElement
    if (theme === "light") {
      root.classList.add("dark")
      setTheme("dark")
    } else {
      root.classList.remove("dark")
      setTheme("light")
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto bg-border"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    EdTech Platform
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="rounded-full w-8 h-8 flex items-center justify-center"
          >
            {theme === "light" ? (
              <LuMoon className="size-5 text-foreground" />
            ) : (
              <LuSun className="size-5 text-foreground" />
            )}
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 bg-background">
          <div className="min-h-[100vh] flex-1 rounded-xl border border-dashed border-border/60 p-8 flex items-center justify-center text-muted-foreground text-sm font-medium">
            Select a section from the sidebar to begin
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
