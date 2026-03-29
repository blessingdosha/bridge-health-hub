import { useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hospitals, equipmentList } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const NewRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Request Submitted", description: "Your equipment request has been sent successfully." });
      navigate("/requests");
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Request Equipment" description="Submit a new equipment request to another facility" />

      <Card>
        <CardHeader>
          <CardTitle>Equipment Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label>Select Hospital</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Choose a hospital" /></SelectTrigger>
                <SelectContent>
                  {hospitals.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Select Equipment</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Choose equipment" /></SelectTrigger>
                <SelectContent>
                  {equipmentList.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input type="number" min={1} defaultValue={1} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : <><Send className="h-4 w-4" /> Submit Request</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequest;
