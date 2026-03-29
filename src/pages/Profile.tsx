import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
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
                <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">DA</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Dr. Adebayo</p>
                <p className="text-sm text-muted-foreground">Senior Physician</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>First Name</Label>
                <Input defaultValue="Adebayo" />
              </div>
              <div className="grid gap-2">
                <Label>Last Name</Label>
                <Input defaultValue="Ogundimu" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input defaultValue="adebayo@luth.ng" type="email" />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input defaultValue="+234 801 234 5678" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Affiliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Hospital</Label>
                <Input defaultValue="Lagos University Teaching Hospital" />
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input defaultValue="Cardiology" />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input defaultValue="Senior Physician" />
              </div>
              <div className="grid gap-2">
                <Label>License Number</Label>
                <Input defaultValue="MDCN-12345" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
