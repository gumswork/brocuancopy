import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { useUnreadAnnouncementCount } from "@/hooks/useAnnouncements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Bell,
  LogOut,
  Crown,
  Users,
  ArrowLeft,
  Menu,
  User,
  Globe,
} from "lucide-react";

interface MemberLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: "Dashboard", url: "/member", icon: LayoutDashboard },
  { title: "My Courses", url: "/member/my-courses", icon: BookOpen },
  { title: "All Courses", url: "/member/all-courses", icon: Library },
  { title: "Pengumuman", url: "/member/announcements", icon: Bell, hasBadge: true },
  { title: "Profil", url: "/member/profile", icon: User },
];

export function MemberLayout({ children }: MemberLayoutProps) {
  const { email, accessType, logout, hasProAccess, hasBasicAccess } = useCourseAccess();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadAnnouncementCount(email);

  const extraItems = [] as Array<{ title: string; url: string; icon: any }>;
  if (hasProAccess) {
    extraItems.push(
      { title: "Tools PRO", url: "/member/tools-pro", icon: Globe },
      { title: "Komunitas PRO", url: "/member/komunitas-pro", icon: Users },
    );
  }
  if (hasBasicAccess) {
    extraItems.push(
      { title: "Tools Basic", url: "/member/tools-basic", icon: Globe },
      { title: "Komunitas Basic", url: "/member/komunitas-basic", icon: Users },
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/courses/login");
  };

  const getAccessBadge = () => {
    if (hasProAccess) {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
          <Crown className="h-3 w-3" />
          PRO
        </Badge>
      );
    }
    if (hasBasicAccess) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          Basic
        </Badge>
      );
    }
    if (accessType) {
      return (
        <Badge variant="secondary" className="gap-1">
          {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
        </Badge>
      );
    }
    return null;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarContent className="bg-card">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>
              <h2 className="mt-3 text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                Member Area
              </h2>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                {getAccessBadge()}
              </div>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>

            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/member"}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.hasBadge && unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium px-1.5">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {extraItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Logout */}
            <div className="mt-auto p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-10 flex items-center gap-4 p-4 bg-background border-b border-border">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <span className="font-semibold">Member Area</span>
            {getAccessBadge()}
          </header>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
