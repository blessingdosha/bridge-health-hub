import { useState } from "react";
import { Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requests } from "@/data/mockData";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const Requests = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const timelineSteps = ["Submitted", "Under Review", "Decision", "Completed"];

  const getStep = (status: string) => {
    if (status === "pending") return 1;
    if (status === "approved") return 3;
    if (status === "rejected") return 2;
    return 0;
  };

  return (
    <div>
      <PageHeader title="Request Tracking" description="Track and manage equipment requests">
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize text-xs">
              {s}
            </Button>
          ))}
        </div>
      </PageHeader>

      <div className="space-y-4">
        {filtered.map((req) => (
          <Card key={req.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{req.id} — {req.equipment}</CardTitle>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm text-muted-foreground">{req.from} → {req.to} · Qty: {req.quantity} · {req.date}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                {timelineSteps.map((step, i) => {
                  const active = i <= getStep(req.status);
                  const isRejected = req.status === "rejected" && i === getStep(req.status);
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div className={`h-2 w-full rounded-full ${isRejected ? "bg-destructive" : active ? "bg-success" : "bg-muted"}`} />
                      <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">{step}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Requests;
