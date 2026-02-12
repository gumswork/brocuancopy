import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCourses } from '@/hooks/useCourses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Layers, FileText, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: courses, isLoading } = useCourses();

  const stats = [
    {
      title: 'Total Courses',
      value: courses?.length || 0,
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      title: 'Published',
      value: courses?.filter(c => c.is_published).length || 0,
      icon: Eye,
      color: 'text-green-500',
    },
    {
      title: 'Draft',
      value: courses?.filter(c => !c.is_published).length || 0,
      icon: FileText,
      color: 'text-yellow-500',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Selamat Datang di Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gunakan menu di sidebar untuk mengelola courses, modules, dan materials untuk platform e-course Brocuan.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span><strong>Courses</strong> - Kelola course utama</span>
            </li>
            <li className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span><strong>Modules</strong> - Buat modul dalam setiap course</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span><strong>Materials</strong> - Tambahkan materi (video, gambar, teks, tombol)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
