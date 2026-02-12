import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { MemberRoute } from "@/components/member/MemberRoute";
import { CourseAccessProvider } from "@/contexts/CourseAccessContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Public Course Pages
import Courses from "./pages/Courses";
import CourseDetailPublic from "./pages/CourseDetailPublic";
import ModuleDetailPublic from "./pages/ModuleDetailPublic";
import CourseLogin from "./pages/CourseLogin";

// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberMyCourses from "./pages/member/MyCourses";
import MemberAllCourses from "./pages/member/AllCourses";
import MemberAnnouncements from "./pages/member/Announcements";
import MemberProfile from "./pages/member/Profile";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/Courses";
import AdminCourseDetail from "./pages/admin/CourseDetail";
import AdminModuleDetail from "./pages/admin/ModuleDetail";
import AdminHomepage from "./pages/admin/Homepage";
import AdminBuyers from "./pages/admin/Buyers";
import AdminAnnouncements from "./pages/admin/Announcements";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CourseAccessProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Public Course Routes */}
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/login" element={<CourseLogin />} />
              <Route path="/courses/:courseId" element={<CourseDetailPublic />} />
              <Route path="/courses/:courseId/modules/:moduleId" element={<ModuleDetailPublic />} />
              
              {/* Member Routes */}
              <Route path="/member" element={<MemberRoute />}>
                <Route index element={<MemberDashboard />} />
                <Route path="my-courses" element={<MemberMyCourses />} />
                <Route path="all-courses" element={<MemberAllCourses />} />
                <Route path="announcements" element={<MemberAnnouncements />} />
                <Route path="tools-pro" element={<div className="rounded-lg overflow-hidden border border-border"><iframe src="https://septianagum.com/tools-pro" title="Tools PRO" className="w-full min-h-[70vh] h-[calc(100vh-220px)]" loading="lazy" /></div>} />
                <Route path="tools-basic" element={<div className="rounded-lg overflow-hidden border border-border"><iframe src="https://septianagum.com/tools-basic" title="Tools Basic" className="w-full min-h-[70vh] h-[calc(100vh-220px)]" loading="lazy" /></div>} />
                <Route path="komunitas-pro" element={<div className="rounded-lg overflow-hidden border border-border"><iframe src="https://septianagum.com/komunitas-pro" title="Komunitas PRO" className="w-full min-h-[70vh] h-[calc(100vh-220px)]" loading="lazy" /></div>} />
                <Route path="komunitas-basic" element={<div className="rounded-lg overflow-hidden border border-border"><iframe src="https://septianagum.com/komunitas-basic" title="Komunitas Basic" className="w-full min-h-[70vh] h-[calc(100vh-220px)]" loading="lazy" /></div>} />
                <Route path="profile" element={<MemberProfile />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboard />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:courseId" element={<AdminCourseDetail />} />
                <Route path="courses/:courseId/modules/:moduleId" element={<AdminModuleDetail />} />
                <Route path="buyers" element={<AdminBuyers />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CourseAccessProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
