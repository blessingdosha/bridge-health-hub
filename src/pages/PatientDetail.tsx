import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch, apiUpload } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArrowLeft, Send, Upload } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:7777";

type Patient = {
  id: number;
  hospital_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  external_reference?: string | null;
  clinical_summary?: string | null;
  attachment_path?: string | null;
  owning_hospital_name?: string;
};

type OutShare = {
  id: number;
  to_hospital_id: number;
  to_hospital_name: string;
  status: string;
  sender_notes?: string | null;
  created_at: string;
};

type HospitalOpt = { id: number; name: string };

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [outbound, setOutbound] = useState<OutShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalOpt[]>([]);
  const [toHospital, setToHospital] = useState<string>("");
  const [shareNotes, setShareNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [eFirst, setEFirst] = useState("");
  const [eLast, setELast] = useState("");
  const [eDob, setEDob] = useState("");
  const [eGender, setEGender] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eRef, setERef] = useState("");
  const [eSum, setESum] = useState("");

  const hid = user?.hospital_id ?? null;
  const isOwner =
    patient != null &&
    hid != null &&
    Number(patient.hospital_id) === Number(hid);
  const canEdit =
    (user?.role === "physician" || user?.role === "hospital_admin") && isOwner;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/patients/${id}`);
      setPatient(data.patient);
      setOutbound(Array.isArray(data.outbound_shares) ? data.outbound_shares : []);
      const p = data.patient;
      setEFirst(p.first_name || "");
      setELast(p.last_name || "");
      setEDob(p.date_of_birth || "");
      setEGender(p.gender || "");
      setEPhone(p.phone || "");
      setERef(p.external_reference || "");
      setESum(p.clinical_summary || "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load patient");
      navigate("/patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const loadHospitals = async () => {
    try {
      const rows = await apiFetch("/api/hospitals/by-type?type=hospital");
      const list = (Array.isArray(rows) ? rows : []) as HospitalOpt[];
      const mine = user?.hospital_id;
      setHospitals(list.filter((h) => mine == null || Number(h.id) !== Number(mine)));
    } catch {
      setHospitals([]);
    }
  };

  useEffect(() => {
    if (shareOpen) loadHospitals();
  }, [shareOpen]);

  const saveEdit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await apiFetch(`/api/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          first_name: eFirst,
          last_name: eLast,
          date_of_birth: eDob || null,
          gender: eGender || null,
          phone: ePhone || null,
          external_reference: eRef || null,
          clinical_summary: eSum || null,
        }),
      });
      toast.success("Record updated");
      setEditOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const sendShare = async () => {
    if (!id || !toHospital) {
      toast.error("Choose a hospital");
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/patients/${id}/share`, {
        method: "POST",
        body: JSON.stringify({
          to_hospital_id: Number(toHospital),
          sender_notes: shareNotes.trim() || null,
        }),
      });
      toast.success("Transfer request sent");
      setShareOpen(false);
      setShareNotes("");
      setToHospital("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Share failed");
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await apiUpload(`/api/patients/${id}/attachment`, fd);
      toast.success("Attachment uploaded");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  };

  if (loading || !patient) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-sm text-muted-foreground text-center">
        Loading…
      </div>
    );
  }

  const fileUrl = patient.attachment_path
    ? `${API_BASE}${patient.attachment_path}`
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link to="/patients" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`${patient.first_name} ${patient.last_name}`}
          description={patient.owning_hospital_name || "Patient record"}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Record</CardTitle>
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit patient</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>First name</Label>
                        <Input value={eFirst} onChange={(e) => setEFirst(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Last name</Label>
                        <Input value={eLast} onChange={(e) => setELast(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>DOB</Label>
                      <Input type="date" value={eDob} onChange={(e) => setEDob(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Gender</Label>
                      <Input value={eGender} onChange={(e) => setEGender(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Phone</Label>
                      <Input value={ePhone} onChange={(e) => setEPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Reference</Label>
                      <Input value={eRef} onChange={(e) => setERef(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Clinical summary</Label>
                      <Textarea rows={5} value={eSum} onChange={(e) => setESum(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEdit} disabled={saving}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-1" />
                    Share record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send to another hospital</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1">
                      <Label>Hospital</Label>
                      <Select value={toHospital} onValueChange={setToHospital}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((h) => (
                            <SelectItem key={h.id} value={String(h.id)}>
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Message (optional)</Label>
                      <Textarea
                        rows={3}
                        value={shareNotes}
                        onChange={(e) => setShareNotes(e.target.value)}
                        placeholder="Context for the receiving team"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShareOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendShare} disabled={saving}>
                      Send
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div>
                <Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" id="att" onChange={onFile} />
                <Button variant="secondary" size="sm" asChild>
                  <label htmlFor="att" className="cursor-pointer inline-flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    Attachment
                  </label>
                </Button>
              </div>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground">DOB</span>
              <p className="font-medium">{patient.date_of_birth || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gender</span>
              <p className="font-medium">{patient.gender || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone</span>
              <p className="font-medium">{patient.phone || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Reference</span>
              <p className="font-medium">{patient.external_reference || "—"}</p>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Clinical summary</span>
            <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/50 p-3">
              {patient.clinical_summary || "—"}
            </p>
          </div>
          {fileUrl ? (
            <div>
              <span className="text-muted-foreground">Attachment</span>
              <p className="mt-1">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium"
                >
                  Open file
                </a>
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canEdit && outbound.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outbound transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outbound.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.to_hospital_name}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === "accepted" ? "default" : "secondary"} className="capitalize">
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.created_at?.slice(0, 10) || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default PatientDetail;
