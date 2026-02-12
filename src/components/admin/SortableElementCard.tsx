import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Type,
  AlignLeft,
  MousePointer,
  CreditCard,
  Video,
  LayoutGrid,
} from 'lucide-react';
import { HomepageElement, elementTypeLabels, ElementType } from '@/types/homepage';
import { cn } from '@/lib/utils';

const typeIcons: Record<ElementType, React.ElementType> = {
  heading: Type,
  paragraph: AlignLeft,
  button: MousePointer,
  card: CreditCard,
  video: Video,
  card_group: LayoutGrid,
};

interface SortableElementCardProps {
  element: HomepageElement;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: (visible: boolean) => void;
}

export function SortableElementCard({
  element,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableElementCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = typeIcons[element.type] || Type;
  const content = element.content as Record<string, unknown>;
  const displayText = (content.text as string) || (content.title as string) || elementTypeLabels[element.type];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 bg-background border transition-shadow',
        isDragging && 'shadow-lg opacity-90',
        !element.is_visible && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-muted p-1 rounded touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="p-1.5 rounded bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {elementTypeLabels[element.type]}
            </span>
          </div>
          <p className="text-sm truncate">{displayText}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleVisibility(!element.is_visible)}
          >
            {element.is_visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
