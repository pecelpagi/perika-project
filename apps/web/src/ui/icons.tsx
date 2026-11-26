const PATHS = {
  home: "M3 11 12 4l9 7M5 10v10h14V10",
  record: "M12 5v14M5 12h14",
  transactions: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  budget: "M3 7h18v12H3zM3 11h18M16 15h2",
  gold: "M4 18l2-6h5l2 6zM12 18l2-6h5l2 6zM8 12l2-6h5l2 6",
  freedom: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm4 5-2 6-6 2 2-6z",
  coach: "M4 5h16v11H9l-5 4z",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  back: "M15 5l-7 7 7 7",
  close: "M6 6l12 12M18 6 6 18",
  chevron: "M9 5l7 7-7 7",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  logout: "M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "more" ? 3 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
