import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { UserPlus } from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  must_change_password: boolean;
  created_at: string;
};

const Team = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await apiFetch("/api/hospital/team");
      setMembers(Array.isArray(rows) ? rows : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "hospital_admin") {
      navigate("/dashboard", { replace: true });
      return;
    }
    load();
  }, [user, navigate]);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !inviteEmail.trim()) {
      toast.error("Fill in first name, last name, and email");
      return;
    }
    setInviting(true);
    try {
      await apiFetch("/api/hospital/team/invite", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: inviteEmail.trim(),
        }),
      });
      toast.success("Invitation sent with a temporary password.");
      setFirstName("");
      setLastName("");
      setInviteEmail("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Hospital team"
        description="Invite other doctors. They receive an email with a temporary password and must set a new password when they first sign in."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            Invite a doctor
          </CardTitle>
          <CardDescription>
            Invited users are created as physicians under your hospital after it is approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onInvite} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ifn">First name</Label>
              <Input
                id="ifn"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Chidi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iln">Last name</Label>
              <Input
                id="iln"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nwosu"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="iem">Work email</Label>
              <Input
                id="iem"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@hospital.org"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={inviting}>
                {inviting ? "Sending…" : "Send invite email"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>Everyone linked to your hospital in MedBridge.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>First login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell className="capitalize">{m.role.replace("_", " ")}</TableCell>
                    <TableCell>
                      {m.must_change_password ? (
                        <span className="text-amber-600 text-sm">Pending password change</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;
