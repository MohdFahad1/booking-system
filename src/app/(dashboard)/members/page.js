"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Plus, UserRound } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    membershipExpiryDate: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [membersResponse, alertsResponse] = await Promise.all([
        axios.get("/api/members"),
        axios.get("/api/membership-alerts"),
      ]);

      setMembers(membersResponse.data.members || []);
      setAlerts(alertsResponse.data.alerts || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load member data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      email: "",
      membershipExpiryDate: "",
    });
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

      if (!form.name.trim()) {
        setError("Member name is required.");
        return;
      }

      if (!form.email.trim()) {
        setError("Member email is required.");
        return;
      }

      if (!form.membershipExpiryDate) {
        setError("Membership expiry date is required.");
        return;
      }

      await axios.post("/api/members", {
        name: form.name.trim(),
        email: form.email.trim(),
        membershipExpiryDate: new Date(form.membershipExpiryDate).toISOString(),
      });

      setOpen(false);
      resetForm();

      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function dismissAlert(alertId) {
    try {
      setError("");

      await axios.patch(`/api/membership-alerts/${alertId}`);

      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to dismiss alert.");
    }
  }

  function getMembershipStatus(expiryDate) {
    const expiry = new Date(expiryDate);
    const now = new Date();

    if (expiry < now) {
      return {
        label: "Expired",
        variant: "destructive",
      };
    }

    const difference = expiry.getTime() - now.getTime();

    const daysRemaining = difference / (1000 * 60 * 60 * 24);

    if (daysRemaining <= 30) {
      return {
        label: "Expiring Soon",
        variant: "secondary",
      };
    }

    return {
      label: "Active",
      variant: "default",
    };
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserRound className="h-6 w-6" />

            <h1 className="text-2xl font-bold">Members</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage studio members and membership expiry.
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
          <DialogTrigger
            render={<Button />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>

                <Input
                  id="name"
                  placeholder="Enter member name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Membership Expiry Date</Label>

                <Input
                  id="expiry"
                  type="date"
                  value={form.membershipExpiryDate}
                  onChange={(event) =>
                    updateField("membershipExpiryDate", event.target.value)
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Membership Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />

            <h2 className="text-lg font-semibold">Membership Alerts</h2>

            <Badge variant="secondary">{alerts.length}</Badge>
          </div>

          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {alert.member?.name || `Member #${alert.memberId}`}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Membership expires on {formatDate(alert.expiryDate)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading members...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const status = getMembershipStatus(member.membershipExpiryDate);

                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>

                    <TableCell>{member.email}</TableCell>

                    <TableCell>
                      {formatDate(member.membershipExpiryDate)}
                    </TableCell>

                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
