import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { useEnrollments, useEnrollCourse, useUnenrollCourse } from "@/hooks/useEnrollments";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { BookOpen, Plus, Check, Lock, Crown, Users, Search, X } from "lucide-react";
import type { Course } from "@/types/course";

export default function AllCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const { email, canAccessCourse } = useCourseAccess();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(email);
  const { data: courses, isLoading: coursesLoading } = usePublicCourses();
  const enrollMutation = useEnrollCourse();
  const unenrollMutation = useUnenrollCourse();

  const isLoading = enrollmentsLoading || coursesLoading;

  const filteredCourses = courses?.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const isEnrolled = (courseId: string) =>
    enrollments?.some((e) => e.course_id === courseId) ?? false;

  const handleEnroll = (courseId: string) => {
    if (!email) return;
    enrollMutation.mutate({ email, courseId });
  };

  const handleUnenroll = (courseId: string) => {
    if (!email) return;
    unenrollMutation.mutate({ email, courseId });
  };

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
        <h1 className="text-2xl font-bold mb-2">All Courses</h1>
        <p className="text-muted-foreground">
          Jelajahi semua course yang tersedia
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const hasAccess = canAccessCourse(course.access_level);
            const enrolled = isEnrolled(course.id);
            const isPending = 
              (enrollMutation.isPending && enrollMutation.variables?.courseId === course.id) ||
              (unenrollMutation.isPending && unenrollMutation.variables?.courseId === course.id);

            return (
              <Card key={course.id} className="overflow-hidden">
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
                      <div className="text-center text-white">
                        <Lock className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Butuh Paket {course.access_level === "pro" ? "PRO" : "Basic"}</p>
                      </div>
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
                </CardHeader>
                <CardContent className="space-y-2">
                  {hasAccess ? (
                    <>
                      {enrolled ? (
                        <div className="flex gap-2">
                          <Link to={`/courses/${course.id}`} className="flex-1">
                            <Button className="w-full">Buka Course</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUnenroll(course.id)}
                            disabled={isPending}
                            title="Batalkan"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleEnroll(course.id)}
                          disabled={isPending}
                        >
                          <Plus className="h-4 w-4" />
                          Ambil Course
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button disabled className="w-full gap-2">
                      <Lock className="h-4 w-4" />
                      Tidak Tersedia untuk Paket Anda
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
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? "Tidak Ditemukan" : "Belum Ada Course"}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? `Tidak ada course yang cocok dengan "${searchQuery}"`
                : "Course akan segera tersedia. Silakan kunjungi kembali nanti."}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
