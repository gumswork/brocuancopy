 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Buyer, BuyerInput, AccessType } from '@/hooks/useBuyers';
 import { Loader2 } from 'lucide-react';
 
 interface BuyerFormProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   buyer: Buyer | null;
   onSubmit: (data: BuyerInput) => Promise<void>;
   isLoading: boolean;
 }
 
 const ACCESS_TYPE_OPTIONS: { value: AccessType; label: string }[] = [
   { value: 'basic', label: 'Basic' },
   { value: 'pro', label: 'Pro' },
   { value: 'ebook', label: 'E-Book' },
   { value: 'mindcare', label: 'Mindcare' },
 ];
 
 export function BuyerForm({ open, onOpenChange, buyer, onSubmit, isLoading }: BuyerFormProps) {
   const [formData, setFormData] = useState<BuyerInput>({
     email: '',
     name: '',
     product_title: '',
     access_type: 'basic',
     amount: '',
     ref_id: '',
   });
 
   useEffect(() => {
     if (buyer) {
       setFormData({
         email: buyer.email,
         name: buyer.name,
         product_title: buyer.product_title,
         access_type: buyer.access_type,
         amount: buyer.amount || '',
         ref_id: buyer.ref_id || '',
       });
     } else {
       setFormData({
         email: '',
         name: '',
         product_title: '',
         access_type: 'basic',
         amount: '',
         ref_id: '',
       });
     }
   }, [buyer, open]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     await onSubmit(formData);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle>{buyer ? 'Edit Buyer' : 'Tambah Buyer'}</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="email">Email *</Label>
             <Input
               id="email"
               type="email"
               value={formData.email}
               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
               placeholder="email@example.com"
               required
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="name">Nama *</Label>
             <Input
               id="name"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               placeholder="Nama lengkap"
               required
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="product">Produk *</Label>
             <Input
               id="product"
               value={formData.product_title}
               onChange={(e) => setFormData({ ...formData, product_title: e.target.value })}
               placeholder="Nama produk yang dibeli"
               required
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="access_type">Tipe Akses</Label>
             <Select
               value={formData.access_type}
               onValueChange={(value: AccessType) => setFormData({ ...formData, access_type: value })}
             >
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {ACCESS_TYPE_OPTIONS.map((option) => (
                   <SelectItem key={option.value} value={option.value}>
                     {option.label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="amount">Jumlah Bayar</Label>
               <Input
                 id="amount"
                 value={formData.amount || ''}
                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                 placeholder="e.g., Rp 500.000"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="ref_id">Ref ID</Label>
               <Input
                 id="ref_id"
                 value={formData.ref_id || ''}
                 onChange={(e) => setFormData({ ...formData, ref_id: e.target.value })}
                 placeholder="ID referensi"
               />
             </div>
           </div>
 
           <div className="flex justify-end gap-2 pt-4">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
               Batal
             </Button>
             <Button type="submit" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {buyer ? 'Simpan' : 'Tambah'}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }