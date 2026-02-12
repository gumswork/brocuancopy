import { Link, useParams, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseLayout } from "@/components/public/CourseLayout";
import { MaterialRenderer } from "@/components/MaterialRenderer";
import {
  usePublicCourse,
  usePublicModule,
  usePublicMaterials,
  usePublicModulesWithMaterials,
} from "@/hooks/usePublicCourses";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { FileText, Loader2, Lock } from "lucide-react";

export default function ModuleDetailPublic() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const location = useLocation();
  const { canAccessCourse, accessType, isLoading: accessLoading } = useCourseAccess();
  const { data: course, isLoading: courseLoading } = usePublicCourse(courseId);
  const { data: module, isLoading: moduleLoading } = usePublicModule(moduleId);
  const { data: materials, isLoading: materialsLoading } = usePublicMaterials(moduleId);
  const { data: modulesWithMaterials, isLoading: modulesWithMaterialsLoading } = usePublicModulesWithMaterials(courseId);

  const isLoading = courseLoading || moduleLoading || materialsLoading || modulesWithMaterialsLoading;

  // Check access while loading
  if (accessLoading || courseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user can access this course based on course access level
  const courseAccessLevel = course?.access_level || 'pro';
  const hasAccess = canAccessCourse(courseAccessLevel);

  // If no access, redirect to login or show access denied
  if (!hasAccess) {
    // If not logged in at all, redirect to login
    if (!accessType) {
      return <Navigate to="/courses/login" state={{ from: location.pathname }} replace />;
    }
    
    // If logged in but insufficient access level, show access denied
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-destructive/10 mb-4">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Akses Terbatas</h1>
          <p className="text-muted-foreground mb-6">
            Course ini memerlukan akses {courseAccessLevel === 'pro' ? 'PRO' : 'BASIC'}. 
            Akun Anda saat ini memiliki akses {accessType?.toUpperCase()}.
          </p>
          <Link to="/courses">
            <Button>Kembali ke Daftar Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoading && (!course || !module)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Modul Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">
            Modul yang Anda cari tidak tersedia atau course belum dipublish.
          </p>
          <Link to="/courses">
            <Button>Kembali ke Daftar Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CourseLayout
      course={course}
      modulesWithMaterials={modulesWithMaterials}
      activeModuleId={moduleId}
      pageTitle={module?.title}
      isLoading={isLoading}
    >
      <div className="p-6 md:p-8">
        {/* Module Header */}
        <div className="mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                {module?.title}
              </h1>
              {module?.description && (
                <p className="text-muted-foreground max-w-2xl">{module.description}</p>
              )}
            </>
          )}
        </div>

        {/* Materials */}
        <div className="max-w-4xl">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : materials && materials.length > 0 ? (
            <div className="space-y-6">
              {materials.map((material) => (
                <MaterialRenderer key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-muted mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Belum Ada Materi</h3>
              <p className="text-muted-foreground text-sm">
                Materi untuk modul ini sedang dalam proses pembuatan.
              </p>
            </div>
          )}
        </div>
      </div>
    </CourseLayout>
  );
}
