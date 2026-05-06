import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Building2, FlaskConical, Stethoscope, Users } from "lucide-react";

type Overview = {
  users: number;
  hospitals: number;
  laboratories: number;
  facilities: number;
  equipment: number;
  pending_hospitals: number;
};

type HospitalRow = {
  id: number;
  name: string;
  license_number: string | null;
  registration_status: string;
  location: string | null;
  contact_email: string | null;
  user_count?: number;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  hospital_name: string | null;
  hospital_status: string | null;
};

type LabRow = {
  id: number;
  name: string;
  location: string | null;
  contact_email: string | null;
};

type EquipmentRow = {
  id: number;
  name: string;
  type: string | null;
  facility_id: number | null;
  availability: boolean;
};

type AdminHospitalActionResponse = {
  message?: string;
  hospital?: HospitalRow;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [labs, setLabs] = useState<LabRow[]>([]);
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actioningId, setActioningId] = useState<number | null>(null);

  const loadOverview = useCallback(async () => {
    const o = await apiFetch("/api/admin/overview");
    setOverview(o);
  }, []);

  const loadHospitals = useCallback(async () => {
    const rows = await apiFetch("/api/admin/hospitals");
    setHospitals(Array.isArray(rows) ? rows : []);
  }, []);

  const loadUsers = useCallback(async () => {
    const rows = await apiFetch("/api/admin/users");
    setUsers(Array.isArray(rows) ? rows : []);
  }, []);

  const loadLabs = useCallback(async () => {
    const rows = await apiFetch("/api/laboratory");
    setLabs(Array.isArray(rows) ? rows : []);
  }, []);

  const loadEquipment = useCallback(async () => {
    const rows = await apiFetch("/api/equipment/available");
    setEquipment(Array.isArray(rows) ? rows : []);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        loadOverview(),
        loadHospitals(),
        loadUsers(),
        loadLabs(),
        loadEquipment(),
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load admin data");
    }
  }, [loadEquipment, loadHospitals, loadLabs, loadOverview, loadUsers]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "super_admin") {
      navigate("/dashboard", { replace: true });
      return;
    }
    refreshAll();
  }, [user, navigate, refreshAll]);

  const approve = async (id: number) => {
    if (actioningId === id) return;
    setActioningId(id);
    try {
      const resp = (await apiFetch(`/api/admin/hospitals/${id}/approve`, {
        method: "PATCH",
      })) as AdminHospitalActionResponse;
      const nextHospital = resp.hospital;
      if (nextHospital) {
        setHospitals((prev) =>
          prev.map((h) => (h.id === id ? { ...h, ...nextHospital } : h)),
        );
      }
      toast.success(
        resp.message ||
          `Hospital ${nextHospital?.name ?? ""} approved successfully.`,
      );
      await Promise.all([loadOverview(), loadUsers(), loadHospitals()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActioningId(null);
    }
  };

  const reject = async (id: number) => {
    if (actioningId === id) return;
    setActioningId(id);
    try {
      const resp = (await apiFetch(`/api/admin/hospitals/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: rejectReason.trim() || null }),
      })) as AdminHospitalActionResponse;
      const nextHospital = resp.hospital;
      if (nextHospital) {
        setHospitals((prev) =>
          prev.map((h) => (h.id === id ? { ...h, ...nextHospital } : h)),
        );
      }
      toast.success(
        resp.message || `Hospital ${nextHospital?.name ?? ""} was rejected.`,
      );
      setRejectId(null);
      setRejectReason("");
      await Promise.all([loadOverview(), loadUsers(), loadHospitals()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActioningId(null);
    }
  };

  const pending = hospitals.filter((h) => h.registration_status === "pending");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Platform admin"
        description="Approve hospital registrations and review directory data."
      />

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending hospitals</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.pending_hospitals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Equipment items</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.equipment}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="hospitals" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="pending">Pending approval</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="labs">Laboratories</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="hospitals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All hospitals</CardTitle>
              <CardDescription>Registration status and team size.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {h.license_number || "—"}
                      </TableCell>
                      <TableCell className="capitalize">{h.registration_status}</TableCell>
                      <TableCell>{h.user_count ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Awaiting approval</CardTitle>
              <CardDescription>New hospital registrations from the public form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending hospitals.</p>
              ) : (
                pending.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-col gap-3 border rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{h.name}</p>
                      <p className="text-sm text-muted-foreground">
                        License: {h.license_number}
                        {h.location ? ` · ${h.location}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => approve(h.id)}
                        disabled={actioningId === h.id}
                      >
                        {actioningId === h.id ? "Approving..." : "Approve"}
                      </Button>
                      {rejectId === h.id ? (
                        <div className="flex flex-col gap-2 w-full sm:w-64">
                          <Label className="text-xs">Reason (optional)</Label>
                          <Input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => reject(h.id)}
                              disabled={actioningId === h.id}
                            >
                              {actioningId === h.id
                                ? "Rejecting..."
                                : "Confirm reject"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => {
                                setRejectId(null);
                                setRejectReason("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectId(h.id);
                            setRejectReason("");
                          }}
                          disabled={actioningId === h.id}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All users</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hospital</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role.replace("_", " ")}</TableCell>
                      <TableCell>
                        {u.hospital_name || "—"}
                        {u.hospital_status ? (
                          <span className="text-muted-foreground text-xs ml-1">
                            ({u.hospital_status})
                          </span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Laboratories
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.location || "—"}</TableCell>
                      <TableCell>{l.contact_email || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment directory</CardTitle>
              <CardDescription>Read-only view of registered equipment.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Facility ID</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell>{eq.type || "—"}</TableCell>
                      <TableCell>{eq.facility_id ?? "—"}</TableCell>
                      <TableCell>{eq.availability ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
