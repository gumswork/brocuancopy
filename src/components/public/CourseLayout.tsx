import { ReactNode } from "react";
import { Menu } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CourseSidebar } from "./CourseSidebar";
import type { Course, ModuleWithMaterials } from "@/types/course";

interface CourseLayoutProps {
  children: ReactNode;
  course: Course | null | undefined;
  modulesWithMaterials: ModuleWithMaterials[] | undefined;
  activeModuleId?: string;
  pageTitle?: string;
  isLoading?: boolean;
}

export function CourseLayout({
  children,
  course,
  modulesWithMaterials,
  activeModuleId,
  pageTitle,
  isLoading,
}: CourseLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <CourseSidebar
          course={course}
          modulesWithMaterials={modulesWithMaterials}
          activeModuleId={activeModuleId}
          isLoading={isLoading}
        />
        <SidebarInset>
          {/* Header with trigger */}
          <header className="sticky top-0 z-10 h-14 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </SidebarTrigger>
            {pageTitle && (
              <span className="font-medium text-sm truncate">{pageTitle}</span>
            )}
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
