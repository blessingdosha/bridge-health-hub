import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, type UserInfo } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  getAiRecommendationsEnabled,
  setAiRecommendationsEnabled,
} from "@/lib/preferences";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, loginSuccess } = useAuth();
  const [aiOn, setAiOn] = useState(() => getAiRecommendationsEnabled());
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate("/auth", { replace: true });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPw !== newPw2) {
      toast.error("New passwords do not match");
      return;
    }
    setPwBusy(true);
    try {
      const data = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: curPw,
          new_password: newPw,
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
        setCurPw("");
        setNewPw("");
        setNewPw2("");
        toast.success("Password updated");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Settings" description="Configure your preferences" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Request Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified for new equipment requests</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>AI Recommendations</Label>
                <p className="text-sm text-muted-foreground">Show smart referral suggestions on the AI page</p>
              </div>
              <Switch
                checked={aiOn}
                onCheckedChange={(v) => {
                  setAiOn(v);
                  setAiRecommendationsEnabled(v);
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="set-cur">Current password</Label>
                <Input
                  id="set-cur"
                  type="password"
                  autoComplete="current-password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-new">New password</Label>
                <Input
                  id="set-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-new2">Confirm new password</Label>
                <Input
                  id="set-new2"
                  type="password"
                  autoComplete="new-password"
                  value={newPw2}
                  onChange={(e) => setNewPw2(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" disabled={pwBusy}>
                {pwBusy ? "Updating…" : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark theme</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" type="button" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;
