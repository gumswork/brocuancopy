import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CourseForm } from '@/components/admin/CourseForm';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { SortableCourseCard } from '@/components/admin/SortableCourseCard';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useReorderCourses } from '@/hooks/useCourses';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BookOpen } from 'lucide-react';

export default function AdminCourses() {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const reorderCourses = useReorderCourses();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreate = () => {
    setEditingCourse(null);
    setFormOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormOpen(true);
  };

  const handleDelete = (course: Course) => {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: { title: string; description: string; thumbnail_url: string; is_published: boolean }) => {
    if (editingCourse) {
      await updateCourse.mutateAsync({ id: editingCourse.id, ...data });
    } else {
      const nextOrder = courses?.length || 0;
      await createCourse.mutateAsync({ ...data, order_index: nextOrder });
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCourse) {
      await deleteCourse.mutateAsync(deletingCourse.id);
      setDeleteDialogOpen(false);
      setDeletingCourse(null);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    await updateCourse.mutateAsync({ id: course.id, is_published: !course.is_published });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && courses) {
      const oldIndex = courses.findIndex((c) => c.id === active.id);
      const newIndex = courses.findIndex((c) => c.id === over.id);
      
      const reorderedCourses = arrayMove(courses, oldIndex, newIndex);
      const updates = reorderedCourses.map((course, index) => ({
        id: course.id,
        order_index: index,
      }));
      
      reorderCourses.mutate(updates);
    }
  };

  return (
    <AdminLayout title="Kelola Courses">
      <div className="mb-6">
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Course
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada course</h3>
            <p className="text-muted-foreground mb-4">Mulai dengan membuat course pertama Anda</p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Course
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
            items={courses?.map(c => c.id) || []}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses?.map((course) => (
                <SortableCourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                  onClick={(c) => navigate(`/admin/courses/${c.id}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CourseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        onSubmit={handleFormSubmit}
        isLoading={createCourse.isPending || updateCourse.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Course"
        description={`Apakah Anda yakin ingin menghapus course "${deletingCourse?.title}"? Semua modul dan materi di dalamnya juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCourse.isPending}
      />
    </AdminLayout>
  );
}