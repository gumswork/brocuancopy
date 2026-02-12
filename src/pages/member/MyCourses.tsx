import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { useEnrollments } from "@/hooks/useEnrollments";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { BookOpen, ArrowRight, Library, Crown, Lock, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Course } from "@/types/course";

export default function MyCourses() {
  const { email, canAccessCourse } = useCourseAccess();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(email);
  const { data: courses, isLoading: coursesLoading } = usePublicCourses();

  const isLoading = enrollmentsLoading || coursesLoading;

  // Get enrolled courses with enrollment date
  const enrolledCourses = courses
    ?.filter((course) => enrollments?.some((e) => e.course_id === course.id))
    .map((course) => {
      const enrollment = enrollments?.find((e) => e.course_id === course.id);
      return {
        ...course,
        enrolledAt: enrollment?.enrolled_at || null,
      };
    })
    .sort((a, b) => {
      if (!a.enrolledAt || !b.enrolledAt) return 0;
      return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
    });

  const getAccessBadge = (course: Course) => {
    if (course.access_level === "public") {
      return <Badge variant="secondary">Publik</Badge>;
    }
    if (course.access_level === "basic") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          Basic
        </Badge>
      );
    }
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
        <Crown className="h-3 w-3" />
        PRO
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Courses</h1>
        <p className="text-muted-foreground">
          Course yang sedang Anda pelajari
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : enrolledCourses && enrolledCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => {
            const hasAccess = canAccessCourse(course.access_level);
            
            return (
              <Card key={course.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    {getAccessBadge(course)}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {course.description || "Tidak ada deskripsi"}
                  </CardDescription>
                  {course.enrolledAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Diambil: {format(new Date(course.enrolledAt), "d MMMM yyyy", { locale: id })}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {hasAccess ? (
                    <Link to={`/courses/${course.id}`}>
                      <Button className="w-full gap-2">
                        Lanjutkan Belajar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full gap-2">
                      <Lock className="h-4 w-4" />
                      Akses Terkunci
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
              <Library className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Belum Ada Course</h2>
            <p className="text-muted-foreground mb-4">
              Anda belum mengambil course apapun. Jelajahi course yang tersedia.
            </p>
            <Link to="/member/all-courses">
              <Button className="gap-2">
                <Library className="h-4 w-4" />
                Jelajahi Course
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
