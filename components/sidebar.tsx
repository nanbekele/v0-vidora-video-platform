"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, BarChart3, Settings, HelpCircle, Menu, Compass, Clock, ThumbsUp, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  user?: { id: string; email?: string }
}

export function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { id: "home", icon: Home, label: "Home", href: "/", group: "main" },
    { id: "explore", icon: Compass, label: "Explore", href: "/", group: "main" },
    {
      id: "subscriptions",
      icon: Users,
      label: "Subscriptions",
      href: "/subscriptions",
      group: "main",
      requiresAuth: true,
    },
  ]

  const userMenuItems = [
    { id: "channel", icon: Users, label: "Your Channel", href: "/channel", group: "user" },
    { id: "history", icon: Clock, label: "Watch History", href: "/", group: "user" },
    { id: "liked", icon: ThumbsUp, label: "Liked Videos", href: "/", group: "user" },
  ]

  const settingsItems = [
    { id: "settings", icon: Settings, label: "Settings", href: "/profile", group: "settings" },
    { id: "analytics", icon: BarChart3, label: "Analytics", href: "/analytics", group: "settings", requiresAuth: true },
    { id: "help", icon: HelpCircle, label: "Help", href: "/", group: "settings" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">V</span>
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">Vidora</span>
        </Link>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map(
          (item) =>
            (!item.requiresAuth || user) && (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ),
        )}

        {user && (
          <>
            <div className="py-2 px-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Your Library
            </div>
            {userMenuItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Settings & Help */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        {settingsItems.map(
          (item) =>
            (!item.requiresAuth || user) && (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ),
        )}

        {user && (
          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </form>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="fixed left-4 top-20 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar h-screen fixed left-0 top-0 pt-16">
        <SidebarContent />
      </aside>
    </>
  )
}
