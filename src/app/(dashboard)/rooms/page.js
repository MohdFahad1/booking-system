"use client";

import { useEffect, useState } from "react";
import { DoorOpen, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/rooms", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load rooms.");
      }

      setRooms(data.rooms || []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (event) => {
    event.preventDefault();

    const name = roomName.trim();

    if (!name) {
      setError("Room name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create room.");
      }

      setRoomName("");
      setDialogOpen(false);

      await fetchRooms();
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to create room.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">
            Manage studio rooms available for class sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchRooms}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Room</DialogTitle>
                <DialogDescription>
                  Create a room that can be assigned to sessions.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>

                  <Input
                    id="room-name"
                    placeholder="e.g. Studio A"
                    value={roomName}
                    onChange={(event) => {
                      setRoomName(event.target.value);
                      if (error) {
                        setError("");
                      }
                    }}
                    disabled={creating}
                    autoFocus
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setRoomName("");
                      setError("");
                    }}
                    disabled={creating}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Room"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && !dialogOpen && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Studio Rooms</CardTitle>
          <CardDescription>
            {rooms.length} room{rooms.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DoorOpen className="mb-3 h-10 w-10 text-muted-foreground" />

              <h3 className="font-semibold">No rooms yet</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first room to use it when scheduling sessions.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <DoorOpen className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Room #{room.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
