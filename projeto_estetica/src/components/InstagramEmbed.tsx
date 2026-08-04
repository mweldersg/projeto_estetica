export default function InstagramEmbed({ url }: { url: string }) {
  // Vamos confirmar no terminal do navegador se o link está chegando intacto!
  console.log("Link do Instagram chegando no iFrame:", url);

  return (
    <iframe
      src={url}
      width={320}
      height={540}
      loading="lazy"
      frameBorder="0"
      scrolling="no"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      title="Vídeo do Instagram"
      className="w-[320px] max-w-full h-[540px] rounded-2xl border border-garage-border shadow-lg"
    />
  )
}