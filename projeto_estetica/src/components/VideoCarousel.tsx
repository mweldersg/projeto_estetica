"use client";

import { useState } from "react";
import type { Video } from "@/lib/mock-data";
import InstagramEmbed from "./InstagramEmbed";

interface Props {
  videos: Video[];
}

export default function VideoCarousel({ videos }: Props) {
  const [index, setIndex] = useState(0);
  const total = videos.length;

  function prev() {
    setIndex((index - 1 + total) % total);
  }

  function next() {
    setIndex((index + 1) % total);
  }

  if (total === 0) {
    return <p className="text-center text-garage-muted">Em breve.</p>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
        <button
          onClick={prev}
          aria-label="Vídeo anterior"
          className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border border-garage-border bg-garage-dark text-garage-muted hover:text-garage-red hover:border-garage-red transition-colors flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="min-w-0 shrink-0">
          <InstagramEmbed key={videos[index].id} url={videos[index].instagramUrl} />
        </div>

        <button
          onClick={next}
          aria-label="Próximo vídeo"
          className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border border-garage-border bg-garage-dark text-garage-muted hover:text-garage-red hover:border-garage-red transition-colors flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="text-center mt-8 w-full">
        <p className="text-lg font-semibold">{videos[index].title}</p>
        <p className="text-garage-muted text-sm mt-1">
          {index + 1} / {total}
        </p>
      </div>
    </div>
  );
}
