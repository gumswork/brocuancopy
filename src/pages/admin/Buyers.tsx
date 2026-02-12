 import { useState, useMemo } from 'react';
 import { AdminLayout } from '@/components/admin/AdminLayout';
 import { BuyerForm } from '@/components/admin/BuyerForm';
 import { CSVImportDialog } from '@/components/admin/CSVImportDialog';
 import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
 import {
   useBuyers,
   useCreateBuyer,
   useUpdateBuyer,
   useDeleteBuyer,
   useBulkCreateBuyers,
   useBulkDeleteBuyers,
   Buyer,
   BuyerInput,
   AccessType,
 } from '@/hooks/useBuyers';
 import { buyersToCSV, downloadCSV } from '@/lib/csv-utils';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent } from '@/components/ui/card';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Badge } from '@/components/ui/badge';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import {
   Plus,
   Upload,
   Download,
   Search,
   MoreHorizontal,
   Pencil,
   Trash2,
   Users,
   X,
 } from 'lucide-react';
 import { format } from 'date-fns';
 import { id } from 'date-fns/locale';
 
 const ACCESS_TYPE_OPTIONS: { value: AccessType | 'all'; label: string }[] = [
   { value: 'all', label: 'Semua Tipe' },
   { value: 'basic', label: 'Basic' },
   { value: 'pro', label: 'Pro' },
   { value: 'ebook', label: 'E-Book' },
   { value: 'mindcare', label: 'Mindcare' },
 ];
 
 const ACCESS_TYPE_COLORS: Record<AccessType, string> = {
   basic: 'bg-blue-500/20 text-blue-400',
   pro: 'bg-purple-500/20 text-purple-400',
   ebook: 'bg-green-500/20 text-green-400',
   mindcare: 'bg-pink-500/20 text-pink-400',
 };
 
 export default function AdminBuyers() {
   const { data: buyers, isLoading } = useBuyers();
   const createBuyer = useCreateBuyer();
   const updateBuyer = useUpdateBuyer();
   const deleteBuyer = useDeleteBuyer();
   const bulkCreateBuyers = useBulkCreateBuyers();
   const bulkDeleteBuyers = useBulkDeleteBuyers();
 
   const [formOpen, setFormOpen] = useState(false);
   const [importOpen, setImportOpen] = useState(false);
   const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [deletingBuyer, setDeletingBuyer] = useState<Buyer | null>(null);
   const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
 
   // Filters
   const [searchQuery, setSearchQuery] = useState('');
   const [accessTypeFilter, setAccessTypeFilter] = useState<AccessType | 'all'>('all');
   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 
   // Filtered data
   const filteredBuyers = useMemo(() => {
     if (!buyers) return [];
     
     return buyers.filter((buyer) => {
       const matchesSearch =
         searchQuery === '' ||
         buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
         buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         buyer.product_title.toLowerCase().includes(searchQuery.toLowerCase());
 
       const matchesAccess =
         accessTypeFilter === 'all' || buyer.access_type === accessTypeFilter;
 
       return matchesSearch && matchesAccess;
     });
   }, [buyers, searchQuery, accessTypeFilter]);
 
   const handleCreate = () => {
     setEditingBuyer(null);
     setFormOpen(true);
   };
 
   const handleEdit = (buyer: Buyer) => {
     setEditingBuyer(buyer);
     setFormOpen(true);
   };
 
   const handleDelete = (buyer: Buyer) => {
     setDeletingBuyer(buyer);
     setDeleteDialogOpen(true);
   };
 
   const handleFormSubmit = async (data: BuyerInput) => {
     if (editingBuyer) {
       await updateBuyer.mutateAsync({ id: editingBuyer.id, ...data });
     } else {
       await createBuyer.mutateAsync(data);
     }
     setFormOpen(false);
   };
 
   const handleDeleteConfirm = async () => {
     if (deletingBuyer) {
       await deleteBuyer.mutateAsync(deletingBuyer.id);
       setDeleteDialogOpen(false);
       setDeletingBuyer(null);
     }
   };
 
   const handleImport = async (buyers: BuyerInput[]) => {
     await bulkCreateBuyers.mutateAsync(buyers);
   };
 
   const handleExportAll = () => {
     if (!buyers || buyers.length === 0) return;
     const csv = buyersToCSV(buyers);
     downloadCSV(csv, `buyers-all-${format(new Date(), 'yyyy-MM-dd')}.csv`);
   };
 
   const handleExportFiltered = () => {
     if (filteredBuyers.length === 0) return;
     const csv = buyersToCSV(filteredBuyers);
     downloadCSV(csv, `buyers-filtered-${format(new Date(), 'yyyy-MM-dd')}.csv`);
   };
 
   const handleSelectAll = () => {
     if (selectedIds.size === filteredBuyers.length) {
       setSelectedIds(new Set());
     } else {
       setSelectedIds(new Set(filteredBuyers.map((b) => b.id)));
     }
   };
 
   const handleSelectOne = (id: string) => {
     const newSet = new Set(selectedIds);
     if (newSet.has(id)) {
       newSet.delete(id);
     } else {
       newSet.add(id);
     }
     setSelectedIds(newSet);
   };
 
   const handleBulkDelete = async () => {
     await bulkDeleteBuyers.mutateAsync(Array.from(selectedIds));
     setSelectedIds(new Set());
     setBulkDeleteOpen(false);
   };
 
   const clearFilters = () => {
     setSearchQuery('');
     setAccessTypeFilter('all');
   };
 
   const hasActiveFilters = searchQuery !== '' || accessTypeFilter !== 'all';
 
   return (
     <AdminLayout title="Kelola Buyers/Members">
       {/* Action Bar */}
       <div className="flex flex-wrap gap-3 mb-6">
         <Button onClick={handleCreate} className="gap-2">
           <Plus className="h-4 w-4" />
           Tambah Buyer
         </Button>
         <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
           <Upload className="h-4 w-4" />
           Import CSV
         </Button>
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="outline" className="gap-2">
               <Download className="h-4 w-4" />
               Export
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent>
             <DropdownMenuItem onClick={handleExportAll} disabled={!buyers?.length}>
               Export Semua ({buyers?.length || 0})
             </DropdownMenuItem>
             <DropdownMenuItem onClick={handleExportFiltered} disabled={filteredBuyers.length === 0}>
               Export Terfilter ({filteredBuyers.length})
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
 
         {selectedIds.size > 0 && (
           <Button
             variant="destructive"
             onClick={() => setBulkDeleteOpen(true)}
             className="gap-2"
           >
             <Trash2 className="h-4 w-4" />
             Hapus ({selectedIds.size})
           </Button>
         )}
       </div>
 
       {/* Filters */}
       <div className="flex flex-wrap gap-3 mb-6">
         <div className="relative flex-1 min-w-[200px] max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Cari email, nama, atau produk..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-9"
           />
         </div>
         <Select
           value={accessTypeFilter}
           onValueChange={(value) => setAccessTypeFilter(value as AccessType | 'all')}
         >
           <SelectTrigger className="w-[160px]">
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
         {hasActiveFilters && (
           <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
             <X className="h-4 w-4" />
             Reset Filter
           </Button>
         )}
       </div>
 
       {/* Stats */}
       <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
         <span>Total: {buyers?.length || 0}</span>
         {hasActiveFilters && <span>Terfilter: {filteredBuyers.length}</span>}
         {selectedIds.size > 0 && <span>Dipilih: {selectedIds.size}</span>}
       </div>
 
       {/* Table */}
       {isLoading ? (
         <Card>
           <CardContent className="p-4 space-y-3">
             {[1, 2, 3, 4, 5].map((i) => (
               <Skeleton key={i} className="h-12 w-full" />
             ))}
           </CardContent>
         </Card>
       ) : filteredBuyers.length === 0 ? (
         <Card>
           <CardContent className="flex flex-col items-center justify-center py-12">
             <Users className="h-12 w-12 text-muted-foreground mb-4" />
             <h3 className="text-lg font-semibold mb-2">
               {buyers?.length === 0 ? 'Belum ada buyer' : 'Tidak ada hasil'}
             </h3>
             <p className="text-muted-foreground mb-4">
               {buyers?.length === 0
                 ? 'Mulai dengan menambahkan buyer baru atau import dari CSV'
                 : 'Coba ubah filter pencarian Anda'}
             </p>
             {buyers?.length === 0 && (
               <div className="flex gap-2">
                 <Button onClick={handleCreate} className="gap-2">
                   <Plus className="h-4 w-4" />
                   Tambah Buyer
                 </Button>
                 <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
                   <Upload className="h-4 w-4" />
                   Import CSV
                 </Button>
               </div>
             )}
           </CardContent>
         </Card>
       ) : (
         <Card>
           <div className="overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="w-[50px]">
                     <Checkbox
                       checked={selectedIds.size === filteredBuyers.length && filteredBuyers.length > 0}
                       onCheckedChange={handleSelectAll}
                     />
                   </TableHead>
                   <TableHead>Email</TableHead>
                   <TableHead>Nama</TableHead>
                   <TableHead>Produk</TableHead>
                   <TableHead>Tipe Akses</TableHead>
                   <TableHead>Tanggal Beli</TableHead>
                   <TableHead className="w-[80px]">Aksi</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredBuyers.map((buyer) => (
                   <TableRow key={buyer.id}>
                     <TableCell>
                       <Checkbox
                         checked={selectedIds.has(buyer.id)}
                         onCheckedChange={() => handleSelectOne(buyer.id)}
                       />
                     </TableCell>
                     <TableCell className="font-medium">{buyer.email}</TableCell>
                     <TableCell>{buyer.name}</TableCell>
                     <TableCell>{buyer.product_title}</TableCell>
                     <TableCell>
                       <Badge className={ACCESS_TYPE_COLORS[buyer.access_type]}>
                         {buyer.access_type}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       {format(new Date(buyer.purchased_at), 'd MMM yyyy', { locale: id })}
                     </TableCell>
                     <TableCell>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <MoreHorizontal className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleEdit(buyer)}>
                             <Pencil className="mr-2 h-4 w-4" />
                             Edit
                           </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={() => handleDelete(buyer)}
                             className="text-destructive focus:text-destructive"
                           >
                             <Trash2 className="mr-2 h-4 w-4" />
                             Hapus
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
         </Card>
       )}
 
       {/* Dialogs */}
       <BuyerForm
         open={formOpen}
         onOpenChange={setFormOpen}
         buyer={editingBuyer}
         onSubmit={handleFormSubmit}
         isLoading={createBuyer.isPending || updateBuyer.isPending}
       />
 
       <CSVImportDialog
         open={importOpen}
         onOpenChange={setImportOpen}
         onImport={handleImport}
         isLoading={bulkCreateBuyers.isPending}
       />
 
       <DeleteConfirmDialog
         open={deleteDialogOpen}
         onOpenChange={setDeleteDialogOpen}
         title="Hapus Buyer"
         description={`Apakah Anda yakin ingin menghapus buyer "${deletingBuyer?.name}" (${deletingBuyer?.email})? Tindakan ini tidak dapat dibatalkan.`}
         onConfirm={handleDeleteConfirm}
         isLoading={deleteBuyer.isPending}
       />
 
       <DeleteConfirmDialog
         open={bulkDeleteOpen}
         onOpenChange={setBulkDeleteOpen}
         title="Hapus Buyers"
         description={`Apakah Anda yakin ingin menghapus ${selectedIds.size} buyer yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
         onConfirm={handleBulkDelete}
         isLoading={bulkDeleteBuyers.isPending}
       />
     </AdminLayout>
   );
 }