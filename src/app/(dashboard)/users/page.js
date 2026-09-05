"use client";

import { useEffect, useState } from "react";
import { RefreshCw, UserCog, UserPlus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [roleUpdating, setRoleUpdating] = useState(null);

  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [instructorName, setInstructorName] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [creatingInstructor, setCreatingInstructor] = useState(false);
  const [instructorError, setInstructorError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, instructorsResponse] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/instructors"),
      ]);

      const usersData = await usersResponse.json();
      const instructorsData = await instructorsResponse.json();

      if (!usersResponse.ok || !usersData.success) {
        throw new Error(usersData.error || "Failed to load users.");
      }

      if (!instructorsResponse.ok || !instructorsData.success) {
        throw new Error(instructorsData.error || "Failed to load instructors.");
      }

      setUsers(usersData.users || []);
      setInstructors(instructorsData.instructors || []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getInstructorForUser(userId) {
    return instructors.find((instructor) => instructor.userId === userId);
  }

  async function handleRoleChange(userId, role) {
    try {
      setRoleUpdating(userId);
      setError("");

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update user role.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: data.user.role } : user,
        ),
      );
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to update user role.");
    } finally {
      setRoleUpdating(null);
    }
  }

  function openInstructorDialog(user) {
    setSelectedUser(user);
    setInstructorName(user.name || "");
    setInstructorEmail(user.email || "");
    setInstructorError("");
    setInstructorDialogOpen(true);
  }

  async function handleCreateInstructor() {
    if (!selectedUser) {
      return;
    }

    try {
      setCreatingInstructor(true);
      setInstructorError("");

      const response = await fetch("/api/instructors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: instructorName.trim(),
          email: instructorEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create instructor profile.");
      }

      setInstructors((currentInstructors) => [
        ...currentInstructors,
        data.instructor,
      ]);

      setInstructorDialogOpen(false);
      setSelectedUser(null);
      setInstructorName("");
      setInstructorEmail("");
    } catch (error) {
      console.error(error);
      setInstructorError(
        error.message || "Failed to create instructor profile.",
      );
    } finally {
      setCreatingInstructor(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and instructor profiles.
          </p>
        </div>

        <Button variant="outline" onClick={loadData} disabled={loading}>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((user) => user.role === "STAFF").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((user) => user.role === "INSTRUCTOR").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">
                      Instructor Profile
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const instructor = getInstructorForUser(user.id);

                    return (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="px-4 py-4 font-medium">
                          {user.name || "Unnamed User"}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {user.email}
                        </td>

                        <td className="px-4 py-4">
                          <Select
                            value={user.role}
                            onValueChange={(role) =>
                              handleRoleChange(user.id, role)
                            }
                            disabled={roleUpdating === user.id}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="STAFF">STAFF</SelectItem>
                              <SelectItem value="INSTRUCTOR">
                                INSTRUCTOR
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-4 py-4">
                          {user.role === "INSTRUCTOR" ? (
                            instructor ? (
                              <Badge variant="secondary">Profile Created</Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openInstructorDialog(user)}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Create Profile
                              </Button>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
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

      <Dialog
        open={instructorDialogOpen}
        onOpenChange={setInstructorDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Instructor Profile</DialogTitle>
            <DialogDescription>
              Create an instructor profile for{" "}
              {selectedUser?.email || "this user"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={instructorName}
                onChange={(event) => setInstructorName(event.target.value)}
                placeholder="Instructor name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={instructorEmail}
                onChange={(event) => setInstructorEmail(event.target.value)}
                placeholder="Instructor email"
              />
            </div>

            {instructorError && (
              <p className="text-sm text-destructive">{instructorError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInstructorDialogOpen(false)}
              disabled={creatingInstructor}
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateInstructor}
              disabled={
                creatingInstructor ||
                !instructorName.trim() ||
                !instructorEmail.trim()
              }
            >
              {creatingInstructor ? "Creating..." : "Create Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
