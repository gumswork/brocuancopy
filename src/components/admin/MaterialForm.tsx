import { useState, useEffect } from 'react';
import { Material, Module } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2, Video, FileText, MousePointer, ArrowRightLeft } from 'lucide-react';

interface MaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  modules?: Module[]; // Available modules to move to
  currentModuleId?: string;
  onSubmit: (data: {
    title: string;
    content?: string;
    media_url?: string;
    button_text?: string;
    button_url?: string;
    module_id?: string;
  }) => void;
  isLoading?: boolean;
}

export function MaterialForm({ open, onOpenChange, material, modules, currentModuleId, onSubmit, isLoading }: MaterialFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  
  // Toggle states for each section
  const [hasVideo, setHasVideo] = useState(false);
  const [hasText, setHasText] = useState(false);
  const [hasButton, setHasButton] = useState(false);

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setContent(material.content || '');
      setMediaUrl(material.media_url || '');
      setButtonText(material.button_text || '');
      setButtonUrl(material.button_url || '');
      
      // Set toggles based on existing content
      setHasVideo(!!material.media_url);
      setHasText(!!material.content);
      setHasButton(!!material.button_url);
      setSelectedModuleId(material.module_id);
    } else {
      setTitle('');
      setContent('');
      setMediaUrl('');
      setButtonText('');
      setButtonUrl('');
      setHasVideo(false);
      setHasText(false);
      setHasButton(false);
      setSelectedModuleId(currentModuleId || '');
    }
  }, [material, open, currentModuleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: {
      title: string;
      content?: string | null;
      media_url?: string | null;
      button_text?: string | null;
      button_url?: string | null;
      module_id?: string;
    } = {
      title,
      content: hasText ? content : null,
      media_url: hasVideo ? mediaUrl : null,
      button_text: hasButton ? buttonText : null,
      button_url: hasButton ? buttonUrl : null,
    };
    
    // Only include module_id if it actually changed (for moving material)
    if (material && selectedModuleId && selectedModuleId !== currentModuleId) {
      formData.module_id = selectedModuleId;
    }
    
    onSubmit(formData);
  };

  const hasAnyContent = hasVideo || hasText || hasButton;
  const isValid = title.trim() && hasAnyContent && 
    (!hasVideo || mediaUrl.trim()) &&
    (!hasText || content.trim()) &&
    (!hasButton || (buttonText.trim() && buttonUrl.trim()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? 'Edit Materi' : 'Tambah Materi Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - Always required */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul Materi *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul materi"
              required
            />
          </div>

          {/* Move to Module Section - Only show when editing */}
          {material && modules && modules.length > 1 && (
            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
              <Label className="flex items-center gap-2 font-medium">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Pindah ke Modul Lain
              </Label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih modul" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.title}
                      {mod.id === currentModuleId && ' (saat ini)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Video Section */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasVideo"
                checked={hasVideo}
                onCheckedChange={(checked) => setHasVideo(checked === true)}
              />
              <Label htmlFor="hasVideo" className="flex items-center gap-2 cursor-pointer font-medium">
                <Video className="h-4 w-4 text-primary" />
                Tambah Video
              </Label>
            </div>
            {hasVideo && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="mediaUrl">URL Video (YouTube/Vimeo) *</Label>
                <Input
                  id="mediaUrl"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... atau https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  Masukkan URL video dari YouTube atau Vimeo
                </p>
              </div>
            )}
          </div>

          {/* Text Content Section */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasText"
                checked={hasText}
                onCheckedChange={(checked) => setHasText(checked === true)}
              />
              <Label htmlFor="hasText" className="flex items-center gap-2 cursor-pointer font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Tambah Teks/Konten
              </Label>
            </div>
            {hasText && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="content">Konten *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis konten materi di sini..."
                  rows={6}
                />
              </div>
            )}
          </div>

          {/* Button Section */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasButton"
                checked={hasButton}
                onCheckedChange={(checked) => setHasButton(checked === true)}
              />
              <Label htmlFor="hasButton" className="flex items-center gap-2 cursor-pointer font-medium">
                <MousePointer className="h-4 w-4 text-primary" />
                Tambah Tombol Link
              </Label>
            </div>
            {hasButton && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Teks Tombol *</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Contoh: Download Materi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">URL Link *</Label>
                  <Input
                    id="buttonUrl"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
              </div>
            )}
          </div>

          {!hasAnyContent && (
            <p className="text-sm text-destructive">
              Pilih minimal satu jenis konten (video, teks, atau tombol)
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {material ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
