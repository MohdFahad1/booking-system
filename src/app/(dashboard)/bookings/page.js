"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    sessionId: "",
  });

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [bookingsResponse, membersResponse, sessionsResponse] =
        await Promise.all([
          axios.get("/api/bookings/search"),
          axios.get("/api/members"),
          axios.get("/api/sessions"),
        ]);

      setBookings(bookingsResponse.data.bookings || []);
      setMembers(membersResponse.data.members || []);
      setSessions(sessionsResponse.data.sessions || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateBooking(event) {
    event.preventDefault();

    if (!form.memberId || !form.sessionId) {
      setError("Please select a member and session.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await axios.post("/api/bookings", {
        memberId: Number(form.memberId),
        sessionId: Number(form.sessionId),
      });

      setForm({
        memberId: "",
        sessionId: "",
      });

      setOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    try {
      setError("");

      await axios.patch(`/api/bookings/${bookingId}`, {
        status: "CANCELLED",
      });

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel booking.");
    }
  }

  async function handleAttendance(bookingId, status) {
    try {
      setError("");

      await axios.patch(`/api/bookings/${bookingId}/attendance`, {
        status,
      });

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update attendance.");
    }
  }

  function getStatusVariant(status) {
    if (status === "BOOKED" || status === "ATTENDED") {
      return "default";
    }

    if (status === "WAITLISTED") {
      return "secondary";
    }

    return "outline";
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage class bookings and attendance.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Booking</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Booking</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateBooking} className="space-y-5">
              <div className="space-y-2">
                <Label>Member</Label>

                <Select
                  value={form.memberId}
                  onValueChange={(value) => updateForm("memberId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] max-h-60"
                    alignItemWithTrigger={false}
                  >
                    {members.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name} — {member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Session</Label>

                <Select
                  value={form.sessionId}
                  onValueChange={(value) => updateForm("sessionId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] max-h-60"
                    alignItemWithTrigger={false}
                  >
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={String(session.id)}>
                        {session.class?.title || `Session #${session.id}`}
                        {" — "}
                        {new Date(session.startTime).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Booking"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          No bookings found.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {booking.member?.name || "Unknown"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.member?.email || ""}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {booking.session?.class?.title || "Unknown"}
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium">
                        Session #{booking.sessionId}
                      </p>

                      {booking.session?.startTime && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.session.startTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {(booking.status === "BOOKED" ||
                        booking.status === "WAITLISTED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}

                      {booking.status === "BOOKED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAttendance(booking.id, "ATTENDED")
                            }
                          >
                            Attended
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAttendance(booking.id, "NO_SHOW")
                            }
                          >
                            No Show
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
