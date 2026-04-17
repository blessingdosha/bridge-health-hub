import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAiRecommendationsEnabled,
  setAiRecommendationsEnabled,
} from "@/lib/preferences";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [aiOn, setAiOn] = useState(() => getAiRecommendationsEnabled());

  const handleSignOut = () => {
    signOut();
    navigate("/auth", { replace: true });
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
