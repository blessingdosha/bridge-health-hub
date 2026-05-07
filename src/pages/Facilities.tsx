import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetch } from "@/lib/api";

const Facilities = () => {
  const [search, setSearch] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/hospitals");
        setHospitals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError((err as Error).message || "Failed to load hospitals");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filtered = hospitals.filter(
    (h: any) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.location?.toLowerCase?.() || "").includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Hospitals"
        description="Browse approved hospitals in the application network"
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading hospitals...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                title="No hospitals found"
                description="Try adjusting your search."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Address
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Contact
                    </TableHead>
                    <TableHead>State</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((hospital: any) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">
                        {hospital.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {hospital.location}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {hospital.contact_phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {hospital.state || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link to={`/hospitals/${hospital.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Facilities;
