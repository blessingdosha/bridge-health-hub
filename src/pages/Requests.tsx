import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  FileText,
  CheckCircle2,
  CalendarClock,
  Download,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, apiDownloadBlob, apiUpload } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type RequestStatus = "pending" | "approved" | "rejected" | "results-sent";
type FilterStatus = "all" | RequestStatus;

type EquipmentRequestRow = {
  id: number;
  status: string;
  equipment_name: string;
  from_facility_name: string;
  to_facility_name: string;
  quantity: number;
  created_at?: string;
  patient_visit_at?: string | null;
  equipment_booking_end_at?: string | null;
  patient_visit_instructions?: string | null;
  from_facility_hospital_id?: number | null;
  to_facility_hospital_id?: number | null;
  result_diagnosis_findings?: string | null;
  result_notes_report?: string | null;
  result_attachment?: string | null;
  has_clinical_result?: boolean;
};

const Requests = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [requestData, setRequestData] = useState<EquipmentRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sendingId, setSendingId] = useState<number | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [resultDiagnosis, setResultDiagnosis] = useState("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [decisioningId, setDecisioningId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const refresh = useCallback(async () => {
    const data = (await apiFetch("/api/requests/")) as EquipmentRequestRow[];
    setRequestData(data);
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        await refresh();
      } catch (err) {
        setError((err as Error).message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [refresh]);

  const uid = user?.hospital_id != null ? Number(user.hospital_id) : null;
  const isDoctorSide =
    user?.role === "physician" || user?.role === "hospital_admin";

  const canScheduleVisit = (req: EquipmentRequestRow) => {
    if (req.status !== "approved" && req.status !== "results-sent") {
      return false;
    }
    if (!isDoctorSide) return false;
    const from = req.from_facility_hospital_id != null
      ? Number(req.from_facility_hospital_id)
      : null;
    if (uid == null || from == null) return false;
    return uid === from;
  };

  const canDecideRequest = (req: EquipmentRequestRow) => {
    if (req.status !== "pending") return false;
    if (!isDoctorSide) return false;
    const from = req.from_facility_hospital_id != null
      ? Number(req.from_facility_hospital_id)
      : null;
    if (uid == null || from == null) return false;
    return uid === from;
  };

  const canSendResults = (req: EquipmentRequestRow) => {
    if (req.status !== "approved" && req.status !== "results-sent") {
      return false;
    }
    if (!isDoctorSide) return false;
    const from = req.from_facility_hospital_id != null
      ? Number(req.from_facility_hospital_id)
      : null;
    if (uid == null || from == null) return false;
    return uid === from;
  };

  const canDownloadActions = (req: EquipmentRequestRow) => {
    if (!isDoctorSide) return false;
    const from = req.from_facility_hospital_id != null
      ? Number(req.from_facility_hospital_id)
      : null;
    const to = req.to_facility_hospital_id != null
      ? Number(req.to_facility_hospital_id)
      : null;
    if (uid == null) return false;
    return uid === from || uid === to;
  };

  const filtered =
    filter === "all"
      ? requestData
      : requestData.filter((r) => r.status === filter);

  const timelineSteps = [
    "Submitted",
    "Under Review",
    "Decision",
    "Results Sent",
  ];

  const getStep = (status: string) => {
    if (status === "pending") return 1;
    if (status === "approved") return 2;
    if (status === "rejected") return 2;
    if (status === "results-sent") return 3;
    return 0;
  };

  const handleSendResults = async (reqId: number) => {
    if (!resultNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter the report notes before sending.",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append("diagnosis_findings", resultDiagnosis.trim() || "—");
    formData.append("notes_report", resultNotes.trim());
    if (resultFile) {
      formData.append("attachment", resultFile);
    }
    try {
      await apiUpload(`/api/requests/${reqId}/results`, formData);
      await refresh();
      toast({
        title: "Results sent",
        description: "Clinical results have been shared with the requesting facility.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to send results",
        variant: "destructive",
      });
    }
    setSendingId(null);
    setResultNotes("");
    setResultDiagnosis("");
    setResultFile(null);
  };

  const handleDownloadVisitSummary = async (reqId: number) => {
    try {
      await apiDownloadBlob(
        `/api/requests/${reqId}/visit-summary`,
        `medbridge-request-${reqId}-visit-summary.txt`,
      );
    } catch (e) {
      toast({
        title: "Visit summary download failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadClinicalResult = async (reqId: number) => {
    try {
      await apiDownloadBlob(
        `/api/requests/${reqId}/clinical-result`,
        `medbridge-request-${reqId}-clinical-result.txt`,
      );
    } catch (e) {
      toast({
        title: "Clinical result download failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDecision = async (
    reqId: number,
    status: "approved" | "rejected",
  ) => {
    setDecisioningId(reqId);
    try {
      const res = (await apiFetch(`/api/requests/${reqId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          rejection_reason:
            status === "rejected" ? rejectionReason.trim() || null : null,
        }),
      })) as { warning?: string };
      await refresh();
      toast({
        title: status === "approved" ? "Request approved" : "Request rejected",
        description:
          status === "approved"
            ? "The requesting hospital can proceed to patient visit scheduling."
            : "The request status has been updated to rejected.",
      });
      if (res.warning) {
        toast({
          title: "Approval note",
          description: res.warning,
        });
      }
      if (status === "rejected") {
        setRejectingId(null);
        setRejectionReason("");
      }
    } catch (err) {
      toast({
        title: "Action failed",
        description: (err as Error).message || "Could not update request status",
        variant: "destructive",
      });
    } finally {
      setDecisioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request Tracking"
        description="Track and manage equipment requests. Clinical actions (approve/reject, schedule visit, send results, download report) are available on doctor-side accounts."
      >
        <div className="flex gap-1 flex-wrap items-center">
          <Button size="sm" className="gap-1.5 text-xs" asChild>
            <Link to="/requests/new">
              <Plus className="h-3.5 w-3.5" /> Add Request
            </Link>
          </Button>
          {(
            [
              "all",
              "pending",
              "approved",
              "rejected",
              "results-sent",
            ] as FilterStatus[]
          ).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
              className="capitalize text-xs"
            >
              {s === "results-sent" ? "Results Sent" : s}
            </Button>
          ))}
        </div>
      </PageHeader>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-2/3 max-w-md" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && !loading && (
        <p className="text-sm text-destructive py-2">{error}</p>
      )}

      <div className="space-y-4">
        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No requests match this filter.
            </CardContent>
          </Card>
        )}

        {!loading &&
          filtered.map((req) => (
          <Card key={req.id} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">
                  {req.id} — {req.equipment_name}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <StatusBadge status={req.status} />
                  {canDecideRequest(req) && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        type="button"
                        onClick={() => handleDecision(req.id, "approved")}
                        disabled={decisioningId === req.id}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {decisioningId === req.id ? "Approving..." : "Approve"}
                      </Button>
                      {rejectingId === req.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="h-8 w-44 text-xs"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5 text-xs"
                            type="button"
                            onClick={() => handleDecision(req.id, "rejected")}
                            disabled={decisioningId === req.id}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            {decisioningId === req.id ? "Rejecting..." : "Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          type="button"
                          onClick={() => {
                            setRejectingId(req.id);
                            setRejectionReason("");
                          }}
                          disabled={decisioningId === req.id}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </>
                  )}
                  {canDownloadActions(req) && (
                    <>
                      {req.patient_visit_at && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5 text-xs"
                          type="button"
                          onClick={() => handleDownloadVisitSummary(req.id)}
                        >
                          <Download className="h-3.5 w-3.5" /> Download Visit Summary
                        </Button>
                      )}
                      {req.has_clinical_result && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5 text-xs"
                          type="button"
                          onClick={() => handleDownloadClinicalResult(req.id)}
                        >
                          <Download className="h-3.5 w-3.5" /> Download Clinical Result
                        </Button>
                      )}
                    </>
                  )}
                  {canScheduleVisit(req) && (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        to={`/requests/${req.id}/visit`}
                        className="gap-1.5 text-xs"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        {req.patient_visit_at ? "Visit" : "Schedule visit"}
                      </Link>
                    </Button>
                  )}
                  {canSendResults(req) && (
                    <Dialog
                      open={sendingId === req.id}
                      onOpenChange={(open) => {
                        setSendingId(open ? req.id : null);
                        if (!open) {
                          setResultNotes("");
                          setResultDiagnosis("");
                          setResultFile(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                        >
                          <Send className="h-3.5 w-3.5" /> Send results
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send clinical results</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Send results for{" "}
                          <span className="font-medium text-foreground">
                            {req.equipment_name}
                          </span>{" "}
                          back to the requesting facility{" "}
                          <span className="font-medium text-foreground">
                            {req.from_facility_name}
                          </span>
                          .
                        </p>
                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <Label>Diagnosis / findings</Label>
                            <Input
                              placeholder="e.g. No abnormalities detected"
                              value={resultDiagnosis}
                              onChange={(e) =>
                                setResultDiagnosis(e.target.value)
                              }
                              maxLength={2000}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Detailed notes / report</Label>
                            <Textarea
                              placeholder="Observations, measurements, and recommendations…"
                              value={resultNotes}
                              onChange={(e) => setResultNotes(e.target.value)}
                              rows={5}
                              maxLength={2000}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Attach file (optional)</Label>
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                              className="cursor-pointer"
                              onChange={(e) =>
                                setResultFile(e.target.files?.[0] ?? null)
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              PDF or image, up to 10MB
                            </p>
                          </div>
                          <Button
                            onClick={() => handleSendResults(req.id)}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" /> Send to{" "}
                            {req.from_facility_name}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {req.from_facility_name} → {req.to_facility_name} · Qty:{" "}
                {req.quantity} ·{" "}
                {req.created_at
                  ? new Date(req.created_at).toLocaleDateString()
                  : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {req.patient_visit_at && (
                <div className="rounded-lg border bg-card p-3 text-sm">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    Patient visit
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(req.patient_visit_at).toLocaleString(undefined, {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                  {req.patient_visit_instructions ? (
                    <p className="mt-2 text-foreground/90">
                      {req.patient_visit_instructions}
                    </p>
                  ) : null}
                  {req.equipment_booking_end_at ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Equipment available again on the network from{" "}
                      {new Date(req.equipment_booking_end_at).toLocaleString(
                        undefined,
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                      .
                    </p>
                  ) : null}
                </div>
              )}

              <div className="flex items-center gap-1">
                {timelineSteps.map((step, i) => {
                  const active = i <= getStep(req.status);
                  const isRejected =
                    req.status === "rejected" && i === getStep(req.status);
                  return (
                    <div
                      key={step}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className={`h-2 w-full rounded-full transition-colors ${isRejected ? "bg-destructive" : active ? "bg-success" : "bg-muted"}`}
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {req.has_clinical_result && (
                <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-semibold">
                      Clinical results
                    </span>
                  </div>
                  {req.result_diagnosis_findings ? (
                    <p className="text-sm">
                      <span className="font-medium text-foreground">
                        Findings:{" "}
                      </span>
                      <span className="text-muted-foreground">
                        {req.result_diagnosis_findings}
                      </span>
                    </p>
                  ) : null}
                  {req.result_notes_report ? (
                    <p className="text-sm mt-2 whitespace-pre-wrap">
                      <span className="font-medium text-foreground">
                        Notes:{" "}
                      </span>
                      <span className="text-muted-foreground">
                        {req.result_notes_report}
                      </span>
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 mt-3">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Shared with {req.from_facility_name}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Requests;
