"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await axios.get("/api/dashboard");

        if (response.data.success) {
          setDashboard(response.data.dashboard);
        } else {
          setError(response.data.error || "Failed to load dashboard.");
        }
      } catch (error) {
        setError(
          error.response?.data?.error ||
            "Something went wrong while loading the dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/40 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-muted/40 p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 pt-6 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const stats = [
    {
      title: "Total Members",
      value: dashboard.totalMembers,
      icon: Users,
      description: "Registered members",
    },
    {
      title: "Active Classes",
      value: dashboard.activeClasses,
      icon: BookOpen,
      description: "Available classes",
    },
    {
      title: "Upcoming Sessions",
      value: dashboard.upcomingSessions,
      icon: CalendarDays,
      description: "Scheduled sessions",
    },
    {
      title: "Today's Bookings",
      value: dashboard.todayBookings,
      icon: ClipboardCheck,
      description: "Bookings today",
    },
  ];

  const attendanceTotal =
    dashboard.attendance.attended + dashboard.attendance.noShow;

  const attendanceRate =
    attendanceTotal > 0
      ? Math.round(
          (dashboard.attendance.attended / attendanceTotal) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Overview of your booking system.
            </p>
          </div>

          <Badge variant="secondary" className="w-fit px-3 py-1">
            {dashboard.role === "STAFF" ? "Staff" : "Instructor"}
          </Badge>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>

                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold">
                    {stat.value}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Secondary Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Waitlisted Bookings
              </CardTitle>

              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {dashboard.waitlistedBookings}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Members waiting for a spot
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Attended
              </CardTitle>

              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {dashboard.attendance.attended}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Completed attendances
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                No Shows
              </CardTitle>

              <UserX className="h-5 w-5 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {dashboard.attendance.noShow}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Members who did not attend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Recorded
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {attendanceTotal}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Attendance Rate
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {attendanceRate}%
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Status
                </p>
                <div className="mt-2">
                  <Badge
                    variant={
                      dashboard.attendance.noShow > 0
                        ? "secondary"
                        : "default"
                    }
                  >
                    {dashboard.attendance.noShow > 0
                      ? "Needs Attention"
                      : "All Good"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}