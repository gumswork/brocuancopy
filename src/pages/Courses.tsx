import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/CourseCard";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { BookOpen, ArrowLeft, Crown, Users, LogOut } from "lucide-react";

export default function Courses() {
  const { data: courses, isLoading } = usePublicCourses();
  const { hasProAccess, hasBasicAccess, accessType, email, logout } = useCourseAccess();

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
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
          <Users className="h-3 w-3" />
          Basic
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" className="gap-2 hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            
            {/* Access Status */}
            {email && accessType ? (
              <div className="flex items-center gap-3">
                {getAccessBadge()}
                <span className="text-sm text-muted-foreground">{email}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </div>
            ) : (
              <Link to="/courses/login">
                <Button variant="outline" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Masuk Member
                </Button>
              </Link>
            )}
          </div>
          
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                E-Course
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Pelajari berbagai materi untuk meningkatkan skill Anda. 
              {!email && " Login untuk mengakses course eksklusif."}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Belum Ada Course</h2>
            <p className="text-muted-foreground">
              Course akan segera tersedia. Silakan kunjungi kembali nanti.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
