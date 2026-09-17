export function YoutubeEmbed({ youtubeId, titulo }: { youtubeId: string; titulo: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-forest-900">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={titulo}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
