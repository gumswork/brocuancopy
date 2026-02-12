import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import type { Material } from "@/types/course";

interface MaterialRendererProps {
  material: Material;
}

function extractVideoId(url: string): { type: "youtube" | "vimeo" | null; id: string | null } {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return { type: "youtube", id: match[1] };
  }

  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) return { type: "vimeo", id: vimeoMatch[1] };

  return { type: null, id: null };
}

function VideoSection({ mediaUrl, title }: { mediaUrl: string; title: string }) {
  const videoInfo = extractVideoId(mediaUrl);

  if (!videoInfo.id) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Play className="h-5 w-5" />
          <span>Video tidak tersedia</span>
        </div>
      </div>
    );
  }

  const embedUrl =
    videoInfo.type === "youtube"
      ? `https://www.youtube.com/embed/${videoInfo.id}`
      : `https://player.vimeo.com/video/${videoInfo.id}`;

  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <iframe
        className="w-full h-full"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function TextSection({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <p className="text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}

function ButtonSection({ buttonText, buttonUrl }: { buttonText: string; buttonUrl: string }) {
  return (
    <Button
      className="gap-2 shadow-glow-purple hover:shadow-glow-blue transition-all"
      onClick={() => window.open(buttonUrl, "_blank")}
    >
      {buttonText || "Buka Link"}
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
}

export function MaterialRenderer({ material }: MaterialRendererProps) {
  const hasVideo = !!material.media_url;
  const hasText = !!material.content;
  const hasButton = !!material.button_url;

  // Check if any content exists
  if (!hasVideo && !hasText && !hasButton) {
    return null;
  }

  return (
    <Card id={`material-${material.id}`} className="overflow-hidden bg-card border-border scroll-mt-20">
      {/* Header with title */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold">{material.title}</h3>
      </div>

      {/* Content sections - rendered in order: video, text, button */}
      <div className="p-4 space-y-6">
        {/* Video Section */}
        {hasVideo && (
          <VideoSection mediaUrl={material.media_url!} title={material.title} />
        )}

        {/* Text Section */}
        {hasText && (
          <TextSection content={material.content!} />
        )}

        {/* Button Section */}
        {hasButton && (
          <ButtonSection 
            buttonText={material.button_text || "Buka Link"} 
            buttonUrl={material.button_url!} 
          />
        )}
      </div>
    </Card>
  );
}
