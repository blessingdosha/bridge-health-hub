import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function TopNavbar() {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals, equipment..."
            className="pl-9 w-64 lg:w-80 h-9 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
            DA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
