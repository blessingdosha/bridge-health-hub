import { Building2, FlaskConical, Stethoscope, ClipboardList, Plus, Send } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requests } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const recentRequests = requests.slice(0, 5);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of MedBridge hospital collaboration network">
        <Button onClick={() => navigate("/equipment")} size="sm">
          <Plus className="h-4 w-4" /> Add Equipment
        </Button>
        <Button onClick={() => navigate("/requests/new")} variant="outline" size="sm">
          <Send className="h-4 w-4" /> Request Equipment
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Hospitals" value={4} icon={Building2} trend="+2 this month" />
        <StatCard title="Total Laboratories" value={2} icon={FlaskConical} trend="+1 this month" />
        <StatCard title="Available Equipment" value={24} icon={Stethoscope} trend="8 categories" />
        <StatCard title="Pending Requests" value={2} icon={ClipboardList} trend="3 resolved this week" />
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
                <TableRow key={req.id} className="cursor-pointer" onClick={() => navigate("/requests")}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>{req.equipment}</TableCell>
                  <TableCell className="hidden md:table-cell">{req.from}</TableCell>
                  <TableCell className="hidden lg:table-cell">{req.date}</TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
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
