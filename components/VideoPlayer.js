import React from 'react';

// Komponen VideoPlayer untuk menampilkan video
const VideoPlayer = ({ videoUrl }) => {
  // Fungsi untuk menentukan apakah URL adalah YouTube atau Vimeo
  const getEmbedUrl = (url) => {
    // Cek apakah URL YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[4]}`;
    }
    
    // Cek apakah URL Vimeo
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[4]}`;
    }
    
    // Jika bukan YouTube atau Vimeo, kembalikan URL asli
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="video-container fade-in">
      {embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com') ? (
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Player"
          className="w-full h-full"
        ></iframe>
      ) : (
        <video
          src={embedUrl}
          controls
          className="w-full h-full"
          title="Video Player"
        >
          Browser Anda tidak mendukung tag video.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
