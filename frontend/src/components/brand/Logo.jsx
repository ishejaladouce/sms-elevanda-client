export default function Logo({ subtitle, size = "md", className = "" }) {
  const sizes = {
    sm: { title: "text-lg", sub: "text-xs" },
    md: { title: "text-2xl", sub: "text-sm" },
    lg: { title: "text-4xl sm:text-5xl", sub: "text-base" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={className}>
      <div className={["font-display leading-tight tracking-tight", s.title].join(" ")}>
        <span className="text-text">SMS</span>{" "}
        <span className="text-accent">Elevanda</span>
      </div>
      {subtitle ? (
        <div className={["text-muted mt-2 font-sans", s.sub].join(" ")}>{subtitle}</div>
      ) : null}
    </div>
  );
}
