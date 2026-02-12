import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Eye,
  EyeOff 
} from 'lucide-react';
import { HomepageSection } from '@/types/homepage';
import { cn } from '@/lib/utils';

interface SortableSectionCardProps {
  section: HomepageSection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: (visible: boolean) => void;
  onAddElement: () => void;
  children?: React.ReactNode;
}

export function SortableSectionCard({
  section,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleVisibility,
  onAddElement,
  children,
}: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'border bg-card transition-shadow',
        isDragging && 'shadow-lg opacity-90',
        !section.is_visible && 'opacity-60'
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-muted p-1 rounded touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{section.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {section.background}
              </span>
            </div>
            {section.title && (
              <p className="text-sm text-muted-foreground truncate">{section.title}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleVisibility(!section.is_visible)}
              title={section.is_visible ? 'Hide section' : 'Show section'}
            >
              {section.is_visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Elements</span>
            <Button variant="outline" size="sm" onClick={onAddElement}>
              <Plus className="h-4 w-4 mr-1" /> Add Element
            </Button>
          </div>
          {children}
        </div>
      )}
    </Card>
  );
}
