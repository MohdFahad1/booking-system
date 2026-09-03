"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Edit,
  Plus,
  Archive,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const emptyForm = {
  title: "",
  description: "",
  discipline: "",
  duration: "",
  capacity: "",
};

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingClass, setEditingClass] = useState(null);

  async function fetchClasses() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/classes");

      if (response.data.success) {
        setClasses(response.data.classes || []);
      } else {
        setError(
          response.data.error || "Failed to load classes."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Something went wrong while loading classes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setFormError("");
    setEditingClass(null);
  }

  function openCreateDialog() {
    resetForm();
    setCreateOpen(true);
  }

  function openEditDialog(classItem) {
    setEditingClass(classItem);

    setForm({
      title: classItem.title || "",
      description: classItem.description || "",
      discipline: classItem.discipline || "",
      duration: String(classItem.duration || ""),
      capacity: String(classItem.capacity || ""),
    });

    setFormError("");
    setEditOpen(true);
  }

  async function createClass(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      const response = await axios.post("/api/classes", {
        title: form.title.trim(),
        description: form.description.trim() || null,
        discipline: form.discipline.trim(),
        duration: Number(form.duration),
        capacity: Number(form.capacity),
      });

      if (!response.data.success) {
        setFormError(
          response.data.error || "Failed to create class."
        );
        return;
      }

      setCreateOpen(false);
      resetForm();
      await fetchClasses();
    } catch (error) {
      setFormError(
        error.response?.data?.error ||
          "Something went wrong while creating the class."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateClass(event) {
    event.preventDefault();

    if (!editingClass) {
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const response = await axios.patch(
        `/api/classes/${editingClass.id}`,
        {
          title: form.title.trim(),
          description: form.description.trim() || null,
          discipline: form.discipline.trim(),
          duration: Number(form.duration),
          capacity: Number(form.capacity),
        }
      );

      if (!response.data.success) {
        setFormError(
          response.data.error || "Failed to update class."
        );
        return;
      }

      setEditOpen(false);
      resetForm();
      await fetchClasses();
    } catch (error) {
      setFormError(
        error.response?.data?.error ||
          "Something went wrong while updating the class."
      );
    } finally {
      setSaving(false);
    }
  }

  async function archiveClass(classId) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this class?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await axios.patch(
        `/api/classes/${classId}`,
        {
          archived: true,
        }
      );

      if (!response.data.success) {
        setError(
          response.data.error || "Failed to archive class."
        );
        return;
      }

      await fetchClasses();
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Something went wrong while archiving the class."
      );
    }
  }

  return (
    <main className="min-h-screen bg-muted/40 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />

              <h1 className="text-3xl font-bold tracking-tight">
                Classes
              </h1>
            </div>

            <p className="mt-1 text-muted-foreground">
              Create and manage studio classes.
            </p>
          </div>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);

              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
                Create Class
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Class</DialogTitle>

                <DialogDescription>
                  Add a new class to the studio.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={createClass}
                className="space-y-4"
              >
                <ClassForm
                  form={form}
                  onChange={handleInputChange}
                />

                {formError && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={saving}>
                    {saving ? "Creating..." : "Create Class"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-destructive/40">
            <CardContent className="flex items-center gap-2 pt-6 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Classes</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />

                <h3 className="font-semibold">
                  No active classes
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first class to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {classItem.title}
                            </p>

                            {classItem.description && (
                              <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                {classItem.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {classItem.discipline}
                        </TableCell>

                        <TableCell>
                          {classItem.duration} min
                        </TableCell>

                        <TableCell>
                          {classItem.capacity}
                        </TableCell>

                        <TableCell>
                          <Badge>Active</Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openEditDialog(classItem)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                archiveClass(classItem.id)
                              }
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>

            <DialogDescription>
              Update the class details.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={updateClass}
            className="space-y-4"
          >
            <ClassForm
              form={form}
              onChange={handleInputChange}
            />

            {formError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ClassForm({ form, onChange }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>

        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="e.g. Yoga Basics"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description
        </Label>

        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Describe the class..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discipline">
          Discipline
        </Label>

        <Input
          id="discipline"
          name="discipline"
          value={form.discipline}
          onChange={onChange}
          placeholder="e.g. Yoga"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">
            Duration (minutes)
          </Label>

          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            value={form.duration}
            onChange={onChange}
            placeholder="60"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">
            Capacity
          </Label>

          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={onChange}
            placeholder="15"
            required
          />
        </div>
      </div>
    </>
  );
}