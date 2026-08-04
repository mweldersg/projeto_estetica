export function formatInstagramEmbedUrl(rawUrl: string): string {
  let processed = rawUrl.trim()
    .split('?')[0]
    .replace(/\/+$/, '')
    .replace(/\/reel\//, '/p/')
  
  return processed.endsWith('/embed/') ? processed : `${processed}/embed/`
}
