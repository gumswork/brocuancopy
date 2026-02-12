import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Globe, Users, Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course, CourseAccessLevel } from "@/types/course";
import { useCourseAccess } from "@/contexts/CourseAccessContext";

interface CourseCardProps {
  course: Course;
}

const ACCESS_LEVEL_CONFIG: Record<CourseAccessLevel, { 
  label: string; 
  icon: React.ReactNode; 
  className: string;
}> = {
  public: { 
    label: 'Publik', 
    icon: <Globe className="h-3 w-3" />, 
    className: 'bg-green-500/10 text-green-500 border-green-500/20' 
  },
  basic: { 
    label: 'Basic', 
    icon: <Users className="h-3 w-3" />, 
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
  },
  pro: { 
    label: 'PRO', 
    icon: <Crown className="h-3 w-3" />, 
    className: 'bg-primary/10 text-primary border-primary/20' 
  },
};

export function CourseCard({ course }: CourseCardProps) {
  const { canAccessCourse } = useCourseAccess();
  const accessLevel = course.access_level || 'pro';
  const hasAccess = canAccessCourse(accessLevel);
  const config = ACCESS_LEVEL_CONFIG[accessLevel];

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-purple">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
            <BookOpen className="h-12 w-12 text-primary/50" />
          </div>
        )}
        
        {/* Access Level Badge */}
        <Badge 
          variant="outline" 
          className={`absolute top-3 right-3 gap-1 ${config.className}`}
        >
          {config.icon}
          {config.label}
        </Badge>

        {/* Lock overlay for restricted courses */}
        {!hasAccess && accessLevel !== 'public' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {accessLevel === 'pro' ? 'Khusus Member PRO' : 'Khusus Member'}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
        )}
        {hasAccess ? (
          <Link to={`/courses/${course.id}`}>
            <Button className="w-full gap-2 shadow-glow-purple hover:shadow-glow-blue transition-all">
              Lihat Materi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/courses/login">
            <Button variant="outline" className="w-full gap-2">
              <Lock className="h-4 w-4" />
              Login untuk Akses
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
