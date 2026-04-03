import { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";

interface FacilityOption {
  id: number | string;
  name: string;
}

interface EquipmentOption {
  id: number | string;
  name: string;
  facility_id?: number | string;
  hospital_id?: number | string;
  lab_id?: number | string;
  laboratory_id?: number | string;
}

const NewRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");

  const [equipmentId, setEquipmentId] = useState("");
  const [fromFacility, setFromFacility] = useState("");
  const [toFacility, setToFacility] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const filteredEquipment = fromFacility
    ? equipment.filter((e) => {
        const facilityId =
          e.facility_id ?? e.hospital_id ?? e.lab_id ?? e.laboratory_id;
        return String(facilityId) === fromFacility;
      })
    : equipment;

  const toFacilityOptions = facilities.filter(
    (f) => String(f.id) !== fromFacility,
  );

  useEffect(() => {
    const fetchFormData = async () => {
      setBootstrapLoading(true);
      setBootstrapError("");
      try {
        const [equipmentData, facilitiesData] = await Promise.all([
          apiFetch("/api/equipment/available"),
          apiFetch("/api/facilities"),
        ]);
        setEquipment(equipmentData);
        setFacilities(facilitiesData);
      } catch (err) {
        setBootstrapError((err as Error).message || "Failed to load form data");
      } finally {
        setBootstrapLoading(false);
      }
    };

    fetchFormData();
  }, []);

  useEffect(() => {
    if (!equipmentId) return;
    const stillValid = filteredEquipment.some(
      (e) => String(e.id) === equipmentId,
    );
    if (!stillValid) {
      setEquipmentId("");
    }
  }, [fromFacility, equipmentId, filteredEquipment]);

  useEffect(() => {
    if (!toFacility) return;
    if (toFacility === fromFacility) {
      setToFacility("");
    }
  }, [fromFacility, toFacility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId || !fromFacility || !toFacility || quantity < 1) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (fromFacility === toFacility) {
      toast({
        title: "Invalid facilities",
        description: "From facility and to facility must be different.",
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
          notes: notes.trim(),
          from_facility: Number(fromFacility),
          to_facility: Number(toFacility),
          quantity: Number(quantity),
        }),
      });

      setLoading(false);
      toast({
        title: "Request Submitted",
        description: "Your equipment request has been sent successfully.",
      });
      navigate("/requests");
    } catch (err) {
      setLoading(false);
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to submit request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Request Equipment"
        description="Submit a new equipment request to another facility"
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
              <Label>From Facility</Label>
              <Select value={fromFacility} onValueChange={setFromFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose source facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>To Facility</Label>
              <Select value={toFacility} onValueChange={setToFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose destination facility" />
                </SelectTrigger>
                <SelectContent>
                  {toFacilityOptions.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
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
                      fromFacility
                        ? "Choose equipment"
                        : "Select from facility first"
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
