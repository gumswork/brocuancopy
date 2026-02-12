import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MaterialForm } from '@/components/admin/MaterialForm';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { SortableMaterialCard } from '@/components/admin/SortableMaterialCard';
import { useCourse } from '@/hooks/useCourses';
import { useModule, useModules } from '@/hooks/useModules';
import { useMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial, useReorderMaterials } from '@/hooks/useMaterials';
import { Material } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText } from 'lucide-react';

export default function AdminModuleDetail() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  
  const { data: course } = useCourse(courseId);
  const { data: module, isLoading: moduleLoading } = useModule(moduleId);
  const { data: allModules } = useModules(courseId); // Get all modules for move feature
  const { data: materials, isLoading: materialsLoading } = useMaterials(moduleId);
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const reorderMaterials = useReorderMaterials();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreate = () => {
    setEditingMaterial(null);
    setFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleDelete = (material: Material) => {
    setDeletingMaterial(material);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: {
    title: string;
    content?: string | null;
    media_url?: string | null;
    button_text?: string | null;
    button_url?: string | null;
    module_id?: string;
  }) => {
    if (editingMaterial) {
      const oldModuleId = editingMaterial.module_id;
      const newModuleId = data.module_id || oldModuleId;
      const isMoving = oldModuleId !== newModuleId;
      
      await updateMaterial.mutateAsync({ 
        id: editingMaterial.id, 
        title: data.title,
        content: data.content ?? null,
        media_url: data.media_url ?? null,
        button_text: data.button_text ?? null,
        button_url: data.button_url ?? null,
        module_id: newModuleId,
        oldModuleId: isMoving ? oldModuleId : undefined,
      });
    } else {
      const nextOrder = materials?.length || 0;
      await createMaterial.mutateAsync({ 
        module_id: moduleId!, 
        order_index: nextOrder,
        title: data.title,
        content: data.content ?? null,
        media_url: data.media_url ?? null,
        button_text: data.button_text ?? null,
        button_url: data.button_url ?? null,
      });
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingMaterial && moduleId) {
      await deleteMaterial.mutateAsync({ id: deletingMaterial.id, moduleId });
      setDeleteDialogOpen(false);
      setDeletingMaterial(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && materials && moduleId) {
      const oldIndex = materials.findIndex((m) => m.id === active.id);
      const newIndex = materials.findIndex((m) => m.id === over.id);
      
      const reorderedMaterials = arrayMove(materials, oldIndex, newIndex);
      const updates = reorderedMaterials.map((material, index) => ({
        id: material.id,
        order_index: index,
      }));
      
      reorderMaterials.mutate({ moduleId, materials: updates });
    }
  };

  if (moduleLoading) {
    return (
      <AdminLayout title="" backLink={`/admin/courses/${courseId}`}>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!module) {
    return (
      <AdminLayout title="Modul Tidak Ditemukan" backLink={`/admin/courses/${courseId}`}>
        <p className="text-muted-foreground">Modul yang Anda cari tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={module.title} 
      backLink={`/admin/courses/${courseId}`}
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-2">
            Course: <span className="font-medium text-foreground">{course?.title}</span>
          </p>
          <p className="text-muted-foreground">
            {module.description || 'Tidak ada deskripsi'}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daftar Materi</h2>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Materi
        </Button>
      </div>

      {materialsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : materials?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada materi</h3>
            <p className="text-muted-foreground mb-4">Mulai dengan menambahkan materi pertama</p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Materi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={materials?.map(m => m.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {materials?.map((material) => (
                <SortableMaterialCard
                  key={material.id}
                  material={material}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <MaterialForm
        open={formOpen}
        onOpenChange={setFormOpen}
        material={editingMaterial}
        modules={allModules}
        currentModuleId={moduleId}
        onSubmit={handleFormSubmit}
        isLoading={createMaterial.isPending || updateMaterial.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Materi"
        description={`Apakah Anda yakin ingin menghapus materi "${deletingMaterial?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMaterial.isPending}
      />
    </AdminLayout>
  );
}