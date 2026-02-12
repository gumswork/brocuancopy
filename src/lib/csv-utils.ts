 import { Buyer, BuyerInput, AccessType } from '@/hooks/useBuyers';
 
 const ACCESS_TYPES: AccessType[] = ['basic', 'pro', 'ebook', 'mindcare'];
 
 export function buyersToCSV(buyers: Buyer[]): string {
   const headers = ['email', 'name', 'product_title', 'access_type', 'amount', 'ref_id', 'purchased_at'];
   
   const rows = buyers.map(buyer => [
     escapeCsvField(buyer.email),
     escapeCsvField(buyer.name),
     escapeCsvField(buyer.product_title),
     buyer.access_type,
     buyer.amount || '',
     buyer.ref_id || '',
     buyer.purchased_at,
   ].join(','));
 
   return [headers.join(','), ...rows].join('\n');
 }
 
 function escapeCsvField(field: string): string {
   if (field.includes(',') || field.includes('"') || field.includes('\n')) {
     return `"${field.replace(/"/g, '""')}"`;
   }
   return field;
 }
 
 export function downloadCSV(content: string, filename: string) {
   const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
   const link = document.createElement('a');
   const url = URL.createObjectURL(blob);
   link.setAttribute('href', url);
   link.setAttribute('download', filename);
   link.style.visibility = 'hidden';
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
 }
 
 export interface CSVParseResult {
   success: BuyerInput[];
   errors: { row: number; error: string }[];
 }
 
 export function parseCSV(content: string): CSVParseResult {
   const lines = content.split(/\r?\n/).filter(line => line.trim());
   
   if (lines.length < 2) {
     return { success: [], errors: [{ row: 0, error: 'File CSV kosong atau tidak memiliki data' }] };
   }
 
   const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
   
   const emailIdx = headers.indexOf('email');
   const nameIdx = headers.indexOf('name');
   const productIdx = headers.indexOf('product_title');
   const accessIdx = headers.indexOf('access_type');
   const amountIdx = headers.indexOf('amount');
   const refIdIdx = headers.indexOf('ref_id');
   const purchasedIdx = headers.indexOf('purchased_at');
 
   if (emailIdx === -1 || nameIdx === -1 || productIdx === -1) {
     return { 
       success: [], 
       errors: [{ row: 0, error: 'Header wajib: email, name, product_title' }] 
     };
   }
 
   const success: BuyerInput[] = [];
   const errors: { row: number; error: string }[] = [];
 
   for (let i = 1; i < lines.length; i++) {
     const values = parseCSVLine(lines[i]);
     
     const email = values[emailIdx]?.trim();
     const name = values[nameIdx]?.trim();
     const productTitle = values[productIdx]?.trim();
     const accessType = (values[accessIdx]?.trim().toLowerCase() || 'basic') as AccessType;
     const amount = amountIdx !== -1 ? values[amountIdx]?.trim() || null : null;
     const refId = refIdIdx !== -1 ? values[refIdIdx]?.trim() || null : null;
     const purchasedAt = purchasedIdx !== -1 ? values[purchasedIdx]?.trim() || undefined : undefined;
 
     if (!email || !name || !productTitle) {
       errors.push({ row: i + 1, error: 'Email, name, dan product_title wajib diisi' });
       continue;
     }
 
     if (!ACCESS_TYPES.includes(accessType)) {
       errors.push({ row: i + 1, error: `access_type tidak valid: ${accessType}. Harus: ${ACCESS_TYPES.join(', ')}` });
       continue;
     }
 
     success.push({
       email,
       name,
       product_title: productTitle,
       access_type: accessType,
       amount,
       ref_id: refId,
       purchased_at: purchasedAt,
     });
   }
 
   return { success, errors };
 }
 
 function parseCSVLine(line: string): string[] {
   const result: string[] = [];
   let current = '';
   let inQuotes = false;
 
   for (let i = 0; i < line.length; i++) {
     const char = line[i];
     
     if (char === '"') {
       if (inQuotes && line[i + 1] === '"') {
         current += '"';
         i++;
       } else {
         inQuotes = !inQuotes;
       }
     } else if (char === ',' && !inQuotes) {
       result.push(current);
       current = '';
     } else {
       current += char;
     }
   }
   
   result.push(current);
   return result;
 }