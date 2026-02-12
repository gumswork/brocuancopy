import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';
import { toast } from 'sonner';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Course;
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (course: { 
      title: string; 
      description?: string | null; 
      thumbnail_url?: string | null; 
      is_published?: boolean; 
      access_level?: 'public' | 'basic' | 'pro';
      order_index?: number 
    }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course berhasil dibuat');
    },
    onError: (error) => {
      toast.error('Gagal membuat course: ' + error.message);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...course }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', data.id] });
      toast.success('Course berhasil diupdate');
    },
    onError: (error) => {
      toast.error('Gagal mengupdate course: ' + error.message);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course berhasil dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus course: ' + error.message);
    },
  });
}

export function useReorderCourses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courses: { id: string; order_index: number }[]) => {
      const updates = courses.map(({ id, order_index }) =>
        supabase
          .from('courses')
          .update({ order_index })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Urutan course berhasil diubah');
    },
    onError: (error) => {
      toast.error('Gagal mengubah urutan course: ' + error.message);
    },
  });
}
