"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LuGalleryVerticalEnd,
  LuAudioLines,
  LuTerminal,
  LuMap,
  LuMonitor,
  LuVideo,
  LuTv,
} from "react-icons/lu"

// This is sample data.
const data = {
  user: {
    name: "Администратор",
    email: "admin@edtech.kz",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "EdTech Safety",
      logo: <LuGalleryVerticalEnd />,
      plan: "Control Center",
    },
    {
      name: "Acme Corp.",
      logo: <LuAudioLines />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <LuTerminal />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Карта",
      url: "/",
      icon: <LuMap />,
      isActive: true,
      items: [
        {
          title: "Аналитика",
          url: "/monitoring/analytics",
        },
        {
          title: "Служебный каталог",
          url: "#",
        },
      ],
    },
    {
      title: "Мониторинг",
      url: "#",
      icon: <LuMonitor />,
      items: [
        {
          title: "Аналитика",
          url: "/monitoring/analytics",
        },
        {
          title: "Отчет",
          url: "/monitoring/reports",
        },
        {
          title: "Тревоги",
          url: "/monitoring/alarms",
        },
      ],
    },
    {
      title: "Камеры",
      url: "/cameras",
      icon: <LuVideo />,
    },
    {
      title: "Экраны",
      url: "/screens",
      icon: <LuTv />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
