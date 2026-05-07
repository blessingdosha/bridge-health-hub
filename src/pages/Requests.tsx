import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  FileText,
  CheckCircle2,
  CalendarClock,
  Download,
  Plus,
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
  patient_visit_instructions?: string | null;
  from_facility_hospital_id?: number | null;
  to_facility_hospital_id?: number | null;
  result_diagnosis_findings?: string | null;
  result_notes_report?: string | null;
  result_attachment?: string | null;
  has_clinical_result?: boolean;
};

function reportAvailable(row: EquipmentRequestRow) {
  return !!(
    row.patient_visit_at ||
    row.result_diagnosis_findings ||
    row.result_notes_report
  );
}

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

  const canScheduleVisit = (req: EquipmentRequestRow) => {
    if (req.status !== "approved" && req.status !== "results-sent") {
      return false;
    }
    const to = req.to_facility_hospital_id != null
      ? Number(req.to_facility_hospital_id)
      : null;
    if (user?.role === "super_admin") return true;
    if (uid == null || to == null) return false;
    return uid === to;
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

  const handleDownloadReport = async (reqId: number) => {
    try {
      await apiDownloadBlob(
        `/api/requests/${reqId}/report`,
        `medbridge-request-${reqId}-report.txt`,
      );
    } catch (e) {
      toast({
        title: "Download failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Request Tracking"
        description="Track and manage equipment requests"
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
        <p className="text-sm text-muted-foreground py-4">Loading requests…</p>
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

        {filtered.map((req) => (
          <Card key={req.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">
                  {req.id} — {req.equipment_name}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <StatusBadge status={req.status} />
                  {reportAvailable(req) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 text-xs"
                      type="button"
                      onClick={() => handleDownloadReport(req.id)}
                    >
                      <Download className="h-3.5 w-3.5" /> Report
                    </Button>
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
                  {(req.status === "approved" ||
                    req.status === "results-sent") && (
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
