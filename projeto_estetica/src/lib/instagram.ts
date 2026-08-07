export function formatInstagramEmbedUrl(rawUrl: string): string {
  const processed = rawUrl.trim()
    .split('?')[0]
    .replace(/\/+$/, '')
    .replace(/\/reel\//, '/p/')
  
  return processed.endsWith('/embed/') ? processed : `${processed}/embed/`
}
