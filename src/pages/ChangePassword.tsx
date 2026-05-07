import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth, type UserInfo } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Lock } from "lucide-react";
import { toast } from "sonner";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, loginSuccess } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && !user.must_change_password) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const data = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: current,
          new_password: next,
        }),
      });
      if (data.token && data.user) {
        const u: UserInfo = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          hospital_id: data.user.hospital_id,
          hospital_name: data.user.hospital_name,
          hospital_license_number: data.user.hospital_license_number,
          must_change_password: Boolean(data.user.must_change_password),
        };
        loginSuccess(data.token, u);
        toast.success("Password updated");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <Heart className="h-8 w-8 text-accent-foreground fill-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Set a new password</h1>
          <p className="text-primary-foreground/70 mt-1 text-sm">
            For security, replace your temporary password before continuing.
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5" />
              Change password
            </CardTitle>
            <CardDescription>
              Use the temporary password from your invite email as the current password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cur">Current password</Label>
                <Input
                  id="cur"
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nw">New password</Label>
                <Input
                  id="nw"
                  type="password"
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cf">Confirm new password</Label>
                <Input
                  id="cf"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Saving…" : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
