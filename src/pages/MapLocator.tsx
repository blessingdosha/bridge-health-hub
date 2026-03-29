import { MapPin, Navigation } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitals } from "@/data/mockData";

const MapLocator = () => {
  return (
    <div>
      <PageHeader title="Map Locator" description="Find nearby hospitals and laboratories" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 rounded-lg border bg-muted/30 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
          <div className="text-center z-10">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Interactive Map</p>
            <p className="text-sm text-muted-foreground">Google Maps integration ready</p>
          </div>
          {/* Decorative dots for map feel */}
          {hospitals.map((h, i) => (
            <div
              key={h.id}
              className="absolute h-4 w-4 bg-accent rounded-full animate-pulse shadow-lg"
              style={{
                top: `${20 + i * 12}%`,
                left: `${15 + i * 13}%`,
              }}
            />
          ))}
        </div>

        {/* Facility List */}
        <div className="space-y-3 overflow-y-auto">
          <p className="text-sm font-medium text-muted-foreground">Nearby Facilities</p>
          {hospitals.map((facility) => (
            <Card key={facility.id} className="cursor-pointer transition-all hover:shadow-md hover:border-accent/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{facility.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{facility.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px]">
                        <Navigation className="h-2.5 w-2.5 mr-1" /> {facility.distance}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {facility.equipment} equipment
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
