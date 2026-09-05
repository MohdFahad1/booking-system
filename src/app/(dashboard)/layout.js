import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  DoorOpen,
  UserCog,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  const user = userId ? await getCurrentUser() : null;

  const isStaff = user?.role === "STAFF";
  const isInstructor = user?.role === "INSTRUCTOR";

  const staffNavigation = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Classes",
      href: "/classes",
      icon: BookOpen,
    },
    {
      title: "Sessions",
      href: "/sessions",
      icon: CalendarDays,
    },
    {
      title: "Rooms",
      href: "/rooms",
      icon: DoorOpen,
    },
    {
      title: "Members",
      href: "/members",
      icon: Users,
    },
    {
      title: "Bookings",
      href: "/bookings",
      icon: ClipboardList,
    },
    {
      title: "Alerts",
      href: "/alerts",
      icon: Bell,
    },
    {
      title: "Users",
      href: "/users",
      icon: UserCog,
    },
  ];

  const instructorNavigation = [
    {
      title: "My Sessions",
      href: "/my-sessions",
      icon: CalendarDays,
    },
    {
      title: "My Bookings",
      href: "/my-bookings",
      icon: ClipboardList,
    },
  ];

  const navigation = [
    ...(isStaff ? staffNavigation : []),
    ...(isInstructor ? instructorNavigation : []),
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Booking System</h2>
            <p className="text-xs text-muted-foreground">Studio Management</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {isStaff ? "Staff" : "Instructor"}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href + item.title}>
                      <SidebarMenuButton render={<Link href={item.href} />}>
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-3">
            <UserButton />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
