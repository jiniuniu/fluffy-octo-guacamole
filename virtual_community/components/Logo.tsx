interface LogoProps {
  className?: string;
  variant?: "mark" | "full";
  onClick?: () => void;
}

export function Logo({
  className = "",
  variant = "full",
  onClick,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        onClick={onClick}
        aria-label="People Square"
      >
        <rect x="1" y="1" width="26" height="26" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeOpacity="0.3" />
        <text x="14" y="12" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="7.5" fontWeight="800" fill="currentColor" letterSpacing="-0.5">People</text>
        <text x="14" y="21" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="6.5" fontWeight="500" fill="none" stroke="currentColor" strokeWidth="0.5" letterSpacing="1.5">Square</text>
      </svg>
    );
  }

  // Full wordmark: PeopleSquare — single text node, two tspan styles
  return (
    <svg
      width="300"
      height="38"
      viewBox="0 0 300 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      aria-label="People Square"
    >
      <text
        x="0"
        y="28"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="28"
        letterSpacing="-1"
      >
        <tspan fontWeight="800" fill="currentColor">People</tspan>
        <tspan fontWeight="300" fill="none" stroke="currentColor" strokeWidth="0.9">Square</tspan>
      </text>
    </svg>
  );
}
