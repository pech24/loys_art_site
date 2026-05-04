/**
 * Utility to convert common media hosting links (Google Drive, Imgur, Dropbox) 
 * into direct-link formats that work in <img> and <video> tags.
 */
export const getDirectMediaUrl = (url: string): string => {
  if (!url) return '';
  
  let processedUrl = url.trim();

  // Imgur: Convert viewer page to direct image link
  // Handles: imgur.com/abc -> i.imgur.com/abc.png
  // Does NOT handle albums (e.g. imgur.com/a/...) as those contain multiple images
  if (processedUrl.includes('imgur.com/') && !processedUrl.includes('i.imgur.com/') && !processedUrl.includes('/a/')) {
    const parts = processedUrl.split('/');
    const id = parts[parts.length - 1];
    if (id) {
      return `https://i.imgur.com/${id}.png`;
    }
  }

  // Google Drive: Convert share link to direct download link
  // Handles: drive.google.com/file/d/ID/view
  if (processedUrl.includes('drive.google.com/file/d/')) {
    const match = processedUrl.match(/\/d\/([^/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }

  // Dropbox: Convert share link to raw direct link
  // Handles: dropbox.com/s/ID/name?dl=0
  if (processedUrl.includes('dropbox.com/') && processedUrl.includes('?dl=0')) {
    return processedUrl.replace('?dl=0', '?raw=1');
  }

  return processedUrl;
};

/**
 * Extracts YouTube Video ID from various URL formats.
 */
export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/\s]{11})/);
  return match ? match[1] : null;
};

/**
 * Converts a YouTube URL into an embeddable URL.
 */
export const getYoutubeEmbedUrl = (url: string): string | null => {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

/**
 * Gets a high-quality thumbnail for a YouTube video.
 */
export const getYoutubeThumbnail = (url: string): string | null => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
};

/**
 * Check if a URL is a YouTube link.
 */
export const isYoutubeUrl = (url: string): boolean => {
  return !!getYoutubeId(url);
};

/**
 * More robust check to see if a URL points to a video.
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  if (isYoutubeUrl(url)) return true;
  const lowerUrl = url.toLowerCase();
  
  // Check extensions
  if (
    lowerUrl.endsWith('.mp4') || 
    lowerUrl.endsWith('.webm') || 
    lowerUrl.endsWith('.mov') || 
    lowerUrl.endsWith('.ogv')
  ) {
    return true;
  }

  // Check common video hosting indicators
  if (lowerUrl.includes('storage.googleapis.com') && lowerUrl.includes('video')) return true;
  if (lowerUrl.includes('firebasestorage.googleapis.com') && (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('alt=media&token='))) {
      // Small hack: if it's firebase storage and we suspect it's video
      // This is usually handled better by metadata but here we guess
  }

  return false;
};
