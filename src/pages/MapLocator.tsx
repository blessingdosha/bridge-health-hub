import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, LocateFixed, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { FacilityMap, type MapMarker } from "@/components/map/FacilityMap";

type ApiPlace = {
  id: number | string;
  name: string;
  location: string;
  facility_type: string;
  latitude: number | string;
  longitude: number | string;
  map_source?: string;
  distance?: number | string;
};

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 3959;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

const NEARBY_MI = 75;

const MapLocator = () => {
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [geoStatus, setGeoStatus] = useState<"idle" | "pending" | "denied">(
    "idle",
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const loadPlaces = useCallback(async (pos: [number, number] | null) => {
    setLoading(true);
    setError("");
    try {
      if (pos) {
        const [lat, lng] = pos;
        const rows = await apiFetch(
          `/api/hospitals/nearby?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&radius=${NEARBY_MI}`,
        );
        setPlaces(Array.isArray(rows) ? rows : []);
      } else {
        const rows = await apiFetch("/api/hospitals");
        setPlaces(Array.isArray(rows) ? rows : []);
      }
    } catch (e) {
      setError((e as Error).message || "Failed to load locations");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces(userPosition);
  }, [loadPlaces, userPosition]);

  const markers: MapMarker[] = useMemo(() => {
    return places
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        const source = p.map_source || p.facility_type || "site";
        const key = `${source}-${p.id}`;
        let distanceLabel: string | undefined;
        if (p.distance != null && p.distance !== "") {
          distanceLabel = `${Number(p.distance).toFixed(1)} mi`;
        } else if (userPosition) {
          distanceLabel = `${haversineMiles(userPosition[0], userPosition[1], lat, lng).toFixed(1)} mi`;
        }
        return {
          key,
          name: p.name,
          address: p.location || "",
          facilityType: p.facility_type || source,
          lat,
          lng,
          distanceLabel,
        };
      });
  }, [places, userPosition]);

  const sortedForList = useMemo(() => {
    const copy = [...markers];
    if (userPosition) {
      copy.sort((a, b) => {
        const da = haversineMiles(
          userPosition[0],
          userPosition[1],
          a.lat,
          a.lng,
        );
        const db = haversineMiles(
          userPosition[0],
          userPosition[1],
          b.lat,
          b.lng,
        );
        return da - db;
      });
    }
    return copy;
  }, [markers, userPosition]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserPosition(next);
        setGeoStatus("idle");
      },
      () => {
        setGeoStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <div>
      <PageHeader
        title="Map Locator"
        description="Approved hospitals in your network on an interactive map"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={userPosition ? "secondary" : "default"}
            size="sm"
            className="gap-1.5"
            onClick={requestLocation}
            disabled={geoStatus === "pending"}
          >
            {geoStatus === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            {userPosition ? "Update my location" : "Use my location"}
          </Button>
          {userPosition && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setUserPosition(null);
                setGeoStatus("idle");
              }}
            >
              Show all (no filter)
            </Button>
          )}
        </div>
      </PageHeader>

      {geoStatus === "denied" && (
        <p className="text-sm text-muted-foreground mb-3">
          Location access was blocked or unavailable. Showing all hospitals,
          centered on the default region. You can still browse the list.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)] min-h-[420px]">
        <div className="lg:col-span-2 min-h-[320px]">
          {loading ? (
            <div className="h-full min-h-[320px] rounded-lg border bg-muted/30 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading map data…
            </div>
          ) : error ? (
            <div className="h-full min-h-[320px] rounded-lg border border-destructive/40 bg-destructive/5 flex items-center justify-center text-sm text-destructive px-4 text-center">
              {error}
            </div>
          ) : (
            <FacilityMap
              markers={markers}
              userPosition={userPosition}
              className="h-full w-full min-h-[320px] rounded-lg overflow-hidden border"
            />
          )}
        </div>

        <div className="space-y-3 overflow-y-auto min-h-0">
          <p className="text-sm font-medium text-muted-foreground">
            {userPosition
              ? `Within ~${NEARBY_MI} mi of you`
              : "All mapped hospitals"}
          </p>
          {!loading && !error && sortedForList.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hospitals with coordinates found. Add latitude and longitude
                (or city/state) when registering hospitals.
              </CardContent>
            </Card>
          )}
          {sortedForList.map((facility) => (
            <Card
              key={facility.key}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-accent/40 ${
                selectedKey === facility.key ? "ring-2 ring-accent" : ""
              }`}
              onClick={() => setSelectedKey(facility.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{facility.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {facility.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {facility.distanceLabel && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Navigation className="h-2.5 w-2.5 mr-1" />
                          {facility.distanceLabel}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {facility.facilityType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapLocator;
