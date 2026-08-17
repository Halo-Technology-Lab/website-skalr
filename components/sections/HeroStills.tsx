import Image from 'next/image';

import { hero } from '@/lib/content';

const { stills } = hero.media;

/**
 * The alternative hero: the three "after" frames, crossfading.
 *
 * Rendered instead of the clip when HERO_MEDIA in Hero.tsx is set to 'stills'.
 * Deliberately a server component with a pure-CSS crossfade (.hero-frames in
 * globals.css), so choosing the stills means the hero ships no JavaScript.
 *
 * The box owns the aspect ratio and every frame is stacked inside it, so nothing
 * below moves as frames two and three arrive. Frame one is the only one opaque by
 * default, which makes it the LCP element and also what a visitor who has asked
 * for reduced motion sees on its own.
 *
 * The box is 16:9 on mobile rather than the wireframe's fixed 150px. That drawn
 * height gives a 2.36:1 letterbox at phone widths, which crops a
 * head-and-shoulders portrait to a band across the eyes.
 */
export function HeroStills() {
  return (
    <div className="hero-frames aspect-[16/9]">
      {stills.frames.map((frame, i) => (
        <Image
          key={frame.src}
          src={frame.src}
          alt={frame.alt}
          width={stills.width}
          height={stills.height}
          priority={i === 0}
          className="hero-frame"
        />
      ))}
    </div>
  );
}
