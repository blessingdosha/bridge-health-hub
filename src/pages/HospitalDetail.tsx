import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Stethoscope, UserRound } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/api/hospitals/${id}`);
        setDetail(data);
      } catch (e) {
        setError((e as Error).message || "Failed to load hospital details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={detail?.name || "Hospital Details"}
        description="Hospital profile, equipment inventory, and doctors"
      >
        <Button variant="outline" size="sm" asChild>
          <Link to="/facilities" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to hospitals
          </Link>
        </Button>
      </PageHeader>

      {loading && <p className="text-sm text-muted-foreground">Loading details…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && detail && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hospital Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-muted-foreground">Name: </span>
                {detail.name}
              </p>
              <p>
                <span className="text-muted-foreground">License: </span>
                {detail.license_number || "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">Location: </span>
                {detail.location || "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">City/State: </span>
                {detail.city || "N/A"}, {detail.state || "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">Email: </span>
                {detail.contact_email || "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {detail.contact_phone || "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Equipment ({detail.equipment_count || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(detail.equipment || []).length === 0 ? (
                <p className="text-muted-foreground">No equipment listed.</p>
              ) : (
                detail.equipment.map((eq: any) => (
                  <p key={eq.id}>
                    {eq.name} - {eq.type || "General"} (
                    {eq.availability ? "Available" : "Unavailable"})
                  </p>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Doctors / Team ({detail.doctor_count || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(detail.doctors || []).length === 0 ? (
                <p className="text-muted-foreground">No users assigned.</p>
              ) : (
                detail.doctors.map((doc: any) => (
                  <p key={doc.id}>
                    {doc.name} - {doc.role} ({doc.email})
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default HospitalDetail;
