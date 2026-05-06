import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, UserRound } from "lucide-react";

type PatientRow = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  external_reference?: string | null;
  owning_hospital_name?: string;
  updated_at?: string;
};

type IncomingShare = {
  id: number;
  patient_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  external_reference?: string | null;
  from_hospital_name: string;
  sender_notes?: string | null;
  created_at: string;
};

const Patients = () => {
  const { user } = useAuth();
  const [owned, setOwned] = useState<PatientRow[]>([]);
  const [shared, setShared] = useState<PatientRow[]>([]);
  const [incoming, setIncoming] = useState<IncomingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("owned");

  const isSuper = user?.role === "super_admin";
  const canManage =
    user?.role === "physician" || user?.role === "hospital_admin";

  const load = async () => {
    setLoading(true);
    try {
      if (isSuper) {
        const all = await apiFetch("/api/patients");
        setOwned(Array.isArray(all) ? all : []);
        setShared([]);
        setIncoming([]);
      } else {
        const [o, s, inc] = await Promise.all([
          apiFetch("/api/patients?scope=owned"),
          apiFetch("/api/patients?scope=shared"),
          apiFetch("/api/patients/incoming"),
        ]);
        setOwned(Array.isArray(o) ? o : []);
        setShared(Array.isArray(s) ? s : []);
        setIncoming(Array.isArray(inc) ? inc : []);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.role]);

  const respond = async (shareId: number, action: "accept" | "decline") => {
    try {
      await apiFetch(`/api/patients/shares/${shareId}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      toast.success(action === "accept" ? "Share accepted" : "Share declined");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const formatName = (p: { first_name: string; last_name: string }) =>
    `${p.first_name} ${p.last_name}`.trim();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Patients"
        description={
          isSuper
            ? "Read-only directory of all patient records in the system."
            : "Records owned by your hospital, shared with you, and incoming transfer requests."
        }
      >
        {canManage ? (
          <Button asChild>
            <Link to="/patients/new">
              <Plus className="h-4 w-4 mr-2" />
              New patient
            </Link>
          </Button>
        ) : null}
      </PageHeader>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : isSuper ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>MRN / ref</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {owned.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center py-8">
                    No patient records yet.
                  </TableCell>
                </TableRow>
              ) : (
                owned.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{formatName(p)}</TableCell>
                    <TableCell>{p.owning_hospital_name || "—"}</TableCell>
                    <TableCell>{p.external_reference || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/patients/${p.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="owned">Our hospital</TabsTrigger>
            <TabsTrigger value="shared">Shared with us</TabsTrigger>
            <TabsTrigger value="incoming">
              Incoming
              {incoming.length > 0 ? (
                <Badge variant="secondary" className="ml-1">
                  {incoming.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owned.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No records yet. Add a patient to share summaries with partner hospitals.
                      </TableCell>
                    </TableRow>
                  ) : (
                    owned.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{formatName(p)}</TableCell>
                        <TableCell>{p.date_of_birth || "—"}</TableCell>
                        <TableCell>{p.external_reference || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/patients/${p.id}`}>Open</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="shared" className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Records another hospital has sent you and you have accepted.
            </p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>From hospital</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shared.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No accepted shares yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    shared.map((p) => (
                      <TableRow key={`${p.id}-${p.share_id}`}>
                        <TableCell className="font-medium">{formatName(p)}</TableCell>
                        <TableCell>{p.owning_hospital_name || "—"}</TableCell>
                        <TableCell>{p.date_of_birth || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/patients/${p.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="incoming" className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Accept to view the full record on the &quot;Shared with us&quot; tab; decline if not applicable.
            </p>
            {incoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg">
                <UserRound className="h-10 w-10 mb-2 opacity-50" />
                <p>No pending patient record transfers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incoming.map((s) => (
                  <div
                    key={s.id}
                    className="border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {formatName(s)} {s.external_reference ? `· ${s.external_reference}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        From {s.from_hospital_name}
                        {s.sender_notes ? ` · ${s.sender_notes}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => respond(s.id, "accept")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => respond(s.id, "decline")}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Patients;
