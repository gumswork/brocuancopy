import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Course, Module, Material, ModuleWithMaterials } from "@/types/course";

export function usePublicCourses() {
  return useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("order_index");

      if (error) throw error;
      return data as Course[];
    },
  });
}

export function usePublicCourse(id: string | undefined) {
  return useQuery({
    queryKey: ["public-course", id],
    queryFn: async () => {
      if (!id) throw new Error("Course ID is required");

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!id,
  });
}

export function usePublicModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ["public-modules", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");

      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
}

export function usePublicModule(id: string | undefined) {
  return useQuery({
    queryKey: ["public-module", id],
    queryFn: async () => {
      if (!id) throw new Error("Module ID is required");

      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Module | null;
    },
    enabled: !!id,
  });
}

export function usePublicMaterials(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["public-materials", moduleId],
    queryFn: async () => {
      if (!moduleId) throw new Error("Module ID is required");

      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index");

      if (error) throw error;
      return data as Material[];
    },
    enabled: !!moduleId,
  });
}

export function usePublicModulesWithMaterials(courseId: string | undefined) {
  return useQuery({
    queryKey: ["public-modules-with-materials", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");

      // Fetch modules
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) throw modulesError;
      if (!modules || modules.length === 0) return [] as ModuleWithMaterials[];

      // Fetch all materials for these modules
      const moduleIds = modules.map((m) => m.id);
      const { data: materials, error: materialsError } = await supabase
        .from("materials")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index");

      if (materialsError) throw materialsError;

      // Group materials by module_id
      const materialsByModule = (materials || []).reduce((acc, material) => {
        if (!acc[material.module_id]) {
          acc[material.module_id] = [];
        }
        acc[material.module_id].push(material);
        return acc;
      }, {} as Record<string, Material[]>);

      // Combine modules with their materials
      return modules.map((module) => ({
        ...module,
        materials: materialsByModule[module.id] || [],
      })) as ModuleWithMaterials[];
    },
    enabled: !!courseId,
  });
}
