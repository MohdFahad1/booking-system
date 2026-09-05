"use client";

import { useEffect, useState } from "react";
import { ClipboardList, RefreshCw, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  async function markAttendance(bookingId, status) {
    try {
      setUpdatingBookingId(bookingId);
      setError("");

      const response = await axios.patch(
        `/api/bookings/${bookingId}/attendance`,
        {
          status,
        },
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to mark attendance.");
      }

      await loadBookings();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to mark attendance.",
      );
    } finally {
      setUpdatingBookingId(null);
    }
  }

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/bookings/search?page=1&pageSize=100",
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to load bookings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  function getStatusVariant(status) {
    if (status === "BOOKED") {
      return "default";
    }

    if (status === "CANCELLED") {
      return "destructive";
    }

    return "secondary";
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />

            <h1 className="text-2xl font-bold">My Bookings</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            View bookings for your assigned sessions.
          </p>
        </div>

        <Button variant="outline" onClick={loadBookings} disabled={loading}>
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
          <CardTitle>Session Bookings</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No bookings found for your sessions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Member</th>

                    <th className="px-4 py-3 font-medium">Email</th>

                    <th className="px-4 py-3 font-medium">Class</th>

                    <th className="px-4 py-3 font-medium">Session</th>

                    <th className="px-4 py-3 font-medium">Start</th>

                    <th className="px-4 py-3 font-medium">End</th>

                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="px-4 py-4 font-medium">
                        {booking.member?.name || "-"}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {booking.member?.email || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {booking.session?.class?.title ||
                          `Class #${booking.session?.classId || "-"}`}
                      </td>

                      <td className="px-4 py-4">#{booking.sessionId}</td>

                      <td className="px-4 py-4">
                        {formatDate(booking.session?.startTime)}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(booking.session?.endTime)}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        {booking.status === "BOOKED" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                markAttendance(booking.id, "ATTENDED")
                              }
                              disabled={updatingBookingId === booking.id}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Attended
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                markAttendance(booking.id, "NO_SHOW")
                              }
                              disabled={updatingBookingId === booking.id}
                            >
                              <X className="mr-1 h-4 w-4" />
                              No Show
                            </Button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
