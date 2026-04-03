import { useState } from "react";
import { Send, FileText, CheckCircle2 } from "lucide-react";
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
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type RequestStatus = "pending" | "approved" | "rejected" | "results-sent";
type FilterStatus = "all" | RequestStatus;

const Requests = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/requests/");
        setRequestData(data);
      } catch (err) {
        setError((err as Error).message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [resultDiagnosis, setResultDiagnosis] = useState("");

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

  const handleSendResults = async (reqId: string) => {
    if (!resultNotes.trim()) {
      toast({
        title: "Error",
        description: "Please enter the patient results before sending.",
        variant: "destructive",
      });
      return;
    }
    try {
      await apiFetch(`/api/requests/${reqId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "results-sent",
          results: `Diagnosis: ${resultDiagnosis || "N/A"}. Notes: ${resultNotes}`,
        }),
      });
      // Refresh list
      const data = await apiFetch("/api/requests/");
      setRequestData(data);
      toast({
        title: "Results Sent",
        description: `Patient results for ${reqId} have been sent back to the requesting hospital.`,
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
  };

  return (
    <div>
      <PageHeader
        title="Request Tracking"
        description="Track and manage equipment requests"
      >
        <div className="flex gap-1 flex-wrap">
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

      <div className="space-y-4">
        {filtered.length === 0 && (
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
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  {req.status === "approved" && (
                    <Dialog
                      open={sendingId === req.id}
                      onOpenChange={(open) => {
                        setSendingId(open ? req.id : null);
                        if (!open) {
                          setResultNotes("");
                          setResultDiagnosis("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                        >
                          <Send className="h-3.5 w-3.5" /> Send Results
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Patient Results</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Send results for{" "}
                          <span className="font-medium text-foreground">
                            {req.equipment_name}
                          </span>{" "}
                          back to{" "}
                          <span className="font-medium text-foreground">
                            {req.to_facility_name}
                          </span>
                          .
                        </p>
                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <Label>Diagnosis / Finding</Label>
                            <Input
                              placeholder="e.g. No abnormalities detected"
                              value={resultDiagnosis}
                              onChange={(e) =>
                                setResultDiagnosis(e.target.value)
                              }
                              maxLength={200}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Detailed Notes / Report</Label>
                            <Textarea
                              placeholder="Enter patient results, observations, and recommendations..."
                              value={resultNotes}
                              onChange={(e) => setResultNotes(e.target.value)}
                              rows={5}
                              maxLength={2000}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Attach Report (optional)</Label>
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.png,.doc,.docx"
                              className="cursor-pointer"
                            />
                            <p className="text-xs text-muted-foreground">
                              PDF, images, or documents up to 10MB
                            </p>
                          </div>
                          <Button
                            onClick={() => handleSendResults(req.id)}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" /> Send Results to{" "}
                            {req.to_facility_name}
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
              {/* Timeline */}
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

              {/* Results Display */}
              {req.results && (
                <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-semibold">
                      Patient Results
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{req.results}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Sent back to requesting hospital
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
