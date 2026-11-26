/** Decorative 4-point star. Only inside a `brand` card. */
export function BrandSparkle() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      fill="currentColor"
      className="pointer-events-none absolute -top-10 -right-4 size-72 text-brand-strong"
    >
      <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" />
    </svg>
  );
}
