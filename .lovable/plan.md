
# Rencana: Fitur Admin Homepage Management

## Ringkasan
Membuat sistem CMS dinamis untuk mengelola semua elemen di homepage. Admin dapat menambah, mengupdate, menghapus, dan mengatur urutan elemen-elemen homepage melalui panel admin.

---

## Elemen Homepage Yang Akan Dikelola

| Tipe Elemen | Keterangan | Properti |
|-------------|------------|----------|
| **Section** | Kontainer utama untuk mengelompokkan elemen | title, background_style, order |
| **Heading** | H1-H6 | level (1-6), text, gradient_style |
| **Paragraph** | Teks deskripsi | text, alignment, max_width |
| **Button** | Tombol aksi | text, link, variant (primary/outline), size |
| **Card** | Kartu dengan konten | title, description, link, icon, badge |
| **Video** | Embed YouTube | youtube_url, title |
| **Card Group** | Kumpulan card dalam grid | layout (2-col, 3-col) |

---

## Struktur Database

### Tabel: `homepage_sections`
```text
┌─────────────────────────────────────────────────────────────┐
│ homepage_sections                                           │
├─────────────────────────────────────────────────────────────┤
│ id            UUID (PK)                                     │
│ name          TEXT - Nama section (untuk identifikasi)      │
│ title         TEXT - Judul section (nullable)               │
│ subtitle      TEXT - Subtitle/paragraph (nullable)          │
│ background    TEXT - 'default', 'muted', 'gradient'         │
│ order_index   INTEGER - Urutan tampil                       │
│ is_visible    BOOLEAN - Tampilkan/sembunyikan               │
│ created_at    TIMESTAMPTZ                                   │
│ updated_at    TIMESTAMPTZ                                   │
└─────────────────────────────────────────────────────────────┘
```

### Tabel: `homepage_elements`
```text
┌─────────────────────────────────────────────────────────────┐
│ homepage_elements                                           │
├─────────────────────────────────────────────────────────────┤
│ id            UUID (PK)                                     │
│ section_id    UUID (FK → homepage_sections)                 │
│ type          ENUM - 'heading','paragraph','button',        │
│                      'card','video','card_group'            │
│ content       JSONB - Properti sesuai tipe elemen           │
│ order_index   INTEGER - Urutan dalam section                │
│ is_visible    BOOLEAN - Tampilkan/sembunyikan               │
│ created_at    TIMESTAMPTZ                                   │
│ updated_at    TIMESTAMPTZ                                   │
└─────────────────────────────────────────────────────────────┘
```

### Contoh Struktur JSONB `content` per Tipe:

```text
heading:    { "level": 1, "text": "...", "gradient": true }
paragraph:  { "text": "...", "centered": true }
button:     { "text": "...", "link": "...", "variant": "primary", "icon": "ExternalLink" }
card:       { "title": "...", "description": "...", "link": "...", "icon": "Users", "badge": "PRO" }
video:      { "youtube_url": "...", "title": "..." }
card_group: { "layout": "2-col", "items": [{card}, {card}] }
```

---

## File Yang Akan Dibuat/Dimodifikasi

### File Baru:
| File | Keterangan |
|------|------------|
| `src/pages/admin/Homepage.tsx` | Halaman utama admin homepage |
| `src/components/admin/SectionForm.tsx` | Form untuk section |
| `src/components/admin/ElementForm.tsx` | Form untuk elemen |
| `src/components/admin/SortableSectionCard.tsx` | Card section dengan drag-drop |
| `src/components/admin/SortableElementCard.tsx` | Card elemen dengan drag-drop |
| `src/components/admin/ElementPreview.tsx` | Preview elemen |
| `src/hooks/useHomepageSections.tsx` | Hook untuk fetch/mutate sections |
| `src/hooks/useHomepageElements.tsx` | Hook untuk fetch/mutate elements |
| `src/components/public/DynamicHomepage.tsx` | Render homepage dinamis |
| `src/types/homepage.ts` | Type definitions |

### File Dimodifikasi:
| File | Perubahan |
|------|-----------|
| `src/components/admin/AdminLayout.tsx` | Tambah menu "Homepage" di sidebar |
| `src/App.tsx` | Tambah route `/admin/homepage` |
| `src/pages/Index.tsx` | Gunakan DynamicHomepage component |

---

## Langkah Implementasi

### Tahap 1: Database Setup
1. Buat enum `element_type` untuk tipe elemen
2. Buat tabel `homepage_sections` dengan RLS policy
3. Buat tabel `homepage_elements` dengan RLS policy
4. Seed data awal dari homepage yang sudah ada

### Tahap 2: Types & Hooks
1. Buat type definitions di `src/types/homepage.ts`
2. Buat `useHomepageSections` hook dengan CRUD operations
3. Buat `useHomepageElements` hook dengan CRUD operations

### Tahap 3: Admin UI
1. Buat halaman `/admin/homepage` dengan list sections
2. Implementasi drag-drop untuk reorder sections
3. Buat form untuk add/edit section
4. Buat nested elements management dalam setiap section
5. Implementasi drag-drop untuk reorder elements
6. Buat form untuk add/edit element (berbeda per tipe)
7. Tambah menu "Homepage" di sidebar admin

### Tahap 4: Public Homepage
1. Buat `DynamicHomepage` component yang fetch data dari database
2. Render sections dan elements sesuai urutan
3. Fallback ke static content jika database kosong
4. Update `Index.tsx` untuk menggunakan `DynamicHomepage`

### Tahap 5: Data Migration
1. Seed sections dari struktur homepage saat ini
2. Seed elements dari data yang sudah ada (groups, ebooks, tools, dll)

---

## Alur Admin Mengelola Homepage

```text
Admin Homepage
    │
    ├── [+ Tambah Section]
    │
    ├── Section: Hero ─────────────────┐
    │   ├── 👁️ Visible  🗑️ Delete      │
    │   ├── [Edit Section]             │
    │   └── Elements:                  │
    │       ├── H1: "Selamat Datang..." 
    │       ├── P: "Semua tools..."    │
    │       ├── Button: "Masuk Course" │
    │       └── [+ Tambah Element]     │
    │                                  │
    ├── Section: Groups ───────────────┤
    │   ├── 👁️ Visible  🗑️ Delete      │
    │   ├── [Edit Section]             │
    │   └── Elements:                  │
    │       ├── Card Group (2 cards)   │
    │       └── [+ Tambah Element]     │
    │                                  │
    └── ... (sections lainnya)         │
```

---

## Fitur Tambahan

1. **Visibility Toggle** - Sembunyikan section/element tanpa hapus
2. **Drag & Drop Reorder** - Menggunakan @dnd-kit yang sudah terinstall
3. **Preview Mode** - Lihat perubahan sebelum publish
4. **Icon Picker** - Pilih icon dari Lucide icons

---

## Bagian Teknis

### RLS Policies
- **SELECT**: Semua orang bisa baca (public homepage)
- **INSERT/UPDATE/DELETE**: Hanya admin (menggunakan `has_role()`)

### TypeScript Types
```typescript
type ElementType = 'heading' | 'paragraph' | 'button' | 'card' | 'video' | 'card_group';

interface HomepageSection {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  background: 'default' | 'muted' | 'gradient';
  order_index: number;
  is_visible: boolean;
  elements?: HomepageElement[];
}

interface HomepageElement {
  id: string;
  section_id: string;
  type: ElementType;
  content: Record<string, unknown>;
  order_index: number;
  is_visible: boolean;
}
```

### JSONB Content Validation
Validasi di frontend menggunakan Zod schema per tipe elemen untuk memastikan struktur content yang benar.
