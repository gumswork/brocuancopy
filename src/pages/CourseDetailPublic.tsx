import { Link, useParams, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CourseLayout } from "@/components/public/CourseLayout";
import { usePublicCourse, usePublicModulesWithMaterials } from "@/hooks/usePublicCourses";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { BookOpen, ArrowRight, Layers, Loader2, Lock, Globe, Users, Crown } from "lucide-react";
import { CourseAccessLevel } from "@/types/course";

const ACCESS_LEVEL_CONFIG: Record<CourseAccessLevel, { 
  label: string; 
  icon: React.ReactNode;
  message: string;
}> = {
  public: { 
    label: 'Publik', 
    icon: <Globe className="h-4 w-4" />,
    message: 'Course ini dapat diakses oleh semua orang'
  },
  basic: { 
    label: 'Basic Member', 
    icon: <Users className="h-4 w-4" />,
    message: 'Anda perlu menjadi member Basic atau PRO untuk mengakses course ini'
  },
  pro: { 
    label: 'PRO Member', 
    icon: <Crown className="h-4 w-4" />,
    message: 'Anda perlu menjadi member PRO untuk mengakses course ini'
  },
};

export default function CourseDetailPublic() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { canAccessCourse, isLoading: accessLoading } = useCourseAccess();
  const { data: course, isLoading: courseLoading } = usePublicCourse(courseId);
  const { data: modulesWithMaterials, isLoading: modulesLoading } = usePublicModulesWithMaterials(courseId);

  const isLoading = courseLoading || modulesLoading;
  const accessLevel = course?.access_level || 'pro';
  const hasAccess = canAccessCourse(accessLevel);

  // Show loading while checking access
  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check access based on course's access_level
  if (!isLoading && course && !hasAccess) {
    const config = ACCESS_LEVEL_CONFIG[accessLevel];
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <Badge className="mb-4 gap-1">
            {config.icon}
            {config.label}
          </Badge>
          <h1 className="text-2xl font-bold mb-4">Akses Dibatasi</h1>
          <p className="text-muted-foreground mb-6">
            {config.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/courses/login" state={{ from: location.pathname }}>
              <Button className="w-full sm:w-auto gap-2">
                <Crown className="h-4 w-4" />
                Login Member
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" className="w-full sm:w-auto">
                Kembali ke Daftar Course
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">
            Course yang Anda cari tidak tersedia atau belum dipublish.
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
      pageTitle={course?.title}
      isLoading={isLoading}
    >
      <div className="p-6 md:p-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Thumbnail */}
            <div className="lg:w-1/3">
              {isLoading ? (
                <Skeleton className="aspect-video w-full rounded-lg" />
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {course?.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                      <BookOpen className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="lg:w-2/3">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {course?.title}
                    </h1>
                    {course?.access_level && (
                      <Badge variant="outline" className="gap-1">
                        {ACCESS_LEVEL_CONFIG[course.access_level]?.icon}
                        {ACCESS_LEVEL_CONFIG[course.access_level]?.label}
                      </Badge>
                    )}
                  </div>
                  {course?.description && (
                    <p className="text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Daftar Modul
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : modulesWithMaterials && modulesWithMaterials.length > 0 ? (
            <div className="space-y-3">
              {modulesWithMaterials.map((module, index) => (
                <Card
                  key={module.id}
                  className="group p-4 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-purple"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          {module.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {module.materials?.length || 0} materi
                      </p>
                    </div>
                    <Link to={`/courses/${courseId}/modules/${module.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2 group-hover:text-primary">
                        Lihat
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-muted mb-3">
                <Layers className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Belum Ada Modul</h3>
              <p className="text-muted-foreground text-sm">
                Modul untuk course ini sedang dalam proses pembuatan.
              </p>
            </div>
          )}
        </div>
      </div>
    </CourseLayout>
  );
}
