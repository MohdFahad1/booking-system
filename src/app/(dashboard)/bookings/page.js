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
import { Search, Download } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 10;

  const [form, setForm] = useState({
    memberId: "",
    sessionId: "",
  });

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (classFilter && classFilter !== "all") {
        params.classId = classFilter;
      }

      if (sessionFilter && sessionFilter !== "all") {
        params.sessionId = sessionFilter;
      }

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      const [
        bookingsResponse,
        membersResponse,
        sessionsResponse,
        classesResponse,
      ] = await Promise.all([
        axios.get("/api/bookings/search", { params }),
        axios.get("/api/members"),
        axios.get("/api/sessions"),
        axios.get("/api/classes"),
      ]);

      setBookings(bookingsResponse.data.bookings || []);
      setMembers(membersResponse.data.members || []);
      setSessions(sessionsResponse.data.sessions || []);
      setClasses(classesResponse.data.classes || []);

      setTotal(bookingsResponse.data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search, classFilter, sessionFilter, statusFilter]);

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

      <div className="mb-6 rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Booking Finder</h2>
            <p className="text-sm text-muted-foreground">
              Search and filter bookings.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();

              if (search.trim()) {
                params.set("search", search.trim());
              }

              if (classFilter && classFilter !== "all") {
                params.set("classId", classFilter);
              }

              if (sessionFilter && sessionFilter !== "all") {
                params.set("sessionId", sessionFilter);
              }

              if (statusFilter && statusFilter !== "all") {
                params.set("status", statusFilter);
              }

              window.open(
                `/api/bookings/export?${params.toString()}`,
                "_blank",
              );
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search member..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Session</Label>
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All sessions" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All sessions</SelectItem>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={String(session.id)}>
                    Session #{session.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="ATTENDED">Attended</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setClassFilter("");
              setSessionFilter("");
              setStatusFilter("");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>

          <Button
            onClick={() => {
              setPage(1);
              fetchData();
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
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

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={page * pageSize >= total}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
