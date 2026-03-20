interface LogoProps {
  size?: number;
  className?: string;
  /** "mark" = icon only, "full" = icon + text side by side */
  variant?: "mark" | "full";
  onClick?: () => void;
}

export function Logo({
  size = 32,
  className = "",
  variant = "mark",
  onClick,
}: LogoProps) {
  const s = size;
  // 6 outer nodes arranged in a hexagon, connected to center
  const cx = s / 2;
  const cy = s / 2;
  const R = s * 0.36; // outer ring radius
  const r = s * 0.055; // outer node radius
  const cr = s * 0.08; // center node radius
  const stroke = s * 0.04;

  const nodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return {
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
    };
  });

  // connect each node to center + connect adjacent nodes (hexagon ring)
  const lines = [
    ...nodes.map((n) => ({ x1: cx, y1: cy, x2: n.x, y2: n.y })),
    ...nodes.map((n, i) => ({
      x1: n.x,
      y1: n.y,
      x2: nodes[(i + 1) % 6].x,
      y2: nodes[(i + 1) % 6].y,
    })),
  ];

  const mark = (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === "mark" ? className : ""}
      aria-label="虚拟社区"
    >
      {/* edges */}
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.35}
          strokeLinecap="round"
        />
      ))}
      {/* outer nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={r}
          fill="currentColor"
          fillOpacity={0.6}
        />
      ))}
      {/* center node — brightest */}
      <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
    </svg>
  );

  if (variant === "full") {
    return (
      <span
        className={`inline-flex items-center gap-2 ${className}`}
        onClick={onClick}
      >
        {mark}
        <span className="font-serif font-semibold leading-none">虚拟社区</span>
      </span>
    );
  }

  return mark;
}
