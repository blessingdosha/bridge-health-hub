import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

const Equipment = () => {
  const [search, setSearch] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newFacility, setNewFacility] = useState("");
  const [newAvailability, setNewAvailability] = useState("available");
  const [facilities, setFacilities] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/equipment/available");
        setEquipment(data);
      } catch (err) {
        setError((err as Error).message || "Failed to load equipment");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
    // Fetch facilities for dropdown
    const fetchFacilities = async () => {
      try {
        const data = await apiFetch("/api/facilities");
        setFacilities(data);
      } catch {}
    };
    fetchFacilities();
  }, []);

  const filtered = equipment.filter(
    (e: any) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.hospital_name?.toLowerCase?.() || "").includes(search.toLowerCase()),
  );

  const handleAddEquipment = async () => {
    if (!newName.trim() || !newType.trim() || !newFacility || !newAvailability)
      return;
    setAdding(true);
    try {
      await apiFetch("/api/equipment/", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          type: newType.trim(),
          facility_id: newFacility,
          availability: newAvailability === "available",
        }),
      });
      // Refresh list
      const data = await apiFetch("/api/equipment/available");
      setEquipment(data);
      setAddDialogOpen(false);
      setNewName("");
      setNewType("");
      setNewFacility("");
      setNewAvailability("available");
    } catch (err) {
      alert((err as Error).message || "Failed to add equipment");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="Manage medical equipment across facilities"
      >
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Equipment Name</Label>
                <Input
                  placeholder="e.g. MRI Scanner"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Equipment Type</Label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">Select type</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Cardiac">Cardiac</option>
                  <option value="IV">IV</option>
                  <option value="Surgical">Surgical</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Facility</Label>
                <select
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">Select facility</option>
                  {facilities.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Availability</Label>
                <select
                  value={newAvailability}
                  onChange={(e) => setNewAvailability(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Not Available</option>
                </select>
              </div>
              <Button onClick={handleAddEquipment} disabled={adding}>
                {adding ? "Saving..." : "Save Equipment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading equipment...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Hospital
                  </TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.facility_name || "N/A"}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          typeof item.availability === "boolean"
                            ? item.availability
                              ? "available"
                              : "unavailable"
                            : item.status || "available"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Equipment;
