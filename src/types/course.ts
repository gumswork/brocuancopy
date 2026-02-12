export type MaterialType = 'video' | 'image' | 'text' | 'button' | null;

export type CourseAccessLevel = 'public' | 'basic' | 'pro';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  access_level: CourseAccessLevel;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  module_id: string;
  type: MaterialType | null;
  title: string;
  content: string | null;
  media_url: string | null;
  button_text: string | null;
  button_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface ModuleWithMaterials extends Module {
  materials: Material[];
}

export type AppRole = 'admin' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
