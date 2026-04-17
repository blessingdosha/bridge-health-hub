import { useCallback, useEffect, useState } from "react";
import {
  BrainCircuit,
  MapPin,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Loader2,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { getAiRecommendationsEnabled } from "@/lib/preferences";

type Recommendation = {
  id: string;
  hospital: string;
  facilityType?: string;
  distance: string;
  equipmentAvailable: number;
  matchScore: number;
  reason: string;
};

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [enabled, setEnabledState] = useState(() =>
    getAiRecommendationsEnabled(),
  );
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [appliedEquipmentQ, setAppliedEquipmentQ] = useState("");
  const [refPos, setRefPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoResolved, setGeoResolved] = useState(false);

  const load = useCallback(async () => {
    if (!getAiRecommendationsEnabled()) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (refPos) {
        params.set("latitude", String(refPos.lat));
        params.set("longitude", String(refPos.lng));
      }
      params.set("radius", "75");
      const q = appliedEquipmentQ.trim();
      if (q) params.set("q", q);
      const path = `/api/recommendations?${params.toString()}`;
      const data = await apiFetch(path);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message || "Failed to load recommendations");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [refPos, appliedEquipmentQ]);

  useEffect(() => {
    const sync = () => setEnabledState(getAiRecommendationsEnabled());
    window.addEventListener("storage", sync);
    window.addEventListener("medbridge-prefs", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("medbridge-prefs", sync);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoResolved(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRefPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoResolved(true);
      },
      () => setGeoResolved(true),
      { maximumAge: 120_000, timeout: 10_000 },
    );
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedEquipmentQ(equipmentInput.trim());
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setItems([]);
      return;
    }
    if (!geoResolved) return;
    load();
  }, [enabled, geoResolved, appliedEquipmentQ, load]);

  return (
    <div>
      <PageHeader title="AI Recommendations" description="Smart referral suggestions based on distance, linked equipment data, and site type">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> Smart ranking
        </Badge>
      </PageHeader>

      {!enabled && (
        <Card className="mb-4 border-muted">
          <CardContent className="py-4 text-sm text-muted-foreground">
            Suggestions are turned off in{" "}
            <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
              Settings
            </Link>
            . Enable &quot;AI Recommendations&quot; to load ranked facilities.
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={onSearchSubmit}
        className="mb-4 flex flex-col sm:flex-row gap-2 max-w-xl"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by equipment keyword (e.g. MRI)"
            className="pl-9"
            value={equipmentInput}
            onChange={(e) => setEquipmentInput(e.target.value)}
            disabled={!enabled}
          />
        </div>
        <Button type="submit" disabled={!enabled || loading}>
          Apply
        </Button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading recommendations…
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-destructive py-4">{error}</p>
      )}

      {!loading && enabled && !error && items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No directory facilities matched. Keyword search uses equipment names
          (for example &quot;MRI Scanner&quot;) on the Equipment page, linked to
          a facility that has latitude and longitude. Clear the keyword to list
          nearby hospitals and labs instead, or add matching equipment in the
          app.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((rec) => (
          <Card
            key={rec.id}
            className="transition-all hover:shadow-lg hover:border-accent/40 flex flex-col"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base leading-tight">
                  {rec.hospital}
                </CardTitle>
                <Badge className="bg-accent text-accent-foreground shrink-0">
                  {rec.matchScore}%
                </Badge>
              </div>
              {rec.facilityType && (
                <p className="text-xs text-muted-foreground capitalize pt-1">
                  {rec.facilityType}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {rec.distance}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                  {rec.equipmentAvailable} available
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <BrainCircuit className="h-3 w-3" /> Why ranked
                </p>
                <p className="text-sm">{rec.reason}</p>
              </div>

              <Button
                className="w-full gap-2 mt-auto"
                type="button"
                onClick={() =>
                  navigate("/requests/new", {
                    state: { recommendedFacilityName: rec.hospital },
                  })
                }
              >
                Refer Patient <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
