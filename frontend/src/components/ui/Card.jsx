function handleTileMouseMove(e) {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  target.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

export default function Card({
  title,
  children,
  className = "",
  padded = true,
  interactive = true,
}) {
  return (
    <div
      onMouseMove={interactive ? handleTileMouseMove : undefined}
      className={[
        interactive
          ? "tile"
          : "rounded-card bg-surface ring-1 ring-border shadow-card",
        padded ? "p-6" : "",
        className,
      ].join(" ")}
    >
      {title ? (
        <div className="text-xs font-medium text-muted mb-4 tracking-wider uppercase">
          {title}
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
}
