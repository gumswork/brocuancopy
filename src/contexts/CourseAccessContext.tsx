import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseAccessLevel } from "@/types/course";

type BuyerAccessType = 'basic' | 'pro' | 'ebook' | 'mindcare';

interface CourseAccessState {
  email: string | null;
  accessType: BuyerAccessType | null;
  isLoading: boolean;
}

interface CourseAccessContextType extends CourseAccessState {
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasProAccess: boolean;
  hasBasicAccess: boolean;
  canAccessCourse: (accessLevel: CourseAccessLevel) => boolean;
}

const CourseAccessContext = createContext<CourseAccessContextType | undefined>(undefined);

const STORAGE_KEY = "course_access_email";
 const STORAGE_TIMESTAMP_KEY = "course_access_timestamp";
 const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Access hierarchy: pro > basic > public
const ACCESS_HIERARCHY: Record<BuyerAccessType, number> = {
  pro: 3,
  basic: 2,
  ebook: 1,
  mindcare: 1,
};

const COURSE_ACCESS_LEVEL_REQUIREMENT: Record<CourseAccessLevel, number> = {
  public: 0,
  basic: 2,
  pro: 3,
};

export function CourseAccessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CourseAccessState>({
    email: null,
    accessType: null,
    isLoading: true,
  });

  // Check session on mount
  useEffect(() => {
     const storedEmail = localStorage.getItem(STORAGE_KEY);
     const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
     
     // Check if session is still valid (within 7 days)
     const isSessionValid = storedTimestamp && 
       (Date.now() - parseInt(storedTimestamp, 10)) < SESSION_DURATION_MS;
     
     if (storedEmail && isSessionValid) {
      verifyAccess(storedEmail);
    } else {
       // Clear expired session
       localStorage.removeItem(STORAGE_KEY);
       localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyAccess = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email exists in buyers table
      const { data, error } = await supabase
        .from("buyers")
        .select("email, access_type")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error("Error checking access:", error);
        setState({ email: null, accessType: null, isLoading: false });
        return { success: false, error: "Terjadi kesalahan saat memverifikasi akses" };
      }

      if (!data) {
        setState({ email: null, accessType: null, isLoading: false });
        return { 
          success: false, 
          error: "Email tidak ditemukan. Pastikan Anda menggunakan email yang terdaftar saat pembelian." 
        };
      }

      // Accept any valid access type (basic, pro, ebook, mindcare)
      const accessType = data.access_type as BuyerAccessType;
      
      // Success - save to session and state
       localStorage.setItem(STORAGE_KEY, normalizedEmail);
       localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      setState({ 
        email: normalizedEmail, 
        accessType: accessType, 
        isLoading: false 
      });
      
      return { success: true };
    } catch (err) {
      console.error("Unexpected error:", err);
      setState({ email: null, accessType: null, isLoading: false });
      return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
    }
  };

  const login = async (email: string) => {
    return verifyAccess(email);
  };

  const logout = () => {
     localStorage.removeItem(STORAGE_KEY);
     localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    setState({ email: null, accessType: null, isLoading: false });
  };

  const hasProAccess = state.accessType === "pro";
  const hasBasicAccess = state.accessType === "basic" || state.accessType === "pro";

  const canAccessCourse = (accessLevel: CourseAccessLevel): boolean => {
    // Public courses are always accessible
    if (accessLevel === 'public') return true;
    
    // If not logged in, can only access public courses
    if (!state.accessType) return false;
    
    const userLevel = ACCESS_HIERARCHY[state.accessType] || 0;
    const requiredLevel = COURSE_ACCESS_LEVEL_REQUIREMENT[accessLevel];
    
    return userLevel >= requiredLevel;
  };

  return (
    <CourseAccessContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasProAccess,
        hasBasicAccess,
        canAccessCourse,
      }}
    >
      {children}
    </CourseAccessContext.Provider>
  );
}

export function useCourseAccess() {
  const context = useContext(CourseAccessContext);
  if (context === undefined) {
    throw new Error("useCourseAccess must be used within a CourseAccessProvider");
  }
  return context;
}
