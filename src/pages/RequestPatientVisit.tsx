import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarClock, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Merge a calendar date into an existing datetime-local string (preserves time). */
function mergeDateIntoDatetimeLocal(
  currentDatetimeLocal: string,
  picked: Date,
): string {
  const base = currentDatetimeLocal
    ? new Date(currentDatetimeLocal)
    : new Date();
  picked.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return toDatetimeLocalValue(picked);
}

type RequestRow = {
  id: number;
  status: string;
  equipment_name: string;
  from_facility_name: string;
  to_facility_name: string;
  patient_visit_at?: string | null;
  patient_visit_instructions?: string | null;
  equipment_booking_end_at?: string | null;
  from_facility_hospital_id?: number | null;
};

const RequestPatientVisit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [row, setRow] = useState<RequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [visitAt, setVisitAt] = useState("");
  const [bookingEndAt, setBookingEndAt] = useState("");
  const [instructions, setInstructions] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = (await apiFetch(
        `/api/requests/${id}`,
      )) as RequestRow;
      setRow(data);
      if (data.patient_visit_at) {
        setVisitAt(toDatetimeLocalValue(new Date(data.patient_visit_at)));
      } else {
        setVisitAt(toDatetimeLocalValue(new Date()));
      }
      if (data.equipment_booking_end_at) {
        setBookingEndAt(
          toDatetimeLocalValue(new Date(data.equipment_booking_end_at)),
        );
      } else {
        setBookingEndAt("");
      }
      setInstructions(data.patient_visit_instructions || "");
    } catch (e) {
      setError((e as Error).message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const uid = user?.hospital_id != null ? Number(user.hospital_id) : null;
  const fromHosp =
    row?.from_facility_hospital_id != null
      ? Number(row.from_facility_hospital_id)
      : null;
  const canSchedule =
    user?.role === "super_admin" ||
    (uid != null && fromHosp != null && uid === fromHosp);

  const canEditStatus =
    row?.status === "approved" || row?.status === "results-sent";

  const handleSave = async () => {
    if (!id || !visitAt) {
      toast({
        title: "Date and time required",
        description: "Choose when the patient should attend.",
        variant: "destructive",
      });
      return;
    }
    if (!bookingEndAt) {
      toast({
        title: "Release time required",
        description:
          "Set when the equipment will be available again for other hospitals.",
        variant: "destructive",
      });
      return;
    }
    const start = new Date(visitAt);
    const end = new Date(bookingEndAt);
    if (!(end > start)) {
      toast({
        title: "Invalid release time",
        description: "Equipment release must be after the visit start.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const data = (await apiFetch(`/api/requests/${id}/patient-visit`, {
        method: "PATCH",
        body: JSON.stringify({
          patient_visit_at: start.toISOString(),
          equipment_booking_end_at: end.toISOString(),
          patient_visit_instructions: instructions.trim() || null,
        }),
      })) as { warning?: string };
      toast({
        title: "Visit saved",
        description: "The patient appointment has been updated.",
      });
      if (data.warning) {
        toast({
          title: "Scheduling note",
          description: data.warning,
        });
      }
      await load();
      navigate("/requests");
    } catch (e) {
      toast({
        title: "Could not save",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Patient visit"
        description="Set the date and time for the patient to attend the receiving facility."
      >
        <Button variant="outline" size="sm" asChild>
          <Link to="/requests" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to requests
          </Link>
        </Button>
      </PageHeader>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading request…</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {row && !loading && (
        <div className="space-y-4 max-w-lg">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base">
                  {row.equipment_name}
                </CardTitle>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {row.from_facility_name} → {row.to_facility_name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canEditStatus && (
                <p className="text-sm text-muted-foreground">
                  Visit scheduling is available after the request is approved.
                </p>
              )}

              {canEditStatus && !canSchedule && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <p className="text-sm font-medium">Visit details</p>
                  <p className="text-xs text-muted-foreground">
                    Set by the hospital that supplies the equipment.
                  </p>
                  {row.patient_visit_at ? (
                    <>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Visit start: </span>
                        {new Date(row.patient_visit_at).toLocaleString(undefined, {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </p>
                      {row.equipment_booking_end_at ? (
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Equipment available again from:{" "}
                          </span>
                          {new Date(row.equipment_booking_end_at).toLocaleString(
                            undefined,
                            {
                              dateStyle: "full",
                              timeStyle: "short",
                            },
                          )}
                        </p>
                      ) : null}
                      {row.patient_visit_instructions ? (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Instructions: </span>
                          {row.patient_visit_instructions}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The equipment hospital has not set a visit time yet.
                    </p>
                  )}
                </div>
              )}

              {canEditStatus && canSchedule && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="visit-at">Patient visit start</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <Input
                        id="visit-at"
                        type="datetime-local"
                        className="flex-1"
                        value={visitAt}
                        onChange={(e) => setVisitAt(e.target.value)}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="visit-calendar"
                            variant="outline"
                            className={cn(
                              "sm:w-auto w-full justify-start text-left font-normal",
                              !visitAt && "text-muted-foreground",
                            )}
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {visitAt
                              ? format(new Date(visitAt), "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={visitAt ? new Date(visitAt) : undefined}
                            onSelect={(d) => {
                              if (!d) return;
                              setVisitAt(mergeDateIntoDatetimeLocal(visitAt, d));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="booking-end-at">
                      Equipment release (available again for others)
                    </Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <Input
                        id="booking-end-at"
                        type="datetime-local"
                        className="flex-1"
                        value={bookingEndAt}
                        onChange={(e) => setBookingEndAt(e.target.value)}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "sm:w-auto w-full justify-start text-left font-normal",
                              !bookingEndAt && "text-muted-foreground",
                            )}
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingEndAt
                              ? format(new Date(bookingEndAt), "PPP")
                              : "Pick end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              bookingEndAt ? new Date(bookingEndAt) : undefined
                            }
                            onSelect={(d) => {
                              if (!d) return;
                              setBookingEndAt(
                                mergeDateIntoDatetimeLocal(bookingEndAt || visitAt, d),
                              );
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This marks when the equipment is free for other hospitals on the
                      network. It must be after the visit start.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="visit-notes">Instructions for the patient</Label>
                    <Textarea
                      id="visit-notes"
                      placeholder="e.g. Fasting from midnight, bring insurance card, arrive 15 minutes early…"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={4}
                      maxLength={2000}
                    />
                  </div>
                  <Button
                    className="gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <CalendarClock className="h-4 w-4" />
                    {saving ? "Saving…" : "Save visit details"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RequestPatientVisit;
