export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden group";

  const variants = {
    primary: [
      "bg-accent text-bg shadow-glow",
      "hover:bg-accentHover hover:brightness-105",
      "active:scale-[0.98] focus-visible:ring-accent",
    ].join(" "),
    secondary: [
      "text-text bg-surface ring-1 ring-border",
      "hover:bg-surface2 hover:ring-borderStrong",
      "focus-visible:ring-borderStrong",
    ].join(" "),
    ghost:
      "bg-transparent text-text hover:bg-surface hover:ring-1 hover:ring-border focus-visible:ring-borderStrong",
    danger:
      "bg-danger text-white hover:brightness-110 focus-visible:ring-danger active:scale-[0.98]",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={[base, variants[variant], sizes[size], className].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {variant === "primary" ? (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full pointer-events-none" />
      ) : null}
      <span className="relative inline-flex items-center gap-2">
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
            <span>Loading</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
