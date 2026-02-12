import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HomepageSection, SectionFormData } from '@/types/homepage';
import { useToast } from '@/hooks/use-toast';

export function useHomepageSections() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  const createSection = useMutation({
    mutationFn: async (formData: SectionFormData) => {
      const maxOrder = sections?.reduce((max, s) => Math.max(max, s.order_index), -1) ?? -1;
      
      const { data, error } = await supabase
        .from('homepage_sections')
        .insert({
          name: formData.name,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          background: formData.background,
          is_visible: formData.is_visible,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast({ title: 'Section created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create section', description: error.message, variant: 'destructive' });
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...formData }: SectionFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .update({
          name: formData.name,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          background: formData.background,
          is_visible: formData.is_visible,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast({ title: 'Section updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update section', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast({ title: 'Section deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete section', description: error.message, variant: 'destructive' });
    },
  });

  const reorderSections = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('homepage_sections')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to reorder sections', description: error.message, variant: 'destructive' });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_visible })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to toggle visibility', description: error.message, variant: 'destructive' });
    },
  });

  return {
    sections,
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    toggleVisibility,
  };
}
