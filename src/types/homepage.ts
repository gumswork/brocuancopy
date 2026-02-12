export type ElementType = 'heading' | 'paragraph' | 'button' | 'card' | 'video' | 'card_group';
export type BackgroundType = 'default' | 'muted' | 'gradient';

export interface HomepageSection {
  id: string;
  name: string;
  title: string | null;
  subtitle: string | null;
  background: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  elements?: HomepageElement[];
}

export interface HomepageElement {
  id: string;
  section_id: string;
  type: ElementType;
  content: ElementContent;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Content types for each element
export interface HeadingContent {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  gradient?: boolean;
  centered?: boolean;
}

export interface ParagraphContent {
  text: string;
  centered?: boolean;
  maxWidth?: string;
}

export interface ButtonContent {
  text: string;
  link: string;
  variant?: 'default' | 'outline' | 'ghost';
  icon?: string;
  size?: 'default' | 'sm' | 'lg';
}

export interface CardContent {
  title: string;
  description: string;
  link?: string;
  icon?: string;
  badge?: string;
}

export interface VideoContent {
  youtube_url: string;
  title?: string;
}

export interface CardGroupContent {
  layout: '2-col' | '3-col';
  items: CardContent[];
}

export type ElementContent = 
  | HeadingContent 
  | ParagraphContent 
  | ButtonContent 
  | CardContent 
  | VideoContent 
  | CardGroupContent
  | Record<string, unknown>;

// Form types
export interface SectionFormData {
  name: string;
  title?: string;
  subtitle?: string;
  background: BackgroundType;
  is_visible: boolean;
}

export interface ElementFormData {
  type: ElementType;
  content: ElementContent;
  is_visible: boolean;
}

// Icon mapping for element types
export const elementTypeLabels: Record<ElementType, string> = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  button: 'Button',
  card: 'Card',
  video: 'Video',
  card_group: 'Card Group',
};

export const backgroundLabels: Record<BackgroundType, string> = {
  default: 'Default',
  muted: 'Muted/Gray',
  gradient: 'Gradient',
};
