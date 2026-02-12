import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExternalLink, BookOpen, Video, Zap, Users, FileText, GraduationCap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { HomepageSection, HomepageElement, HeadingContent, ParagraphContent, ButtonContent, CardContent, VideoContent, CardGroupContent } from '@/types/homepage';
import { cn } from '@/lib/utils';

// Helper to get Lucide icon by name
const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null;
  const icons = LucideIcons as unknown as Record<string, React.ElementType>;
  return icons[iconName] || null;
};

// Element Renderers
function RenderHeading({ content }: { content: HeadingContent }) {
  const Tag = `h${content.level}` as keyof JSX.IntrinsicElements;
  const sizeClasses: Record<number, string> = {
    1: 'text-4xl md:text-6xl lg:text-7xl font-bold mb-6',
    2: 'text-3xl md:text-4xl font-bold mb-4',
    3: 'text-xl md:text-2xl font-semibold mb-4',
    4: 'text-lg md:text-xl font-semibold mb-3',
    5: 'text-base md:text-lg font-medium mb-2',
    6: 'text-sm md:text-base font-medium mb-2',
  };

  return (
    <Tag
      className={cn(
        sizeClasses[content.level] || sizeClasses[2],
        content.centered && 'text-center',
        content.gradient && 'bg-gradient-primary bg-clip-text text-transparent'
      )}
    >
      {content.text}
    </Tag>
  );
}

function RenderParagraph({ content }: { content: ParagraphContent }) {
  return (
    <p
      className={cn(
        'text-lg md:text-xl text-muted-foreground mb-8',
        content.centered && 'text-center mx-auto',
        content.maxWidth
      )}
    >
      {content.text}
    </p>
  );
}

// Helper to convert section name to valid HTML id
const toSectionId = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

function RenderButton({ content }: { content: ButtonContent }) {
  const Icon = content.icon ? getIcon(content.icon) : null;
  const isExternal = content.link.startsWith('http');
  const isAnchor = content.link.startsWith('#');

  const buttonProps = {
    size: content.size || 'default',
    variant: content.variant || 'default',
    className: cn(
      content.variant === 'default' && 'shadow-glow-purple hover:shadow-glow-blue transition-all duration-300 hover:scale-105'
    ),
  };

  // Handle anchor links with smooth scroll
  if (isAnchor) {
    const handleAnchorClick = (e: React.MouseEvent) => {
      e.preventDefault();
      const targetId = content.link.slice(1); // Remove the #
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <Button {...buttonProps} onClick={handleAnchorClick}>
        {Icon && <Icon className="mr-2 h-5 w-5" />}
        {content.text}
      </Button>
    );
  }

  if (isExternal) {
    return (
      <a href={content.link} target="_blank" rel="noopener noreferrer">
        <Button {...buttonProps}>
          {Icon && <Icon className="mr-2 h-5 w-5" />}
          {content.text}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </a>
    );
  }

  return (
    <Link to={content.link}>
      <Button {...buttonProps}>
        {Icon && <Icon className="mr-2 h-5 w-5" />}
        {content.text}
      </Button>
    </Link>
  );
}

function RenderCard({ content, variant = 'primary' }: { content: CardContent; variant?: 'primary' | 'secondary' }) {
  const Icon = content.icon ? getIcon(content.icon) : null;
  const isPrimary = variant === 'primary';

  return (
    <Card
      className={cn(
        'group p-6 bg-card border-border transition-all duration-300 cursor-pointer',
        isPrimary ? 'hover:border-primary/50 hover:shadow-glow-purple' : 'hover:border-secondary/50 hover:shadow-glow-blue'
      )}
      onClick={() => content.link && window.open(content.link, '_blank')}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn(
            'p-3 rounded-lg transition-all',
            isPrimary ? 'bg-primary/10 text-primary group-hover:shadow-glow-purple' : 'bg-secondary/10 text-secondary group-hover:shadow-glow-blue'
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1">
          {content.badge && (
            <span className={cn(
              'inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2',
              content.badge === 'PRO' ? 'bg-gradient-primary text-white' : 'bg-muted text-muted-foreground'
            )}>
              {content.badge}
            </span>
          )}
          <h3 className={cn(
            'text-xl font-semibold mb-2 transition-colors',
            isPrimary ? 'group-hover:text-primary' : 'group-hover:text-secondary'
          )}>
            {content.title}
          </h3>
          <p className="text-muted-foreground mb-4">{content.description}</p>
          {content.link && (
            <Button variant="ghost" className={cn('gap-2 p-0 h-auto', isPrimary ? 'hover:text-primary' : 'hover:text-secondary')}>
              Lihat Sekarang <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function RenderVideo({ content }: { content: VideoContent }) {
  return (
    <Card className="p-2 bg-card border-border overflow-hidden">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          className="w-full h-full"
          src={content.youtube_url}
          title={content.title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
  );
}

function RenderCardGroup({ content }: { content: CardGroupContent }) {
  const gridCols = content.layout === '3-col' ? 'md:grid-cols-3' : 'md:grid-cols-2';
  
  return (
    <div className={cn('grid gap-6', gridCols)}>
      {content.items?.map((card, index) => (
        <RenderCard key={index} content={card} />
      ))}
    </div>
  );
}

function RenderElement({ element }: { element: HomepageElement }) {
  const content = element.content;
  
  switch (element.type) {
    case 'heading':
      return <RenderHeading content={content as unknown as HeadingContent} />;
    case 'paragraph':
      return <RenderParagraph content={content as unknown as ParagraphContent} />;
    case 'button':
      return <RenderButton content={content as unknown as ButtonContent} />;
    case 'card':
      return <RenderCard content={content as unknown as CardContent} />;
    case 'video':
      return <RenderVideo content={content as unknown as VideoContent} />;
    case 'card_group':
      return <RenderCardGroup content={content as unknown as CardGroupContent} />;
    default:
      return null;
  }
}

function RenderSection({ section, elements }: { section: HomepageSection; elements: HomepageElement[] }) {
  const bgClasses: Record<string, string> = {
    default: '',
    muted: 'bg-muted/30',
    gradient: 'bg-gradient-hero relative overflow-hidden',
  };

  const isHero = section.name.toLowerCase() === 'hero';

  return (
    <section id={toSectionId(section.name)} className={cn(bgClasses[section.background] || '')}>
      {section.background === 'gradient' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      )}
      <div className={cn(
        'container mx-auto px-4 relative',
        isHero ? 'py-20 md:py-32' : 'py-16 md:py-24'
      )}>
        <div className={cn('max-w-6xl mx-auto', isHero && 'text-center')}>
          {section.title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {section.title}
              </span>
            </h2>
          )}
          {section.subtitle && (
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {section.subtitle}
            </p>
          )}
          <div className={cn(isHero && 'animate-fade-in', 'space-y-4')}>
            {elements.map((element) => (
              <RenderElement key={element.id} element={element} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DynamicHomepage() {
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['public-homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  const { data: elements, isLoading: elementsLoading } = useQuery({
    queryKey: ['public-homepage-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_elements')
        .select('*')
        .eq('is_visible', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as HomepageElement[];
    },
    enabled: !!sections && sections.length > 0,
  });

  // Show loading state
  if (sectionsLoading || elementsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If no sections, return null (will fallback to static content)
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {sections.map((section) => (
        <RenderSection
          key={section.id}
          section={section}
          elements={elements?.filter((e) => e.section_id === section.id) || []}
        />
      ))}
    </div>
  );
}
