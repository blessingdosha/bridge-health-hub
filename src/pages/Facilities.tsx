import { useState, useEffect } from "react";
import { Search, Plus, Eye } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetch } from "@/lib/api";

const Facilities = () => {
  const [search, setSearch] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newType, setNewType] = useState("hospital");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/facilities");
        setFacilities(data);
      } catch (err) {
        setError((err as Error).message || "Failed to load facilities");
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const filtered = facilities.filter(
    (h: any) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.address?.toLowerCase?.() || "").includes(search.toLowerCase()),
  );

  const handleAddFacility = async () => {
    if (!newName.trim() || !newAddress.trim() || !newContact.trim()) return;
    setAdding(true);
    try {
      await apiFetch("/api/facilities", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          address: newAddress.trim(),
          contact_phone: newContact.trim(),
          facility_type: newType === "hospital" ? "hospital" : "laboratory",
        }),
      });
      // Refresh list
      const data = await apiFetch("/api/facilities");
      setFacilities(data);
      setAddDialogOpen(false);
      setNewName("");
      setNewAddress("");
      setNewContact("");
      setNewType("hospital");
    } catch (err) {
      alert((err as Error).message || "Failed to add facility");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Manage hospitals and laboratories in the network"
      >
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Facility</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Facility Name</Label>
                <Input
                  placeholder="Enter facility name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  placeholder="Enter address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Contact Number</Label>
                <Input
                  placeholder="+234..."
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="border rounded px-2 py-1"
                  aria-label="Facility Type"
                  title="Facility Type"
                >
                  <option value="hospital">Hospital</option>
                  <option value="laboratory">Laboratory</option>
                </select>
              </div>
              <Button onClick={handleAddFacility} disabled={adding}>
                {adding ? "Saving..." : "Save Facility"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search facilities..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading facilities...
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
                title="No facilities found"
                description="Try adjusting your search or add a new facility."
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
                    <TableHead>Type</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((facility: any) => (
                    <TableRow key={facility.id}>
                      <TableCell className="font-medium">
                        {facility.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {facility.address}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {facility.contact_phone || facility.contact}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            facility.facility_type === "hospital" ||
                            facility.type === "hospital"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {facility.facility_type === "hospital" ||
                          facility.type === "hospital"
                            ? "Hospital"
                            : "Laboratory"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
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
