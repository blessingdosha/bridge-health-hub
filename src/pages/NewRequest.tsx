import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "@/lib/api";

interface HospitalOption {
  id: number | string;
  name: string;
}

interface EquipmentOption {
  id: number | string;
  name: string;
  hospital_id?: number | string | null;
  hospital_name?: string | null;
}

const NewRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");

  const [equipmentId, setEquipmentId] = useState("");
  const [fromHospital, setFromHospital] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const filteredEquipment = useMemo(() => {
    if (!fromHospital) return equipment;
    return equipment.filter(
      (e) =>
        e.hospital_id != null && String(e.hospital_id) === String(fromHospital),
    );
  }, [equipment, fromHospital]);

  useEffect(() => {
    const fetchFormData = async () => {
      setBootstrapLoading(true);
      setBootstrapError("");
      try {
        const [equipmentData, hospitalsData] = await Promise.all([
          apiFetch("/api/equipment/available"),
          apiFetch("/api/hospitals"),
        ]);
        setEquipment(Array.isArray(equipmentData) ? equipmentData : []);
        setHospitals(Array.isArray(hospitalsData) ? hospitalsData : []);
      } catch (err) {
        setBootstrapError((err as Error).message || "Failed to load form data");
      } finally {
        setBootstrapLoading(false);
      }
    };

    fetchFormData();
  }, []);

  const recommendedHospitalName =
    (location.state as { recommendedHospitalName?: string } | null)
      ?.recommendedHospitalName ?? null;

  useEffect(() => {
    if (!recommendedHospitalName || hospitals.length === 0) return;
    const match = hospitals.find(
      (h) =>
        h.name.toLowerCase().trim() ===
        recommendedHospitalName.toLowerCase().trim(),
    );
    if (match) {
      setFromHospital(String(match.id));
    }
  }, [recommendedHospitalName, hospitals]);

  useEffect(() => {
    if (!equipmentId) return;
    const stillValid = filteredEquipment.some((e) => String(e.id) === equipmentId);
    if (!stillValid) {
      setEquipmentId("");
    }
  }, [fromHospital, equipmentId, filteredEquipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId || !fromHospital || quantity < 1) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/requests/", {
        method: "POST",
        body: JSON.stringify({
          equipment_id: Number(equipmentId),
          from_hospital_id: Number(fromHospital),
          notes: notes.trim(),
          quantity: Number(quantity),
        }),
      });

      toast({
        title: "Request Submitted",
        description: "Your equipment request has been sent successfully.",
      });
      navigate("/requests");
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Request Equipment"
        description="Submit a new equipment request to another hospital"
      />

      <Card>
        <CardHeader>
          <CardTitle>Equipment Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          {bootstrapLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              Loading form data...
            </p>
          )}
          {bootstrapError && (
            <p className="text-sm text-destructive mb-4">{bootstrapError}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label>Source Hospital</Label>
              <Select value={fromHospital} onValueChange={setFromHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose source hospital" />
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
            <div className="grid gap-2">
              <Label>Select Equipment</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      fromHospital
                        ? "Choose equipment"
                        : "Select source hospital first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredEquipment.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add request notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequest;
