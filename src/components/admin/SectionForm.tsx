import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HomepageSection, SectionFormData, BackgroundType, backgroundLabels } from '@/types/homepage';

interface SectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: HomepageSection;
  onSubmit: (data: SectionFormData) => void;
  isLoading?: boolean;
}

export function SectionForm({ open, onOpenChange, section, onSubmit, isLoading }: SectionFormProps) {
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    title: '',
    subtitle: '',
    background: 'default',
    is_visible: true,
  });

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        title: section.title || '',
        subtitle: section.subtitle || '',
        background: section.background as BackgroundType,
        is_visible: section.is_visible,
      });
    } else {
      setFormData({
        name: '',
        title: '',
        subtitle: '',
        background: 'default',
        is_visible: true,
      });
    }
  }, [section, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{section ? 'Edit Section' : 'Add Section'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Section Name (ID) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., hero, tools, pricing"
              required
            />
            <p className="text-xs text-muted-foreground">
              Digunakan sebagai anchor link. Contoh: jika name = "tools", maka tombol dengan link "#tools" akan scroll ke section ini.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Section Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Display title for the section"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Section Subtitle</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Description or subtitle text"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Style</Label>
            <Select
              value={formData.background}
              onValueChange={(value) => setFormData({ ...formData, background: value as BackgroundType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(backgroundLabels) as BackgroundType[]).map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {backgroundLabels[bg]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
            />
            <Label htmlFor="is_visible">Visible</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? 'Saving...' : section ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
