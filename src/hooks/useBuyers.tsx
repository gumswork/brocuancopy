 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 export type AccessType = 'basic' | 'pro' | 'ebook' | 'mindcare';
 
 export interface Buyer {
   id: string;
   email: string;
   name: string;
   product_title: string;
   access_type: AccessType;
   amount: string | null;
   ref_id: string | null;
   purchased_at: string;
   created_at: string;
   updated_at: string;
 }
 
 export interface BuyerInput {
   email: string;
   name: string;
   product_title: string;
   access_type: AccessType;
   amount?: string | null;
   ref_id?: string | null;
   purchased_at?: string;
 }
 
 export function useBuyers() {
   return useQuery({
     queryKey: ['buyers'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('buyers')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       return data as Buyer[];
     },
   });
 }
 
 export function useCreateBuyer() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (buyer: BuyerInput) => {
       const { data, error } = await supabase
         .from('buyers')
         .insert(buyer)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['buyers'] });
       toast.success('Buyer berhasil ditambahkan');
     },
     onError: (error) => {
       toast.error('Gagal menambahkan buyer: ' + error.message);
     },
   });
 }
 
 export function useUpdateBuyer() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({ id, ...updates }: Partial<BuyerInput> & { id: string }) => {
       const { data, error } = await supabase
         .from('buyers')
         .update(updates)
         .eq('id', id)
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['buyers'] });
       toast.success('Buyer berhasil diupdate');
     },
     onError: (error) => {
       toast.error('Gagal mengupdate buyer: ' + error.message);
     },
   });
 }
 
 export function useDeleteBuyer() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('buyers')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['buyers'] });
       toast.success('Buyer berhasil dihapus');
     },
     onError: (error) => {
       toast.error('Gagal menghapus buyer: ' + error.message);
     },
   });
 }
 
 export function useBulkCreateBuyers() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (buyers: BuyerInput[]) => {
       const { data, error } = await supabase
         .from('buyers')
         .insert(buyers)
         .select();
 
       if (error) throw error;
       return data;
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ['buyers'] });
       toast.success(`${data.length} buyer berhasil diimport`);
     },
     onError: (error) => {
       toast.error('Gagal mengimport buyers: ' + error.message);
     },
   });
 }
 
 export function useBulkDeleteBuyers() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (ids: string[]) => {
       const { error } = await supabase
         .from('buyers')
         .delete()
         .in('id', ids);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['buyers'] });
       toast.success('Buyers berhasil dihapus');
     },
     onError: (error) => {
       toast.error('Gagal menghapus buyers: ' + error.message);
     },
   });
 }