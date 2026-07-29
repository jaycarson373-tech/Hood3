"use client";

import Image from "next/image";
import { Share2 } from "lucide-react";

const memes = [
  {
    title: "Risk-adjusted rodent",
    caption: "When the fund manager is small but the mandate is perpetual.",
    image: "/hedge-logo.jpg",
  },
  {
    title: "Quarterly outlook",
    caption: "We hedge. We grow. We invoice absolutely nobody.",
    image: "/hedge-banner.jpg",
  },
  {
    title: "Institutional allocation",
    caption: "The investment committee has approved more snacks.",
    image: "/hedge-logo.jpg",
  },
];

export function MemeGallery() {
  async function share(title: string, caption: string) {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text: caption, url });
      return;
    }
    await navigator.clipboard.writeText(`${caption} ${url}`);
  }

  return (
    <div className="meme-grid">
      {memes.map((meme, index) => (
        <article key={meme.title}>
          <div className={`meme-image meme-image-${index + 1}`}>
            <Image
              src={meme.image}
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 33vw"
            />
          </div>
          <div>
            <span>{meme.title}</span>
            <p>{meme.caption}</p>
            <button
              type="button"
              onClick={() => void share(meme.title, meme.caption)}
              aria-label={`Share ${meme.title}`}
            >
              <Share2 size={15} aria-hidden="true" />
              Share
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
