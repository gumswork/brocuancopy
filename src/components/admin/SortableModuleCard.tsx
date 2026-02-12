import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Module } from '@/types/course';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronRight, GripVertical } from 'lucide-react';

interface SortableModuleCardProps {
  module: Module;
  index: number;
  onEdit: (module: Module, e: React.MouseEvent) => void;
  onDelete: (module: Module, e: React.MouseEvent) => void;
  onClick: (module: Module) => void;
}

export function SortableModuleCard({ 
  module, 
  index,
  onEdit, 
  onDelete,
  onClick 
}: SortableModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`cursor-pointer hover:shadow-md transition-shadow ${isDragging ? 'z-50' : ''}`}
      onClick={() => onClick(module)}
    >
      <CardContent className="flex items-center p-4">
        <button
          className="mr-3 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
          <span className="font-semibold text-primary">{index + 1}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{module.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {module.description || 'Tidak ada deskripsi'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => onEdit(module, e)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => onDelete(module, e)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}