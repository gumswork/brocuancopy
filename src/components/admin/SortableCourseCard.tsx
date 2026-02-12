import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Course, CourseAccessLevel } from '@/types/course';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff, BookOpen, GripVertical, Globe, Users, Crown } from 'lucide-react';

const ACCESS_LEVEL_CONFIG: Record<CourseAccessLevel, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'outline' }> = {
  public: { label: 'Publik', icon: <Globe className="h-3 w-3" />, variant: 'outline' },
  basic: { label: 'Basic', icon: <Users className="h-3 w-3" />, variant: 'secondary' },
  pro: { label: 'PRO', icon: <Crown className="h-3 w-3" />, variant: 'default' },
};

interface SortableCourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onTogglePublish: (course: Course) => void;
  onClick: (course: Course) => void;
}

export function SortableCourseCard({ 
  course, 
  onEdit, 
  onDelete, 
  onTogglePublish,
  onClick 
}: SortableCourseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`overflow-hidden ${isDragging ? 'z-50' : ''}`}
    >
      <div 
        className="aspect-video bg-muted relative cursor-pointer"
        onClick={() => onClick(course)}
      >
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant={course.is_published ? 'default' : 'secondary'}>
            {course.is_published ? 'Published' : 'Draft'}
          </Badge>
          {course.access_level && (
            <Badge variant={ACCESS_LEVEL_CONFIG[course.access_level]?.variant || 'outline'} className="flex items-center gap-1">
              {ACCESS_LEVEL_CONFIG[course.access_level]?.icon}
              {ACCESS_LEVEL_CONFIG[course.access_level]?.label}
            </Badge>
          )}
        </div>
        <button
          className="absolute top-2 left-2 p-1.5 bg-background/80 rounded cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 
          className="font-semibold mb-2 line-clamp-1 cursor-pointer hover:text-primary transition-colors"
          onClick={() => onClick(course)}
        >
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.description || 'Tidak ada deskripsi'}
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublish(course);
            }}
          >
            {course.is_published ? (
              <><EyeOff className="h-4 w-4 mr-1" /> Unpublish</>
            ) : (
              <><Eye className="h-4 w-4 mr-1" /> Publish</>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}