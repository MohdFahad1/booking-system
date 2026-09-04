"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, Pencil, Plus, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [coInstructorOpen, setCoInstructorOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedCoInstructor, setSelectedCoInstructor] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    classId: "",
    primaryInstructorId: "",
    roomId: "",
    startTime: "",
    endTime: "",
    duration: "",
    capacity: "",
    recurring: false,
    frequency: "WEEKLY",
    occurrences: "4",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [sessionsResponse, classesResponse] = await Promise.all([
        axios.get("/api/sessions"),
        axios.get("/api/classes"),
      ]);

      setSessions(sessionsResponse.data.sessions || []);
      setClasses(classesResponse.data.classes || []);

      try {
        const response = await axios.get("/api/instructors");
        setInstructors(response.data.instructors || []);
      } catch {
        setInstructors([]);
      }

      try {
        const response = await axios.get("/api/rooms");
        setRooms(response.data.rooms || []);
      } catch {
        setRooms([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm({
      classId: "",
      primaryInstructorId: "",
      roomId: "",
      startTime: "",
      endTime: "",
      duration: "",
      capacity: "",
      recurring: false,
      frequency: "WEEKLY",
      occurrences: "4",
    });

    setEditingSession(null);
  }

  function openCreateDialog() {
    resetForm();
    setOpen(true);
  }

  function openEditDialog(session) {
    setEditingSession(session);

    setForm({
      classId: String(session.classId),
      primaryInstructorId: String(session.primaryInstructorId),
      roomId: String(session.roomId),
      startTime: formatDateTimeLocal(session.startTime),
      endTime: formatDateTimeLocal(session.endTime),
      duration: String(session.duration),
      capacity: String(session.capacity),
      recurring: false,
      frequency: "WEEKLY",
      occurrences: "4",
    });

    setOpen(true);
  }

  function formatDateTimeLocal(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      if (!form.classId) {
        setError("Please select a class.");
        return;
      }

      if (!form.primaryInstructorId) {
        setError("Please select a primary instructor.");
        return;
      }

      if (!form.roomId) {
        setError("Please select a room.");
        return;
      }

      if (!form.startTime || !form.endTime) {
        setError("Start time and end time are required.");
        return;
      }

      const start = new Date(form.startTime);
      const end = new Date(form.endTime);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setError("Invalid start time or end time.");
        return;
      }

      if (end <= start) {
        setError("End time must be after start time.");
        return;
      }

      if (
        !form.duration ||
        !Number.isInteger(Number(form.duration)) ||
        Number(form.duration) <= 0
      ) {
        setError("Duration must be a positive integer.");
        return;
      }

      if (
        !form.capacity ||
        !Number.isInteger(Number(form.capacity)) ||
        Number(form.capacity) <= 0
      ) {
        setError("Capacity must be a positive integer.");
        return;
      }

      if (editingSession) {
        const payload = {
          classId: Number(form.classId),
          primaryInstructorId: Number(form.primaryInstructorId),
          roomId: Number(form.roomId),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          duration: Number(form.duration),
          capacity: Number(form.capacity),
        };

        await axios.patch(`/api/sessions/${editingSession.id}`, payload);
      } else if (form.recurring) {
        const occurrences = Number(form.occurrences);

        if (
          !Number.isInteger(occurrences) ||
          occurrences < 1 ||
          occurrences > 100
        ) {
          setError("Occurrences must be between 1 and 100.");
          return;
        }

        await axios.post("/api/sessions/recurring", {
          classId: Number(form.classId),
          primaryInstructorId: Number(form.primaryInstructorId),
          roomId: Number(form.roomId),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          duration: Number(form.duration),
          capacity: Number(form.capacity),
          frequency: form.frequency,
          occurrences,
        });
      } else {
        const payload = {
          classId: Number(form.classId),
          primaryInstructorId: Number(form.primaryInstructorId),
          roomId: Number(form.roomId),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          duration: Number(form.duration),
          capacity: Number(form.capacity),
        };

        await axios.post("/api/sessions", payload);
      }

      setOpen(false);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save session.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(sessionId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this session?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axios.delete(`/api/sessions/${sessionId}`);

      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete session.");
    }
  }

  function openCoInstructorDialog(session) {
    setSelectedSession(session);
    setSelectedCoInstructor("");
    setCoInstructorOpen(true);
  }

  async function handleAddCoInstructor() {
    if (!selectedSession || !selectedCoInstructor) {
      return;
    }

    try {
      setError("");

      await axios.post(`/api/sessions/${selectedSession.id}/instructors`, {
        instructorId: Number(selectedCoInstructor),
      });

      setSelectedCoInstructor("");
      await loadData();

      const response = await axios.get("/api/sessions");

      const updatedSession = (response.data.sessions || []).find(
        (item) => item.id === selectedSession.id,
      );

      setSelectedSession(updatedSession || selectedSession);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add co-instructor.");
    }
  }

  async function handleRemoveCoInstructor(instructorId) {
    if (!selectedSession) {
      return;
    }

    try {
      setError("");

      await axios.delete(`/api/sessions/${selectedSession.id}/instructors`, {
        data: {
          instructorId,
        },
      });

      await loadData();

      const response = await axios.get("/api/sessions");

      const updatedSession = (response.data.sessions || []).find(
        (item) => item.id === selectedSession.id,
      );

      setSelectedSession(updatedSession || selectedSession);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove co-instructor.");
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />

            <h1 className="text-2xl font-bold">Sessions</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage scheduled studio class sessions.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);

            if (!value) {
              resetForm();
            }
          }}
        >
          <DialogTrigger render={<Button />} onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Session" : "Create Session"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Class</Label>

                <Select
                  value={form.classId}
                  onValueChange={(value) => updateField("classId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] max-h-60"
                    alignItemWithTrigger={false}
                  >
                    {classes.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Instructor</Label>

                <Select
                  value={form.primaryInstructorId}
                  onValueChange={(value) =>
                    updateField("primaryInstructorId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] max-h-60"
                    alignItemWithTrigger={false}
                  >
                    {instructors.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room</Label>

                <Select
                  value={form.roomId}
                  onValueChange={(value) => updateField("roomId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] max-h-60"
                    alignItemWithTrigger={false}
                  >
                    {rooms.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>

                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(event) =>
                      updateField("startTime", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>

                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(event) =>
                      updateField("endTime", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>

                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={(event) =>
                      updateField("duration", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>

                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(event) =>
                      updateField("capacity", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {!editingSession && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <input
                      id="recurring"
                      type="checkbox"
                      checked={form.recurring}
                      onChange={(event) =>
                        updateField("recurring", event.target.checked)
                      }
                      className="h-4 w-4"
                    />

                    <Label htmlFor="recurring">Recurring Session</Label>
                  </div>

                  {form.recurring && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Frequency</Label>

                        <Select
                          value={form.frequency}
                          onValueChange={(value) =>
                            updateField("frequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>

                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occurrences">Occurrences</Label>

                        <Input
                          id="occurrences"
                          type="number"
                          min="1"
                          max="100"
                          value={form.occurrences}
                          onChange={(event) =>
                            updateField("occurrences", event.target.value)
                          }
                          required
                        />

                        <p className="text-xs text-muted-foreground">
                          Enter a number from 1 to 100.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingSession
                    ? "Update Session"
                    : form.recurring
                      ? "Create Recurring Sessions"
                      : "Create Session"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => {
                const isPast = new Date(session.endTime) < new Date();

                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.class?.title || `Class #${session.classId}`}
                    </TableCell>

                    <TableCell>
                      {session.primaryInstructor?.name ||
                        `Instructor #${session.primaryInstructorId}`}
                    </TableCell>

                    <TableCell>
                      {session.room?.name || `Room #${session.roomId}`}
                    </TableCell>

                    <TableCell>{formatDate(session.startTime)}</TableCell>

                    <TableCell>{formatDate(session.endTime)}</TableCell>

                    <TableCell>{session.capacity}</TableCell>

                    <TableCell>
                      <Badge variant={isPast ? "secondary" : "default"}>
                        {isPast ? "Past" : "Upcoming"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openCoInstructorDialog(session)}
                          title="Manage Instructors"
                        >
                          <Users className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(session)}
                          title="Edit Session"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(session.id)}
                          title="Delete Session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={coInstructorOpen} onOpenChange={setCoInstructorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Co-Instructors</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Session #{selectedSession?.id}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Add Co-Instructor</Label>

              <div className="flex gap-2">
                <Select
                  value={selectedCoInstructor}
                  onValueChange={setSelectedCoInstructor}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] max-h-60"
                    alignItemWithTrigger={false}
                  >
                    {instructors.map((instructor) => (
                      <SelectItem
                        key={instructor.id}
                        value={String(instructor.id)}
                      >
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  onClick={handleAddCoInstructor}
                  disabled={!selectedCoInstructor}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Current Co-Instructors</Label>

              {selectedSession?.coInstructors?.length ? (
                <div className="space-y-2">
                  {selectedSession.coInstructors.map((item) => (
                    <div
                      key={item.instructorId}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <span className="text-sm">
                        {item.instructor?.name ||
                          `Instructor #${item.instructorId}`}
                      </span>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleRemoveCoInstructor(item.instructorId)
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No co-instructors assigned.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
