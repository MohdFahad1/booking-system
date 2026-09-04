"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(true);
  const [dismissingId, setDismissingId] = useState(null);
  const [error, setError] = useState("");

  const fetchAlerts = async (selectedDays = days) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/membership-alerts?days=${selectedDays}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load membership alerts.");
      }

      setAlerts(data.alerts || []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to load membership alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(days);
  }, [days]);

  const handleDismiss = async (alertId) => {
    try {
      setDismissingId(alertId);
      setError("");

      const response = await fetch(`/api/membership-alerts/${alertId}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to dismiss alert.");
      }

      setAlerts((currentAlerts) =>
        currentAlerts.filter((alert) => alert.id !== alertId),
      );
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to dismiss alert.");
    } finally {
      setDismissingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAlertBadge = (type) => {
    if (type === "EXPIRED") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Expiring Soon
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Membership Alerts
          </h1>
          <p className="text-muted-foreground">
            View memberships that are expired or expiring soon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="0">Expired only</SelectItem>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="30">Next 30 days</SelectItem>
              <SelectItem value="60">Next 60 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchAlerts(days)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
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
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts
          </CardTitle>
          <CardDescription>
            {alerts.length} active membership alert
            {alerts.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground" />

              <h3 className="font-semibold">No active alerts</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                There are no membership alerts for the selected period.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {alert.member?.name || "Unknown Member"}
                      </h3>

                      {getAlertBadge(alert.type)}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {alert.member?.email || "No email available"}
                    </p>

                    <p className="text-sm">
                      Membership expiry:{" "}
                      <span className="font-medium">
                        {formatDate(alert.expiryDate)}
                      </span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleDismiss(alert.id)}
                    disabled={dismissingId === alert.id}
                  >
                    {dismissingId === alert.id ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Dismissing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Dismiss
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
