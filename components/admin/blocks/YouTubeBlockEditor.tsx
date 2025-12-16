"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { YouTubeVideoBlockPayload } from '@/lib/blocks/types';

interface YouTubeBlockEditorProps {
  initialPayload?: YouTubeVideoBlockPayload;
  onChange: (payload: YouTubeVideoBlockPayload) => void;
}

/**
 * Editor de bloco youtube_video (NÃO usa Lexical)
 */
export default function YouTubeBlockEditor({
  initialPayload,
  onChange,
}: YouTubeBlockEditorProps) {
  const [url, setUrl] = useState(initialPayload?.url || '');
  const [videoId, setVideoId] = useState(initialPayload?.videoId || '');

  // Extrair videoId da URL
  useEffect(() => {
    if (url && !videoId) {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (match && match[1]) {
        setVideoId(match[1]);
      }
    }
  }, [url, videoId]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    const match = newUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const extractedVideoId = match && match[1] ? match[1] : '';
    
    setVideoId(extractedVideoId);
    
    onChange({
      videoId: extractedVideoId,
      url: newUrl,
      thumbnail: extractedVideoId ? `https://img.youtube.com/vi/${extractedVideoId}/maxresdefault.jpg` : undefined,
    });
  };

  return (
    <div className="youtube-block-editor space-y-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="youtube-url">URL do YouTube</Label>
        <Input
          id="youtube-url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Cole a URL completa do vídeo do YouTube
        </p>
      </div>

      {videoId && (
        <div className="mt-4">
          <div className="aspect-video bg-gray-100 rounded border overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}


