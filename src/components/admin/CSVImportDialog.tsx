 import { useState, useRef } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { parseCSV, CSVParseResult } from '@/lib/csv-utils';
 import { BuyerInput } from '@/hooks/useBuyers';
 import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
 import { ScrollArea } from '@/components/ui/scroll-area';
 
 interface CSVImportDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onImport: (buyers: BuyerInput[]) => Promise<void>;
   isLoading: boolean;
 }
 
 export function CSVImportDialog({ open, onOpenChange, onImport, isLoading }: CSVImportDialogProps) {
   const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
   const [fileName, setFileName] = useState<string>('');
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
 
     setFileName(file.name);
     const reader = new FileReader();
     reader.onload = (event) => {
       const content = event.target?.result as string;
       const result = parseCSV(content);
       setParseResult(result);
     };
     reader.readAsText(file);
   };
 
   const handleImport = async () => {
     if (parseResult && parseResult.success.length > 0) {
       await onImport(parseResult.success);
       handleReset();
       onOpenChange(false);
     }
   };
 
   const handleReset = () => {
     setParseResult(null);
     setFileName('');
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={(value) => {
       if (!value) handleReset();
       onOpenChange(value);
     }}>
       <DialogContent className="max-w-lg">
         <DialogHeader>
           <DialogTitle>Import Buyers dari CSV</DialogTitle>
           <DialogDescription>
             Upload file CSV dengan kolom: email, name, product_title, access_type (opsional), amount (opsional), ref_id (opsional), purchased_at (opsional)
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-4">
           {!parseResult ? (
             <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
               <input
                 ref={fileInputRef}
                 type="file"
                 accept=".csv"
                 onChange={handleFileChange}
                 className="hidden"
                 id="csv-upload"
               />
               <label htmlFor="csv-upload" className="cursor-pointer">
                 <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                 <p className="text-sm text-muted-foreground">
                   Klik untuk memilih file CSV
                 </p>
               </label>
             </div>
           ) : (
             <>
               <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                 <FileText className="h-5 w-5 text-muted-foreground" />
                 <span className="text-sm font-medium">{fileName}</span>
                 <Button variant="ghost" size="sm" className="ml-auto" onClick={handleReset}>
                   Ganti File
                 </Button>
               </div>
 
               {parseResult.success.length > 0 && (
                 <Alert className="border-green-500/50 bg-green-500/10">
                   <CheckCircle className="h-4 w-4 text-green-500" />
                   <AlertDescription className="text-green-700 dark:text-green-400">
                     {parseResult.success.length} data siap diimport
                   </AlertDescription>
                 </Alert>
               )}
 
               {parseResult.errors.length > 0 && (
                 <Alert variant="destructive">
                   <AlertTriangle className="h-4 w-4" />
                   <AlertDescription>
                     <p className="font-medium mb-2">{parseResult.errors.length} error ditemukan:</p>
                     <ScrollArea className="h-24">
                       <ul className="text-sm space-y-1">
                         {parseResult.errors.map((err, i) => (
                           <li key={i}>Baris {err.row}: {err.error}</li>
                         ))}
                       </ul>
                     </ScrollArea>
                   </AlertDescription>
                 </Alert>
               )}
 
               {parseResult.success.length > 0 && (
                 <div className="border rounded-lg overflow-hidden">
                   <div className="bg-muted px-3 py-2 text-sm font-medium">
                     Preview Data
                   </div>
                   <ScrollArea className="h-40">
                     <table className="w-full text-sm">
                       <thead className="bg-muted/50">
                         <tr>
                           <th className="px-3 py-2 text-left">Email</th>
                           <th className="px-3 py-2 text-left">Nama</th>
                           <th className="px-3 py-2 text-left">Produk</th>
                           <th className="px-3 py-2 text-left">Akses</th>
                         </tr>
                       </thead>
                       <tbody>
                         {parseResult.success.slice(0, 10).map((buyer, i) => (
                           <tr key={i} className="border-t">
                             <td className="px-3 py-2 truncate max-w-[150px]">{buyer.email}</td>
                             <td className="px-3 py-2 truncate max-w-[100px]">{buyer.name}</td>
                             <td className="px-3 py-2 truncate max-w-[100px]">{buyer.product_title}</td>
                             <td className="px-3 py-2">{buyer.access_type}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     {parseResult.success.length > 10 && (
                       <p className="px-3 py-2 text-sm text-muted-foreground">
                         ... dan {parseResult.success.length - 10} data lainnya
                       </p>
                     )}
                   </ScrollArea>
                 </div>
               )}
             </>
           )}
 
           <div className="flex justify-end gap-2 pt-2">
             <Button variant="outline" onClick={() => onOpenChange(false)}>
               Batal
             </Button>
             <Button
               onClick={handleImport}
               disabled={!parseResult || parseResult.success.length === 0 || isLoading}
             >
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Import {parseResult?.success.length || 0} Data
             </Button>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   );
 }