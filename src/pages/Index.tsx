import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ExternalLink, BookOpen, Video, Zap, Users, FileText, GraduationCap } from "lucide-react";
import { DynamicHomepage } from "@/components/public/DynamicHomepage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Check if dynamic homepage has content
function useDynamicHomepageCheck() {
  return useQuery({
    queryKey: ['homepage-sections-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('id')
        .eq('is_visible', true)
        .limit(1);
      
      if (error) return false;
      return data && data.length > 0;
    },
  });
}

const Index = () => {
  const { data: hasDynamicContent, isLoading } = useDynamicHomepageCheck();

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If dynamic content exists, use DynamicHomepage
  if (hasDynamicContent) {
    return <DynamicHomepage />;
  }

  // Fallback to static content
  return <StaticHomepage />;
};

function StaticHomepage() {
  const groups = [
    {
      title: "Grup Riset Kalodata",
      description: "Bergabung dengan komunitas riset data terkini",
      link: "https://t.me/risetkalodata",
      icon: Users,
    },
    {
      title: "Grup Support AI Update",
      description: "Dapatkan update terbaru seputar AI tools",
      link: "https://chat.whatsapp.com/D5qE5KUuTmJ9jkP6AFrShF",
      icon: Zap,
    },
  ];

  const ebooks = [
    {
      title: "E-Book 100 Juta Pertama Affiliate",
      description: "Panduan lengkap meraih penghasilan pertama dari affiliate",
      link: "https://www.canva.com/design/DAGjRIPHGL0/f-crYkt0XrGPD-g1uKy7hQ/edit?utm_content=DAGjRIPHGL0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
      icon: BookOpen,
    },
    {
      title: "Panduan Komunitas TikTok",
      description: "Memahami guidelines dan strategi konten TikTok",
      link: "https://www.tiktok.com/community-guidelines/id?lang=id-id",
      icon: FileText,
    },
  ];

  const tools = [
    {
      title: "Tools Brocuan PRO",
      description: "Tools premium dengan fitur advanced dan support prioritas",
      link: "https://gemini.google.com/share/0d1949f2b43f",
      badge: "PRO",
    },
    {
      title: "Tools Brocuan",
      description: "Akses tools AI standar untuk produktivitas maksimal",
      link: "https://gemini.google.com/share/13dbcd7b1e22",
      badge: "Basic",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Selamat Datang di AI Tools Brocuan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Semua tools, trik, tutorial, dan komunitas eksklusif dalam satu tempat. Maksimalkan profit Anda dengan teknologi AI terdepan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Masuk ke Course
                </Button>
              </Link>
              <Button 
                size="lg" 
                className="shadow-glow-purple hover:shadow-glow-blue transition-all duration-300 hover:scale-105 animate-glow-pulse text-lg px-8 py-6"
                onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Masuk ke Tools Brocuan
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Akses Cepat Grup & Komunitas
            </span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Bergabung dengan komunitas eksklusif untuk sharing insight dan update terbaru
          </p>
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-delay">
            {groups.map((group, index) => (
              <Card 
                key={index}
                className="group p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-purple cursor-pointer"
                onClick={() => window.open(group.link, '_blank')}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:shadow-glow-purple transition-all">
                    <group.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {group.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{group.description}</p>
                    <Button variant="ghost" className="gap-2 p-0 h-auto hover:text-primary">
                      Gabung Sekarang <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* E-Course Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              E-Course Eksklusif
            </span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Pelajari berbagai materi eksklusif untuk meningkatkan skill dan profit Anda
          </p>
          <Card className="group p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-purple">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-lg bg-primary/10 text-primary group-hover:shadow-glow-purple transition-all">
                <GraduationCap className="h-12 w-12" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  Akses Semua Course
                </h3>
                <p className="text-muted-foreground">
                  Dapatkan akses ke video tutorial, panduan lengkap, dan materi pembelajaran eksklusif
                </p>
              </div>
              <Link to="/courses">
                <Button size="lg" className="gap-2 shadow-glow-purple hover:shadow-glow-blue transition-all">
                  Lihat Course
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* E-Books Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              E-Book & Panduan Eksklusif
            </span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Akses panduan lengkap untuk memaksimalkan hasil dari strategi affiliate dan konten
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {ebooks.map((ebook, index) => (
              <Card 
                key={index}
                className="group p-6 bg-card border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-glow-blue cursor-pointer"
                onClick={() => window.open(ebook.link, '_blank')}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10 text-secondary group-hover:shadow-glow-blue transition-all">
                    <ebook.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-secondary transition-colors">
                      {ebook.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{ebook.description}</p>
                    <Button variant="ghost" className="gap-2 p-0 h-auto hover:text-secondary">
                      Baca Sekarang <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorial Video Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Tutorial & Cara Akses
            </span>
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Pelajari cara mengakses dan memaksimalkan semua fitur Brocuan
          </p>
          <Card className="p-2 bg-card border-border overflow-hidden mb-8">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/5i7RGUa6kWY"
                title="Cara Masuk Brocuan"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
          
          <h3 className="text-xl md:text-2xl font-semibold mb-4 text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Playlist Tutorial Lengkap
            </span>
          </h3>
          <Card className="p-2 bg-card border-border overflow-hidden">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/videoseries?list=PLzWi274rRUmlpW9cR2j7OFO47kbfGPD2S"
                title="Playlist Tutorial Brocuan"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools-section" className="container mx-auto px-4 py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Tools Brocuan
            </span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Pilih versi tools yang sesuai dengan kebutuhan Anda
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {tools.map((tool, index) => (
              <Card 
                key={index}
                className="group p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-purple cursor-pointer relative overflow-hidden"
                onClick={() => window.open(tool.link, '_blank')}
              >
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tool.badge === 'PRO' 
                      ? 'bg-gradient-primary text-white shadow-glow-purple' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {tool.badge}
                  </span>
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-primary/10 text-primary group-hover:shadow-glow-purple transition-all">
                    <Zap className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <Button 
                  className={`w-full gap-2 ${
                    tool.badge === 'PRO' 
                      ? 'shadow-glow-purple hover:shadow-glow-blue' 
                      : ''
                  }`}
                  variant={tool.badge === 'PRO' ? 'default' : 'outline'}
                >
                  Akses Tools <ExternalLink className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              AI Tools Brocuan
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Portal eksklusif untuk memaksimalkan profit dengan teknologi AI terdepan
            </p>
            <div className="flex justify-center gap-6 mb-8">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 AI Tools Brocuan. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Index;
