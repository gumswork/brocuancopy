import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HomepageElement, ElementType, ElementContent } from '@/types/homepage';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export function useHomepageElements(sectionId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: elements, isLoading, error } = useQuery({
    queryKey: ['homepage-elements', sectionId],
    queryFn: async () => {
      let query = supabase
        .from('homepage_elements')
        .select('*')
        .order('order_index', { ascending: true });

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as HomepageElement[];
    },
    enabled: !!sectionId,
  });

  const createElement = useMutation({
    mutationFn: async ({
      section_id,
      type,
      content,
      is_visible = true,
    }: {
      section_id: string;
      type: ElementType;
      content: ElementContent;
      is_visible?: boolean;
    }) => {
      const currentElements = elements || [];
      const maxOrder = currentElements.reduce((max, e) => Math.max(max, e.order_index), -1);

      const { data, error } = await supabase
        .from('homepage_elements')
        .insert([{
          section_id,
          type,
          content: content as Json,
          is_visible,
          order_index: maxOrder + 1,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-elements'] });
      toast({ title: 'Element created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create element', description: error.message, variant: 'destructive' });
    },
  });

  const updateElement = useMutation({
    mutationFn: async ({
      id,
      type,
      content,
      is_visible,
    }: {
      id: string;
      type?: ElementType;
      content?: ElementContent;
      is_visible?: boolean;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (type !== undefined) updateData.type = type;
      if (content !== undefined) updateData.content = content as Json;
      if (is_visible !== undefined) updateData.is_visible = is_visible;
      if (is_visible !== undefined) updateData.is_visible = is_visible;

      const { data, error } = await supabase
        .from('homepage_elements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-elements'] });
      toast({ title: 'Element updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update element', description: error.message, variant: 'destructive' });
    },
  });

  const deleteElement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_elements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-elements'] });
      toast({ title: 'Element deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete element', description: error.message, variant: 'destructive' });
    },
  });

  const reorderElements = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('homepage_elements')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-elements'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to reorder elements', description: error.message, variant: 'destructive' });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('homepage_elements')
        .update({ is_visible })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-elements'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to toggle visibility', description: error.message, variant: 'destructive' });
    },
  });

  const moveToSection = useMutation({
    mutationFn: async ({ elementId, newSectionId }: { elementId: string; newSectionId: string }) => {
      // Get max order_index in the new section
      const { data: sectionElements } = await supabase
        .from('homepage_elements')
        .select('order_index')
        .eq('section_id', newSectionId)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxOrder = sectionElements?.[0]?.order_index ?? -1;

      const { error } = await supabase
        .from('homepage_elements')
        .update({ 
          section_id: newSectionId,
          order_index: maxOrder + 1,
        })
        .eq('id', elementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-elements'] });
      toast({ title: 'Element moved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to move element', description: error.message, variant: 'destructive' });
    },
  });

  return {
    elements,
    isLoading,
    error,
    createElement,
    updateElement,
    deleteElement,
    reorderElements,
    toggleVisibility,
    moveToSection,
  };
}
