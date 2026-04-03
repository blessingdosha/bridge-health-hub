import {
  Building2,
  FlaskConical,
  Stethoscope,
  ClipboardList,
  Plus,
  Send,
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
  const [totalLaboratories, setTotalLaboratories] = useState(0);
  const [availableEquipment, setAvailableEquipment] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [facilitiesData, equipmentData, requestsData] = await Promise.all(
          [
            apiFetch("/api/facilities"),
            apiFetch("/api/equipment/available"),
            apiFetch("/api/requests/"),
          ],
        );

        setRecentRequests(requestsData.slice(0, 5));
        setTotalHospitals(
          facilitiesData.filter((f: any) => f.facility_type === "hospital")
            .length,
        );
        setTotalLaboratories(
          facilitiesData.filter((f: any) => f.facility_type === "laboratory")
            .length,
        );
        setAvailableEquipment(equipmentData.length);
        setPendingRequests(
          requestsData.filter((r: any) => r.status === "pending").length,
        );
      } catch (err) {
        setRecentRequests([]);
        setTotalHospitals(0);
        setTotalLaboratories(0);
        setAvailableEquipment(0);
        setPendingRequests(0);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of MedBridge hospital collaboration network"
      >
        <Button onClick={() => navigate("/equipment")} size="sm">
          <Plus className="h-4 w-4" /> Add Equipment
        </Button>
        <Button
          onClick={() => navigate("/requests/new")}
          variant="outline"
          size="sm"
        >
          <Send className="h-4 w-4" /> Request Equipment
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Hospitals"
          value={totalHospitals}
          icon={Building2}
        />
        <StatCard
          title="Total Laboratories"
          value={totalLaboratories}
          icon={FlaskConical}
        />
        <StatCard
          title="Available Equipment"
          value={availableEquipment}
          icon={Stethoscope}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={ClipboardList}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead className="hidden md:table-cell">From</TableHead>
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
    </div>
  );
};

export default Dashboard;
