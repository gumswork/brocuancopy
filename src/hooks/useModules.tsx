import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Module } from '@/types/course';
import { toast } from 'sonner';

export function useModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
}

export function useModule(id: string | undefined) {
  return useQuery({
    queryKey: ['module', id],
    queryFn: async () => {
      if (!id) throw new Error('Module ID is required');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Module;
    },
    enabled: !!id,
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (module: { course_id: string; title: string; description?: string | null; order_index?: number }) => {
      const { data, error } = await supabase
        .from('modules')
        .insert([module])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.course_id] });
      toast.success('Modul berhasil dibuat');
    },
    onError: (error) => {
      toast.error('Gagal membuat modul: ' + error.message);
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...module }: Partial<Module> & { id: string }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(module)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.course_id] });
      queryClient.invalidateQueries({ queryKey: ['module', data.id] });
      toast.success('Modul berhasil diupdate');
    },
    onError: (error) => {
      toast.error('Gagal mengupdate modul: ' + error.message);
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.courseId] });
      toast.success('Modul berhasil dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus modul: ' + error.message);
    },
  });
}

export function useReorderModules() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, modules }: { courseId: string; modules: { id: string; order_index: number }[] }) => {
      const updates = modules.map(({ id, order_index }) =>
        supabase
          .from('modules')
          .update({ order_index })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
      
      return { courseId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.courseId] });
      toast.success('Urutan modul berhasil diubah');
    },
    onError: (error) => {
      toast.error('Gagal mengubah urutan modul: ' + error.message);
    },
  });
}
