import {
  Building2,
  Stethoscope,
  ClipboardList,
  Plus,
  Send,
  Activity,
  Clock3,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [availableEquipment, setAvailableEquipment] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState(0);
  const [resultsSent, setResultsSent] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [hospitalsData, equipmentData, requestsData] = await Promise.all([
          apiFetch("/api/hospitals"),
          apiFetch("/api/equipment/available"),
          apiFetch("/api/requests/"),
        ]);

        setRecentRequests((requestsData || []).slice(0, 6));
        setTotalHospitals((hospitalsData || []).length);
        setAvailableEquipment((equipmentData || []).length);
        setPendingRequests(
          (requestsData || []).filter((r: any) => r.status === "pending").length,
        );
        setApprovedRequests(
          (requestsData || []).filter((r: any) => r.status === "approved").length,
        );
        setResultsSent(
          (requestsData || []).filter((r: any) => r.status === "results-sent")
            .length,
        );
      } catch {
        setRecentRequests([]);
        setTotalHospitals(0);
        setAvailableEquipment(0);
        setPendingRequests(0);
        setApprovedRequests(0);
        setResultsSent(0);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview for hospital collaboration and request handling"
      >
        <Button onClick={() => navigate("/equipment")} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Equipment
        </Button>
        <Button
          onClick={() => navigate("/requests/new")}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Send className="h-4 w-4" /> Request Equipment
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hospitals in Network"
          value={totalHospitals}
          icon={Building2}
          className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
        />
        <StatCard
          title="Available Equipment"
          value={availableEquipment}
          icon={Stethoscope}
          className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock3}
          className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent"
        />
        <StatCard
          title="Results Sent"
          value={resultsSent}
          icon={Activity}
          className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer"
                    onClick={() => navigate("/requests")}
                  >
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>{req.equipment_name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {req.from_facility_name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Request Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold">{pendingRequests}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-2xl font-semibold">{approvedRequests}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Results Sent</p>
              <p className="text-2xl font-semibold">{resultsSent}</p>
            </div>
            <Button className="w-full gap-2" onClick={() => navigate("/requests")}>
              <ClipboardList className="h-4 w-4" /> Open Request Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
