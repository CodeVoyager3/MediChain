import * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default function DashboardLayout({ 
  children, 
  title, 
  user, 
  navMain, 
  navSecondary 
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} navMain={navMain} navSecondary={navSecondary} />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
