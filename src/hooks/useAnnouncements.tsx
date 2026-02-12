import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string | null;
  link_url: string | null;
  link_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  buyer_email: string;
  read_at: string;
}

// For members - only published announcements
export function usePublicAnnouncements() {
  return useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });
}

// For admin - all announcements
export function useAdminAnnouncements() {
  return useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });
}

// Hook to get unread announcement count for badge
export function useUnreadAnnouncementCount(email: string | null) {
  return useQuery({
    queryKey: ["unread-announcement-count", email],
    queryFn: async () => {
      if (!email) return 0;
      
      // Get all published announcements
      const { data: announcements, error: annError } = await supabase
        .from("announcements")
        .select("id")
        .eq("is_published", true);
      
      if (annError) throw annError;
      if (!announcements || announcements.length === 0) return 0;
      
      // Get read announcements for this user
      const { data: reads, error: readError } = await supabase
        .from("announcement_reads")
        .select("announcement_id")
        .eq("buyer_email", email.toLowerCase().trim());
      
      if (readError) throw readError;
      
      const readIds = new Set(reads?.map(r => r.announcement_id) || []);
      const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;
      
      return unreadCount;
    },
    enabled: !!email,
  });
}

// Hook to mark announcement as read
export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ announcementId, email }: { announcementId: string; email: string }) => {
      const { error } = await supabase
        .from("announcement_reads")
        .insert({
          announcement_id: announcementId,
          buyer_email: email.toLowerCase().trim(),
        });
      
      // Ignore unique constraint violation (already read)
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-announcement-count"] });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcement: {
      title: string;
      content: string;
      is_published?: boolean;
      link_url?: string | null;
      link_text?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          ...announcement,
          published_at: announcement.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["unread-announcement-count"] });
      toast.success("Pengumuman berhasil dibuat");
    },
    onError: () => {
      toast.error("Gagal membuat pengumuman");
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      content?: string;
      is_published?: boolean;
      link_url?: string | null;
      link_text?: string | null;
    }) => {
      // If publishing, set published_at
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.is_published === true) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("announcements")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["unread-announcement-count"] });
      toast.success("Pengumuman berhasil diperbarui");
    },
    onError: () => {
      toast.error("Gagal memperbarui pengumuman");
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["unread-announcement-count"] });
      toast.success("Pengumuman berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus pengumuman");
    },
  });
}
