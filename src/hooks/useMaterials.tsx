import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Material } from '@/types/course';
import { toast } from 'sonner';

export function useMaterials(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['materials', moduleId],
    queryFn: async () => {
      if (!moduleId) throw new Error('Module ID is required');
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Material[];
    },
    enabled: !!moduleId,
  });
}

export function useMaterial(id: string | undefined) {
  return useQuery({
    queryKey: ['material', id],
    queryFn: async () => {
      if (!id) throw new Error('Material ID is required');
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Material;
    },
    enabled: !!id,
  });
}

interface CreateMaterialInput {
  module_id: string;
  title: string;
  content?: string | null;
  media_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  order_index?: number;
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (material: CreateMaterialInput) => {
      const { data, error } = await supabase
        .from('materials')
        .insert(material)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materials', data.module_id] });
      toast.success('Materi berhasil dibuat');
    },
    onError: (error) => {
      toast.error('Gagal membuat materi: ' + error.message);
    },
  });
}

interface UpdateMaterialInput {
  id: string;
  module_id?: string;
  oldModuleId?: string; // Track old module for cache invalidation
  title?: string;
  content?: string | null;
  media_url?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  order_index?: number;
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, oldModuleId, ...material }: UpdateMaterialInput) => {
      // Filter out undefined values to avoid sending them to Supabase
      const cleanMaterial = Object.fromEntries(
        Object.entries(material).filter(([_, v]) => v !== undefined)
      );
      
      const { data, error } = await supabase
        .from('materials')
        .update(cleanMaterial)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, oldModuleId };
    },
    onSuccess: ({ data, oldModuleId }) => {
      queryClient.invalidateQueries({ queryKey: ['materials', data.module_id] });
      queryClient.invalidateQueries({ queryKey: ['material', data.id] });
      // Also invalidate old module if material was moved
      if (oldModuleId && oldModuleId !== data.module_id) {
        queryClient.invalidateQueries({ queryKey: ['materials', oldModuleId] });
      }
      toast.success('Materi berhasil diupdate');
    },
    onError: (error) => {
      toast.error('Gagal mengupdate materi: ' + error.message);
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, moduleId }: { id: string; moduleId: string }) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { moduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materials', data.moduleId] });
      toast.success('Materi berhasil dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus materi: ' + error.message);
    },
  });
}

export function useReorderMaterials() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ moduleId, materials }: { moduleId: string; materials: { id: string; order_index: number }[] }) => {
      const updates = materials.map(({ id, order_index }) =>
        supabase
          .from('materials')
          .update({ order_index })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
      
      return { moduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materials', data.moduleId] });
      toast.success('Urutan materi berhasil diubah');
    },
    onError: (error) => {
      toast.error('Gagal mengubah urutan materi: ' + error.message);
    },
  });
}
