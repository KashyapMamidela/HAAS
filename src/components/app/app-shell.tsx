"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLinks({
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent-soft text-accent"
                : "text-text-muted hover:bg-surface-muted hover:text-text",
              collapsed && "justify-center px-2",
            )}
          >
            <item.icon className="size-[18px] shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  portalLabel,
  navItems,
  mobileNav = "drawer",
  user,
  onSignOut,
  children,
}: {
  portalLabel: string;
  navItems: NavItem[];
  mobileNav?: "bottom-tabs" | "drawer";
  user: { name: string; email?: string };
  onSignOut?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bottomTabItems = mobileNav === "bottom-tabs" ? navItems.slice(0, 5) : [];

  return (
    <div className="flex min-h-svh flex-col bg-bg sm:flex-row">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out sm:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        <div className="flex h-14 items-center gap-2 px-4">
          {!collapsed && (
            <span className="font-heading text-sm font-medium text-text">
              HAAS <span className="text-text-muted">· {portalLabel}</span>
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <NavLinks items={navItems} pathname={pathname} collapsed={collapsed} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="size-4" strokeWidth={1.5} />
            ) : (
              <ChevronsLeft className="size-4" strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4">
          <div className="flex items-center gap-2 sm:hidden">
            {mobileNav === "drawer" && (
              <Sheet>
                <SheetTrigger
                  render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}
                >
                  <Menu className="size-5" strokeWidth={1.5} />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <span className="font-heading text-sm font-medium text-text">
                    HAAS <span className="text-text-muted">· {portalLabel}</span>
                  </span>
                  <div className="mt-4">
                    <NavLinks items={navItems} pathname={pathname} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <span className="font-heading text-sm font-medium text-text">{portalLabel}</span>
          </div>
          <span className="hidden text-sm text-text-muted sm:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2" />}
              >
                <Avatar className="size-6">
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="size-4" strokeWidth={1.5} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 sm:pb-6">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {mobileNav === "bottom-tabs" && (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface sm:hidden">
          {bottomTabItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-accent" : "text-text-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="size-5" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
