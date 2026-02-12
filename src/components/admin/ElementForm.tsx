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
import {
  HomepageElement,
  ElementType,
  ElementContent,
  elementTypeLabels,
  HeadingContent,
  ParagraphContent,
  ButtonContent,
  CardContent,
  VideoContent,
  CardGroupContent,
} from '@/types/homepage';

interface ElementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element?: HomepageElement;
  onSubmit: (data: { type: ElementType; content: ElementContent; is_visible: boolean }) => void;
  isLoading?: boolean;
}

export function ElementForm({ open, onOpenChange, element, onSubmit, isLoading }: ElementFormProps) {
  const [type, setType] = useState<ElementType>('heading');
  const [isVisible, setIsVisible] = useState(true);
  const [content, setContent] = useState<ElementContent>({});

  useEffect(() => {
    if (element) {
      setType(element.type);
      setIsVisible(element.is_visible);
      setContent(element.content);
    } else {
      setType('heading');
      setIsVisible(true);
      setContent(getDefaultContent('heading'));
    }
  }, [element, open]);

  const getDefaultContent = (elementType: ElementType): ElementContent => {
    switch (elementType) {
      case 'heading':
        return { level: 2, text: '', gradient: false, centered: true } as HeadingContent;
      case 'paragraph':
        return { text: '', centered: true } as ParagraphContent;
      case 'button':
        return { text: '', link: '', variant: 'default', size: 'default' } as ButtonContent;
      case 'card':
        return { title: '', description: '', link: '', icon: '' } as CardContent;
      case 'video':
        return { youtube_url: '', title: '' } as VideoContent;
      case 'card_group':
        return { layout: '2-col', items: [] } as CardGroupContent;
      default:
        return {};
    }
  };

  const handleTypeChange = (newType: ElementType) => {
    setType(newType);
    setContent(getDefaultContent(newType));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, content, is_visible: isVisible });
  };

  const updateContent = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const renderContentFields = () => {
    switch (type) {
      case 'heading':
        const headingContent = content as HeadingContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Heading Level</Label>
              <Select
                value={String(headingContent.level || 2)}
                onValueChange={(v) => updateContent('level', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <SelectItem key={lvl} value={String(lvl)}>
                      H{lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Text *</Label>
              <Input
                value={headingContent.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Heading text"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={headingContent.gradient || false}
                  onCheckedChange={(v) => updateContent('gradient', v)}
                />
                <Label>Gradient</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={headingContent.centered || false}
                  onCheckedChange={(v) => updateContent('centered', v)}
                />
                <Label>Centered</Label>
              </div>
            </div>
          </>
        );

      case 'paragraph':
        const paragraphContent = content as ParagraphContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Text *</Label>
              <Textarea
                value={paragraphContent.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Paragraph text"
                rows={4}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={paragraphContent.centered || false}
                onCheckedChange={(v) => updateContent('centered', v)}
              />
              <Label>Centered</Label>
            </div>
            <div className="space-y-2">
              <Label>Max Width</Label>
              <Input
                value={paragraphContent.maxWidth || ''}
                onChange={(e) => updateContent('maxWidth', e.target.value)}
                placeholder="e.g., max-w-2xl"
              />
            </div>
          </>
        );

      case 'button':
        const buttonContent = content as ButtonContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Button Text *</Label>
              <Input
                value={buttonContent.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Button label"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL *</Label>
              <Input
                value={buttonContent.link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Variant</Label>
                <Select
                  value={buttonContent.variant || 'default'}
                  onValueChange={(v) => updateContent('variant', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Select
                  value={buttonContent.size || 'default'}
                  onValueChange={(v) => updateContent('size', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icon (Lucide name)</Label>
              <Input
                value={buttonContent.icon || ''}
                onChange={(e) => updateContent('icon', e.target.value)}
                placeholder="e.g., ExternalLink, ArrowRight"
              />
            </div>
          </>
        );

      case 'card':
        const cardContent = content as CardContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Card Title *</Label>
              <Input
                value={cardContent.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Card title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={cardContent.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                placeholder="Card description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                value={cardContent.link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (Lucide name)</Label>
                <Input
                  value={cardContent.icon || ''}
                  onChange={(e) => updateContent('icon', e.target.value)}
                  placeholder="e.g., Users, BookOpen"
                />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input
                  value={cardContent.badge || ''}
                  onChange={(e) => updateContent('badge', e.target.value)}
                  placeholder="e.g., PRO, NEW"
                />
              </div>
            </div>
          </>
        );

      case 'video':
        const videoContent = content as VideoContent;
        return (
          <>
            <div className="space-y-2">
              <Label>YouTube URL *</Label>
              <Input
                value={videoContent.youtube_url || ''}
                onChange={(e) => updateContent('youtube_url', e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Video Title</Label>
              <Input
                value={videoContent.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Video title for accessibility"
              />
            </div>
          </>
        );

      case 'card_group':
        const cardGroupContent = content as CardGroupContent;
        return (
          <>
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={cardGroupContent.layout || '2-col'}
                onValueChange={(v) => updateContent('layout', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-col">2 Columns</SelectItem>
                  <SelectItem value="3-col">3 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Card items can be managed after creating the element.
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{element ? 'Edit Element' : 'Add Element'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Element Type</Label>
            <Select
              value={type}
              onValueChange={(v) => handleTypeChange(v as ElementType)}
              disabled={!!element}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(elementTypeLabels) as ElementType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {elementTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderContentFields()}

          <div className="flex items-center gap-2">
            <Switch
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
            <Label>Visible</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : element ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
