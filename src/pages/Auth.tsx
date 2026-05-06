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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Mail, Lock, User, ArrowRight, Building2 } from "lucide-react";

function mapLoginUser(raw: Record<string, unknown>): UserInfo {
  return {
    id: raw.id as string | number,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: String(raw.role ?? ""),
    first_name: (raw.first_name as string) ?? null,
    last_name: (raw.last_name as string) ?? null,
    hospital_id: raw.hospital_id != null ? Number(raw.hospital_id) : null,
    hospital_name: (raw.hospital_name as string) ?? null,
    hospital_license_number:
      (raw.hospital_license_number as string) ?? null,
    must_change_password: Boolean(raw.must_change_password),
  };
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [hospitalContactEmail, setHospitalContactEmail] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, loginSuccess } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(
        user.must_change_password ? "/change-password" : "/dashboard",
        { replace: true },
      );
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isLogin) {
      if (password.length < 1) {
        toast.error("Please enter your password");
        return;
      }
    } else {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), password }),
        });
        if (data.token && data.user) {
          loginSuccess(data.token, mapLoginUser(data.user as Record<string, unknown>));
          toast.success("Welcome back!");
          navigate(
            data.user.must_change_password ? "/change-password" : "/dashboard",
          );
        } else {
          throw new Error(data.message || "Login failed");
        }
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          toast.error("Please enter your first and last name");
          setLoading(false);
          return;
        }
        if (!hospitalName.trim() || !licenseNumber.trim()) {
          toast.error("Hospital name and license number are required");
          setLoading(false);
          return;
        }
        const data = await apiFetch("/api/auth/register-organization", {
          method: "POST",
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            password,
            hospital: {
              name: hospitalName.trim(),
              location: hospitalLocation.trim() || null,
              contact_email: hospitalContactEmail.trim() || email.trim(),
              contact_phone: hospitalPhone.trim() || null,
              license_number: licenseNumber.trim(),
            },
          }),
        });
        toast.success(
          data.message ||
            "Registration submitted. Sign in after your hospital is approved.",
        );
        setIsLogin(true);
        setPassword("");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <Heart className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">MedBridge</h1>
          <p className="text-primary-foreground/70 mt-1">
            Hospital-to-Hospital Collaboration
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              {isLogin ? "Welcome back" : "Register your hospital"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Create the founding admin account and submit your facility for approval"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fn">First name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fn"
                          placeholder="Ada"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ln">Last name</Label>
                      <Input
                        id="ln"
                        placeholder="Okafor"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hname">Hospital name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hname"
                        placeholder="Lagos University Teaching Hospital"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Hospital license number</Label>
                    <Input
                      id="license"
                      placeholder="Official facility license / registration ID"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hloc">Location (optional)</Label>
                    <Input
                      id="hloc"
                      placeholder="City, region"
                      value={hospitalLocation}
                      onChange={(e) => setHospitalLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hcemail">Hospital contact email (optional)</Label>
                    <Input
                      id="hcemail"
                      type="email"
                      placeholder="Defaults to your email if empty"
                      value={hospitalContactEmail}
                      onChange={(e) => setHospitalContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hphone">Hospital phone (optional)</Label>
                    <Input
                      id="hphone"
                      placeholder="+234 …"
                      value={hospitalPhone}
                      onChange={(e) => setHospitalPhone(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Your email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    maxLength={128}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters. You will be the hospital administrator once approved.
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  "Please wait..."
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Submit registration"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {isLogin ? "Need to register your hospital?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setPassword("");
                  }}
                  className="text-accent font-medium hover:underline"
                >
                  {isLogin ? "Register hospital" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
