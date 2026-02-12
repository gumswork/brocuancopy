import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateAnnouncement, useUpdateAnnouncement } from "@/hooks/useAnnouncements";
import type { Announcement } from "@/hooks/useAnnouncements";

const formSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  is_published: z.boolean(),
  link_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
  link_text: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
}

export function AnnouncementForm({
  open,
  onOpenChange,
  announcement,
}: AnnouncementFormProps) {
  const isEditing = !!announcement;
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      is_published: false,
      link_url: "",
      link_text: "",
    },
  });

  useEffect(() => {
    if (announcement) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        is_published: announcement.is_published,
        link_url: announcement.link_url || "",
        link_text: announcement.link_text || "",
      });
    } else {
      form.reset({
        title: "",
        content: "",
        is_published: false,
        link_url: "",
        link_text: "",
      });
    }
  }, [announcement, form]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      content: values.content,
      is_published: values.is_published,
      link_url: values.link_url || null,
      link_text: values.link_text || null,
    };

    if (isEditing && announcement) {
      updateMutation.mutate(
        { id: announcement.id, ...payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Pengumuman" : "Tambah Pengumuman"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi pengumuman"
              : "Buat pengumuman baru untuk member"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul pengumuman" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Isi pengumuman..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Link (Opsional)</h4>
              <FormField
                control={form.control}
                name="link_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teks Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Klik di sini" {...field} />
                    </FormControl>
                    <FormDescription>
                      Teks yang akan ditampilkan untuk link
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publikasikan</FormLabel>
                    <FormDescription>
                      Pengumuman yang dipublikasikan akan terlihat oleh semua member
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : isEditing ? "Simpan" : "Buat"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
