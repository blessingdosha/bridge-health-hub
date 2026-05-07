import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type RequestRow = {
  id: number;
  status: string;
  equipment_name: string;
  from_facility_name: string;
  to_facility_name: string;
  patient_visit_at?: string | null;
  patient_visit_instructions?: string | null;
  to_facility_hospital_id?: number | null;
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
  const toHosp =
    row?.to_facility_hospital_id != null
      ? Number(row.to_facility_hospital_id)
      : null;
  const canSchedule =
    user?.role === "super_admin" ||
    (uid != null && toHosp != null && uid === toHosp);

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
    setSaving(true);
    try {
      const when = new Date(visitAt);
      await apiFetch(`/api/requests/${id}/patient-visit`, {
        method: "PATCH",
        body: JSON.stringify({
          patient_visit_at: when.toISOString(),
          patient_visit_instructions: instructions.trim() || null,
        }),
      });
      toast({
        title: "Visit saved",
        description: "The patient appointment has been updated.",
      });
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
                  <p className="text-sm font-medium">Scheduled by receiving site</p>
                  {row.patient_visit_at ? (
                    <>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Date & time: </span>
                        {new Date(row.patient_visit_at).toLocaleString(undefined, {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </p>
                      {row.patient_visit_instructions ? (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Instructions: </span>
                          {row.patient_visit_instructions}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The receiving facility has not set a visit time yet.
                    </p>
                  )}
                </div>
              )}

              {canEditStatus && canSchedule && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="visit-at">Date and time</Label>
                    <Input
                      id="visit-at"
                      type="datetime-local"
                      value={visitAt}
                      onChange={(e) => setVisitAt(e.target.value)}
                    />
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
