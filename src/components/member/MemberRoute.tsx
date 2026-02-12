import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { MemberLayout } from "./MemberLayout";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberRoute() {
  const { email, accessType, isLoading } = useCourseAccess();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!email || !accessType) {
    return <Navigate to="/courses/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <MemberLayout>
      <Outlet />
    </MemberLayout>
  );
}
