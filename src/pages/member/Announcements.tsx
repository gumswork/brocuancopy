import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicAnnouncements, useMarkAnnouncementRead } from "@/hooks/useAnnouncements";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { Bell, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Announcements() {
  const { data: announcements, isLoading } = usePublicAnnouncements();
  const { email } = useCourseAccess();
  const markAsRead = useMarkAnnouncementRead();

  // Mark all announcements as read when page is viewed
  useEffect(() => {
    if (announcements && email) {
      announcements.forEach((announcement) => {
        markAsRead.mutate({ announcementId: announcement.id, email });
      });
    }
  }, [announcements, email]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pengumuman</h1>
        <p className="text-muted-foreground">
          Informasi dan update terbaru untuk member
        </p>
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
                <Skeleton className="h-20 w-full" />
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
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    {announcement.published_at && (
                      <CardDescription>
                        {format(new Date(announcement.published_at), "EEEE, d MMMM yyyy", { locale: id })}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
                {announcement.link_url && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {announcement.link_text || "Lihat Selengkapnya"}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Belum Ada Pengumuman</h2>
            <p className="text-muted-foreground">
              Pengumuman akan muncul di sini saat tersedia.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
