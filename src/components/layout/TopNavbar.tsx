import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (
    (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  );
}

export function TopNavbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/equipment?q=${encodeURIComponent(q)}`);
  };

  const displayName = user?.name?.trim() || "User";
  const initials = initialsFromName(displayName);

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger />
        <form
          onSubmit={onSearch}
          className="relative hidden sm:block min-w-0"
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search hospitals, equipment..."
            className="pl-9 w-64 lg:w-80 h-9 bg-muted/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search equipment"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="relative" type="button">
          <Bell className="h-5 w-5" />
        </Button>
        <Link to="/profile" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
