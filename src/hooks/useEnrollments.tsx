import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Enrollment {
  id: string;
  buyer_email: string;
  course_id: string;
  enrolled_at: string;
  created_at: string;
  updated_at: string;
}

export function useEnrollments(email: string | null) {
  return useQuery({
    queryKey: ["enrollments", email],
    queryFn: async () => {
      if (!email) return [];
      
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("buyer_email", email.toLowerCase().trim());

      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!email,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, courseId }: { email: string; courseId: string }) => {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          buyer_email: normalizedEmail,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error("Anda sudah mendaftar di course ini");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", variables.email.toLowerCase().trim()] });
      toast.success("Berhasil mengambil course!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengambil course");
    },
  });
}

export function useUnenrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, courseId }: { email: string; courseId: string }) => {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("buyer_email", normalizedEmail)
        .eq("course_id", courseId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", variables.email.toLowerCase().trim()] });
      toast.success("Berhasil keluar dari course");
    },
    onError: () => {
      toast.error("Gagal keluar dari course");
    },
  });
}
