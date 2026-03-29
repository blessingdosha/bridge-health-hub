import { BrainCircuit, MapPin, Stethoscope, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recommendations } from "@/data/mockData";

const AIRecommendations = () => {
  return (
    <div>
      <PageHeader title="AI Recommendations" description="Smart referral suggestions powered by AI analysis">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> AI Powered
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="transition-all hover:shadow-lg hover:border-accent/40 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{rec.hospital}</CardTitle>
                <Badge className="bg-accent text-accent-foreground">{rec.matchScore}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {rec.distance}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" /> {rec.equipmentAvailable} available
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <BrainCircuit className="h-3 w-3" /> Why recommended
                </p>
                <p className="text-sm">{rec.reason}</p>
              </div>

              <Button className="w-full gap-2 mt-auto">
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
