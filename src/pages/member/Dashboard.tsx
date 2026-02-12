import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { useEnrollments } from "@/hooks/useEnrollments";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { usePublicAnnouncements } from "@/hooks/useAnnouncements";
import { BookOpen, Bell, Library, ArrowRight, Crown, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function MemberDashboard() {
  const { email, accessType, hasProAccess, hasBasicAccess } = useCourseAccess();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(email);
  const { data: courses, isLoading: coursesLoading } = usePublicCourses();
  const { data: announcements, isLoading: announcementsLoading } = usePublicAnnouncements();

  const enrolledCourses = courses?.filter((course) =>
    enrollments?.some((e) => e.course_id === course.id)
  );

  const latestAnnouncements = announcements?.slice(0, 3);

  const getAccessLabel = () => {
    if (hasProAccess) return "PRO";
    if (hasBasicAccess) return "Basic";
    return accessType?.charAt(0).toUpperCase() + (accessType?.slice(1) || "");
  };

  const getAccessIcon = () => {
    if (hasProAccess) return <Crown className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Selamat Datang! 👋
        </h1>
        <p className="text-muted-foreground">
          Anda masuk sebagai member <Badge variant="secondary" className="ml-1 gap-1">{getAccessIcon()} {getAccessLabel()}</Badge>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Course Saya
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {enrollmentsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{enrolledCourses?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Course Tersedia
            </CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{courses?.length || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengumuman Baru
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{announcements?.length || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Courses Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course Saya</CardTitle>
            <CardDescription>Course yang sedang Anda pelajari</CardDescription>
          </div>
          <Link to="/member/my-courses">
            <Button variant="ghost" size="sm" className="gap-1">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {enrollmentsLoading || coursesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{course.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {course.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada course yang diambil</p>
              <Link to="/member/all-courses">
                <Button variant="link" className="mt-2">
                  Jelajahi Course
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pengumuman Terbaru</CardTitle>
            <CardDescription>Informasi dan update terbaru</CardDescription>
          </div>
          <Link to="/member/announcements">
            <Button variant="ghost" size="sm" className="gap-1">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {announcementsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : latestAnnouncements && latestAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {latestAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{announcement.title}</h4>
                    {announcement.published_at && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(announcement.published_at), "d MMM yyyy", { locale: id })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada pengumuman</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
