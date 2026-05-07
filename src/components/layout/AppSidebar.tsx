import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  ClipboardList,
  MapPin,
  BrainCircuit,
  UserCircle,
  Settings,
  Heart,
  Users,
  Shield,
  FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Hospitals", url: "/facilities", icon: Building2 },
  { title: "Equipment", url: "/equipment", icon: Stethoscope },
  { title: "Requests", url: "/requests", icon: ClipboardList },
  { title: "Map Locator", url: "/map", icon: MapPin },
  { title: "AI Recommendations", url: "/ai", icon: BrainCircuit },
  { title: "Patients", url: "/patients", icon: FileText },
];

const bottomItems = [
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();

  const roleItems: { title: string; url: string; icon: typeof LayoutDashboard }[] = [];
  if (user?.role === "hospital_admin") {
    roleItems.push({ title: "Team", url: "/team", icon: Users });
  }
  if (user?.role === "super_admin") {
    roleItems.push({ title: "Admin", url: "/admin", icon: Shield });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-sidebar-primary-foreground fill-sidebar-primary" />
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
              MedBridge
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...mainItems, ...roleItems].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/60"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="hover:bg-sidebar-accent/60"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
