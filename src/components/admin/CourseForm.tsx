import { useState, useEffect } from 'react';
import { Course, CourseAccessLevel } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Globe, Users, Crown } from 'lucide-react';

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSubmit: (data: { 
    title: string; 
    description: string; 
    thumbnail_url: string; 
    is_published: boolean;
    access_level: CourseAccessLevel;
  }) => void;
  isLoading?: boolean;
}

const ACCESS_LEVEL_OPTIONS: { value: CourseAccessLevel; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'public', 
    label: 'Publik', 
    description: 'Siapapun bisa akses tanpa login',
    icon: <Globe className="h-4 w-4" />
  },
  { 
    value: 'basic', 
    label: 'Member Basic', 
    description: 'Minimal member Basic bisa akses',
    icon: <Users className="h-4 w-4" />
  },
  { 
    value: 'pro', 
    label: 'Member PRO', 
    description: 'Hanya member PRO yang bisa akses',
    icon: <Crown className="h-4 w-4" />
  },
];

export function CourseForm({ open, onOpenChange, course, onSubmit, isLoading }: CourseFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [accessLevel, setAccessLevel] = useState<CourseAccessLevel>('pro');

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || '');
      setThumbnailUrl(course.thumbnail_url || '');
      setIsPublished(course.is_published);
      setAccessLevel(course.access_level || 'pro');
    } else {
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setIsPublished(false);
      setAccessLevel('pro');
    }
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      thumbnail_url: thumbnailUrl,
      is_published: isPublished,
      access_level: accessLevel,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Tambah Course Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Course *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul course"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi course"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail">URL Thumbnail</Label>
            <Input
              id="thumbnail"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_level">Level Akses</Label>
            <Select value={accessLevel} onValueChange={(value: CourseAccessLevel) => setAccessLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih level akses" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published">Publish Course</Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {course ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
