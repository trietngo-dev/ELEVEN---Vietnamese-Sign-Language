import { useState, useEffect } from "react";
import { tokenStorage } from "../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface CourseImageProps {
  coverMediaId?: number | null;
  title: string;
  className?: string;
}

export default function CourseImage({ coverMediaId, title, className }: CourseImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (coverMediaId) {
      const authToken = tokenStorage.getToken();
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {};
      
      fetch(`${API_BASE_URL}/api/media_assets/${coverMediaId}`, { headers })
        .then(res => res.ok ? res.json() : null)
        .then(data => { 
          if (data?.fileUrl) setUrl(data.fileUrl); 
        })
        .catch((e) => {
          console.error("Failed to load course image", e);
          setHasError(true);
        });
    }
  }, [coverMediaId]);

  const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=3c6c44&color=fff&size=500`;

  const isVideoUrl = url && (
    url.toLowerCase().endsWith(".mp4") ||
    url.toLowerCase().endsWith(".webm") ||
    url.toLowerCase().endsWith(".ogg") ||
    url.toLowerCase().includes("/video/") ||
    url.toLowerCase().includes(".mp4?")
  );

  if (url && isVideoUrl && !hasError) {
    return (
      <video
        src={`${url}${url.includes('?') ? '' : '#t=0.1'}`}
        preload="metadata"
        muted
        playsInline
        className={className || "w-full h-full object-cover"}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <img 
      src={url && !hasError ? url : defaultUrl} 
      alt={title} 
      className={className || "w-full h-full object-cover"}
      onError={() => setHasError(true)}
    />
  );
}
