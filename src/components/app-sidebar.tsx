"use client";

import * as React from "react";
import {
  IconCamera,
  IconCreditCard,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconPigMoney,
  IconSearch,
  IconSettings,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser, NavUserSkeleton } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/lib/config";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Accounts",
      url: "/dashboard/financial",
      icon: IconWallet,
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: IconCreditCard,
    },
    {
      title: "Investments",
      url: "/investments",
      icon: IconTrendingUp,
    },
    // {
    //   title: "Analytics",
    //   url: "/analytics",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Projects",
    //   url: "/projects",
    //   icon: IconFolder,
    // },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  accounts: [
    {
      name: "Chase Checking",
      url: "#",
      icon: IconWallet,
    },
    {
      name: "Savings Account",
      url: "#",
      icon: IconPigMoney,
    },
    {
      name: "Investment Portfolio",
      url: "#",
      icon: IconTrendingUp,
    },
    {
      name: "Credit Card",
      url: "#",
      icon: IconCreditCard,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.accounts} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <React.Suspense fallback={<NavUserSkeleton />}>
          <NavUser />
        </React.Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
