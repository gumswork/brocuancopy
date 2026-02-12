import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Play, FileText, ExternalLink, Layers, BookOpen, ArrowLeft, Crown, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import type { Course, ModuleWithMaterials, Material } from "@/types/course";

interface CourseSidebarProps {
  course: Course | null | undefined;
  modulesWithMaterials: ModuleWithMaterials[] | undefined;
  activeModuleId?: string;
  isLoading?: boolean;
}

function getMaterialIcon(material: Material) {
  if (material.media_url) return Play;
  if (material.button_url) return ExternalLink;
  return FileText;
}

export function CourseSidebar({
  course,
  modulesWithMaterials,
  activeModuleId,
  isLoading,
}: CourseSidebarProps) {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const { email, hasProAccess, logout } = useCourseAccess();
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  // Auto-expand active module
  useEffect(() => {
    if (activeModuleId) {
      setOpenModules((prev) => new Set([...prev, activeModuleId]));
    }
  }, [activeModuleId]);

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when navigating
    setOpenMobile(false);
  };

  const handleMaterialClick = (materialId: string) => {
    // Close mobile sidebar when navigating
    setOpenMobile(false);
    
    // Scroll to material after a short delay for navigation to complete
    setTimeout(() => {
      const element = document.getElementById(`material-${materialId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const isModuleActive = (moduleId: string) => {
    return location.pathname.includes(`/modules/${moduleId}`);
  };

  return (
    <Sidebar className="border-r border-border">
      {/* Header */}
      <SidebarHeader className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ) : course ? (
          <Link
            to={`/courses/${course.id}`}
            onClick={handleLinkClick}
            className="flex items-center gap-3 group"
          >
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 shrink-0">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                  <BookOpen className="h-5 w-5 text-white/70" />
                </div>
              )}
            </div>
            <span className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </span>
          </Link>
        ) : null}
      </SidebarHeader>

      <SidebarSeparator />

      {/* Content */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : modulesWithMaterials && modulesWithMaterials.length > 0 ? (
              <SidebarMenu>
                {modulesWithMaterials.map((module, index) => (
                  <SidebarMenuItem key={module.id}>
                    <Collapsible
                      open={openModules.has(module.id)}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between",
                            isModuleActive(module.id) && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="truncate">{module.title}</span>
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                              openModules.has(module.id) && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="ml-8 mt-1 space-y-1 border-l border-border pl-3">
                          {module.materials && module.materials.length > 0 ? (
                            module.materials.map((material) => {
                              const Icon = getMaterialIcon(material);
                              return (
                                <Link
                                  key={material.id}
                                  to={`/courses/${course?.id}/modules/${module.id}`}
                                  onClick={() => handleMaterialClick(material.id)}
                                  className={cn(
                                    "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors",
                                    activeModuleId === module.id && "text-primary font-medium"
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{material.title}</span>
                                </Link>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground italic px-2 py-1">
                              Belum ada materi
                            </span>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="py-8 text-center">
                <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada modul</p>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        
        {/* User Info */}
        {hasProAccess && email && (
          <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mb-2">{email}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="w-full gap-1 h-8 text-xs"
            >
              <LogOut className="h-3 w-3" />
              Keluar
            </Button>
          </div>
        )}
        
        <Link
          to="/courses"
          onClick={handleLinkClick}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Course
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
