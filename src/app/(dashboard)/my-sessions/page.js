"use client";

import { useEffect, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSessions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/sessions");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load sessions.");
      }

      setSessions(data.sessions || []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            <h1 className="text-2xl font-bold">My Sessions</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            View sessions where you are the primary or co-instructor.
          </p>
        </div>

        <Button variant="outline" onClick={loadSessions} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sessions</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No sessions assigned to you.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 font-medium">Start</th>
                    <th className="px-4 py-3 font-medium">End</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Capacity</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => {
                    const isPrimary =
                      session.primaryInstructorId ===
                      session.primaryInstructor?.id;

                    return (
                      <tr key={session.id} className="border-b last:border-0">
                        <td className="px-4 py-4 font-medium">
                          {session.class?.title || `Class #${session.classId}`}
                        </td>

                        <td className="px-4 py-4">
                          {session.room?.name || `Room #${session.roomId}`}
                        </td>

                        <td className="px-4 py-4">
                          {formatDate(session.startTime)}
                        </td>

                        <td className="px-4 py-4">
                          {formatDate(session.endTime)}
                        </td>

                        <td className="px-4 py-4">{session.duration} min</td>

                        <td className="px-4 py-4">{session.capacity}</td>

                        <td className="px-4 py-4">
                          <Badge variant={isPrimary ? "default" : "secondary"}>
                            {isPrimary ? "Primary" : "Co-Instructor"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
