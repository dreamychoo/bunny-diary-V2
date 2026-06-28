import { cn } from "./ui/utils";

export type MascotVariant = "reading" | "comfort" | "warmth" | "empty" | "writing" | "garden" | "sleep" | "memory" | "waiting" | "listening" | "happy";

type MascotProps = {
  variant?: MascotVariant;
  className?: string;
  assetSrc?: string | null;
  title?: string;
  usePlaceholder?: boolean;
};

const defaultMascotAssets: Record<MascotVariant, string> = {
  reading: "/assets/v2/rabbits/reading.png",
  writing: "/assets/v2/rabbits/writing.png",
  listening: "/assets/v2/rabbits/reading.png",
  comfort: "/assets/v2/rabbits/holding-lantern.png",
  happy: "/assets/v2/rabbits/cheering.png",
  warmth: "/assets/v2/rabbits/holding-mug.png",
  memory: "/assets/v2/rabbits/sitting.png",
  garden: "/assets/v2/rabbits/watering.png",
  waiting: "/assets/v2/rabbits/sitting.png",
  empty: "/assets/v2/rabbits/sitting.png",
  sleep: "/assets/v2/rabbits/sleeping.png"
};

const moodMarks: Partial<Record<MascotVariant, React.ReactNode>> = {
  reading: <path d="M112 103l4 4 4-4" />,
  comfort: <path d="M112 104c3-4 8-4 11 0" />,
  warmth: <path d="M111 103c2-4 6-4 8 0 2-4 6-4 8 0-3 5-6 8-8 10-2-2-5-5-8-10Z" />,
  empty: <path d="M112 107h12" />
};

export function Mascot({ variant = "reading", className, assetSrc, title, usePlaceholder = false }: MascotProps) {
  const resolvedAsset = assetSrc === null ? null : assetSrc ?? defaultMascotAssets[variant];

  if (!usePlaceholder && resolvedAsset) {
    return <img src={resolvedAsset} alt={title ?? ""} className={cn("bunny-cutout block h-auto w-full object-contain", className)} aria-hidden={!title} />;
  }

  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={!title}
      className={cn("block h-auto w-full text-[#4a3b34]", className)}
    >
      {title && <title>{title}</title>}
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 45c-7-20-4-34 4-35 8-1 12 15 10 32" />
        <path d="M82 42c2-21 9-34 17-31 8 3 4 20-6 34" />
        <path d="M43 62c4-16 19-24 36-21 19 3 33 18 30 37-3 18-18 30-38 30-21 0-34-12-33-29 .4-7 2-12 5-17Z" />
        <path d="M56 72c3-2 6-2 9 0" />
        <path d="M81 72c3-2 6-2 9 0" />
        <path d="M67 84c4 3 8 3 12 0" strokeWidth="3" />
        <path d="M47 108c6-8 15-12 25-12 11 0 21 5 26 13" />
        <path d="M36 101c13-6 25-5 36 4v22c-12-8-24-9-36-4v-22Z" />
        <path d="M105 101c-13-6-24-5-35 4v22c12-8 24-9 35-4v-22Z" />
        <path d="M70 106v21" strokeWidth="3" />
        <path d="M39 124c-7 4-13 1-13-5" strokeWidth="3" />
        <path d="M102 124c7 4 13 1 13-5" strokeWidth="3" />
      </g>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.58">
        {moodMarks[variant] ?? moodMarks.reading}
      </g>
    </svg>
  );
}
