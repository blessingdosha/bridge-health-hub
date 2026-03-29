import { useState } from "react";
import { Search, Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { hospitals } from "@/data/mockData";

const Facilities = () => {
  const [search, setSearch] = useState("");
  const filtered = hospitals.filter(
    (h) => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Facilities" description="Manage hospitals and laboratories in the network">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Add Facility</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Facility</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Facility Name</Label>
                <Input placeholder="Enter facility name" />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input placeholder="Enter address" />
              </div>
              <div className="grid gap-2">
                <Label>Contact Number</Label>
                <Input placeholder="+234..." />
              </div>
              <Button>Save Facility</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search facilities..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No facilities found" description="Try adjusting your search or add a new facility." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead className="hidden lg:table-cell">Contact</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((facility) => (
                  <TableRow key={facility.id}>
                    <TableCell className="font-medium">{facility.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{facility.address}</TableCell>
                    <TableCell className="hidden lg:table-cell">{facility.contact}</TableCell>
                    <TableCell>{facility.distance}</TableCell>
                    <TableCell>
                      <Badge variant={facility.type === "hospital" ? "default" : "secondary"}>
                        {facility.type === "hospital" ? "Hospital" : "Lab"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Facilities;
