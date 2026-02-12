import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Material } from '@/types/course';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Video, FileText, MousePointer, GripVertical, Layers } from 'lucide-react';

interface SortableMaterialCardProps {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export function SortableMaterialCard({ material, onEdit, onDelete }: SortableMaterialCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Determine content types present
  const hasVideo = !!material.media_url;
  const hasText = !!material.content;
  const hasButton = !!material.button_url;
  const contentTypes: string[] = [];
  if (hasVideo) contentTypes.push('Video');
  if (hasText) contentTypes.push('Teks');
  if (hasButton) contentTypes.push('Tombol');

  // Build preview text
  const getPreviewText = () => {
    const parts: string[] = [];
    if (hasVideo) parts.push(`🎬 ${material.media_url}`);
    if (hasText) parts.push(`📝 ${material.content?.substring(0, 50)}...`);
    if (hasButton) parts.push(`🔗 ${material.button_text}`);
    return parts.join(' | ') || 'Tidak ada konten';
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <CardContent className="flex items-start p-4">
        <button
          className="mr-3 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
          {contentTypes.length > 1 ? (
            <Layers className="h-5 w-5 text-primary" />
          ) : hasVideo ? (
            <Video className="h-5 w-5 text-primary" />
          ) : hasButton ? (
            <MousePointer className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold truncate">{material.title}</h3>
            {contentTypes.map((type) => (
              <Badge key={type} variant="outline" className="flex-shrink-0 text-xs">
                {type}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {getPreviewText()}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(material)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(material)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}