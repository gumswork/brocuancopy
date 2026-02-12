import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import {
  useAdminAnnouncements,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "@/hooks/useAnnouncements";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Announcement } from "@/hooks/useAnnouncements";

export default function AdminAnnouncements() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcements, isLoading } = useAdminAnnouncements();
  const deleteMutation = useDeleteAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (!deletingAnnouncement) return;
    deleteMutation.mutate(deletingAnnouncement.id, {
      onSuccess: () => setDeletingAnnouncement(null),
    });
  };

  const handleTogglePublish = (announcement: Announcement) => {
    updateMutation.mutate({
      id: announcement.id,
      is_published: !announcement.is_published,
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAnnouncement(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pengumuman</h1>
            <p className="text-muted-foreground">
              Kelola pengumuman untuk member
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Pengumuman
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {announcement.is_published ? (
                          <Badge variant="default">
                            Dipublikasikan
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <CardDescription>
                        Dibuat: {format(new Date(announcement.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                        {announcement.published_at && (
                          <> • Dipublikasikan: {format(new Date(announcement.published_at), "d MMM yyyy, HH:mm", { locale: id })}</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(announcement)}
                        disabled={updateMutation.isPending}
                        title={announcement.is_published ? "Sembunyikan" : "Publikasikan"}
                      >
                        {announcement.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingAnnouncement(announcement)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Belum Ada Pengumuman</h2>
              <p className="text-muted-foreground mb-4">
                Buat pengumuman pertama untuk member Anda.
              </p>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Pengumuman
              </Button>
            </div>
          </Card>
        )}
      </div>

      <AnnouncementForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        announcement={editingAnnouncement}
      />

      <DeleteConfirmDialog
        open={!!deletingAnnouncement}
        onOpenChange={(open) => !open && setDeletingAnnouncement(null)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman"
        description={`Apakah Anda yakin ingin menghapus pengumuman "${deletingAnnouncement?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
