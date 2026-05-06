import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

function splitDisplayName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return {
    first: parts[0],
    last: parts.slice(1).join(" "),
  };
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (
    (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  );
}

const Profile = () => {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || "Signed-in user";
  const first =
    user?.first_name?.trim() || splitDisplayName(displayName).first;
  const last =
    user?.last_name?.trim() || splitDisplayName(displayName).last;
  const email = user?.email || "";
  const role = user?.role || "";

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile" description="Manage your account information" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">
                  {initialsFromName(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground capitalize">{role || "Member"}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>First Name</Label>
                <Input defaultValue={first} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Last Name</Label>
                <Input defaultValue={last} readOnly />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Email</Label>
                <Input defaultValue={email} type="email" readOnly />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Phone</Label>
                <Input placeholder="Add in a future profile API" readOnly disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital affiliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label>Hospital</Label>
                <Input
                  readOnly
                  value={user?.hospital_name?.trim() || "—"}
                  placeholder="Not linked to a hospital account"
                />
              </div>
              <div className="grid gap-2">
                <Label>App role</Label>
                <Input defaultValue={role} readOnly className="capitalize" />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Hospital license (org)</Label>
                <Input
                  readOnly
                  value={user?.hospital_license_number?.trim() || "—"}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Hospital details come from your organization registration. Contact your hospital admin
              for corrections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
