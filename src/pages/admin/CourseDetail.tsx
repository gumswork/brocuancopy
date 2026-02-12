import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { ModuleForm } from '@/components/admin/ModuleForm';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { SortableModuleCard } from '@/components/admin/SortableModuleCard';
import { useCourse } from '@/hooks/useCourses';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule, useReorderModules } from '@/hooks/useModules';
import { Module } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Layers } from 'lucide-react';

export default function AdminCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: modules, isLoading: modulesLoading } = useModules(courseId);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const reorderModules = useReorderModules();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreate = () => {
    setEditingModule(null);
    setFormOpen(true);
  };

  const handleEdit = (module: Module, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingModule(module);
    setFormOpen(true);
  };

  const handleDelete = (module: Module, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingModule(module);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: { title: string; description: string }) => {
    if (editingModule) {
      await updateModule.mutateAsync({ id: editingModule.id, ...data });
    } else {
      const nextOrder = modules?.length || 0;
      await createModule.mutateAsync({ 
        course_id: courseId!, 
        order_index: nextOrder,
        ...data 
      });
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingModule && courseId) {
      await deleteModule.mutateAsync({ id: deletingModule.id, courseId });
      setDeleteDialogOpen(false);
      setDeletingModule(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && modules && courseId) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      
      const reorderedModules = arrayMove(modules, oldIndex, newIndex);
      const updates = reorderedModules.map((module, index) => ({
        id: module.id,
        order_index: index,
      }));
      
      reorderModules.mutate({ courseId, modules: updates });
    }
  };

  if (courseLoading) {
    return (
      <AdminLayout title="" backLink="/admin/courses">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout title="Course Tidak Ditemukan" backLink="/admin/courses">
        <p className="text-muted-foreground">Course yang Anda cari tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={course.title} backLink="/admin/courses">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {course.description || 'Tidak ada deskripsi'}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daftar Modul</h2>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Modul
        </Button>
      </div>

      {modulesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : modules?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada modul</h3>
            <p className="text-muted-foreground mb-4">Mulai dengan membuat modul pertama</p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Modul
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
            items={modules?.map(m => m.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {modules?.map((module, index) => (
                <SortableModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={(m) => navigate(`/admin/courses/${courseId}/modules/${m.id}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ModuleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        module={editingModule}
        onSubmit={handleFormSubmit}
        isLoading={createModule.isPending || updateModule.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Modul"
        description={`Apakah Anda yakin ingin menghapus modul "${deletingModule?.title}"? Semua materi di dalamnya juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModule.isPending}
      />
    </AdminLayout>
  );
}