import { useState, useEffect } from "react";
import { useCourseAccess } from "@/contexts/CourseAccessContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Crown, Users, Save, Loader2 } from "lucide-react";

export default function Profile() {
  const { email, accessType, hasProAccess, hasBasicAccess } = useCourseAccess();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current name from buyers table
  useEffect(() => {
    async function loadProfile() {
      if (!email) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("buyers")
          .select("name")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setName(data.name);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Gagal memuat profil");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [email]);

  const handleSave = async () => {
    if (!email) return;
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("buyers")
        .update({ name: name.trim() })
        .eq("email", email.toLowerCase().trim());

      if (error) throw error;
      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  const getAccessBadge = () => {
    if (hasProAccess) {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
          <Crown className="h-3 w-3" />
          PRO
        </Badge>
      );
    }
    if (hasBasicAccess) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          Basic
        </Badge>
      );
    }
    if (accessType) {
      return (
        <Badge variant="secondary" className="gap-1">
          {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-2">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Akun
          </CardTitle>
          <CardDescription>
            Perbarui nama tampilan Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
          </div>

          {/* Name (editable) */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nama
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              maxLength={100}
            />
          </div>

          {/* Access Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Tipe Akses
            </Label>
            <div className="flex items-center gap-2">
              {getAccessBadge()}
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
