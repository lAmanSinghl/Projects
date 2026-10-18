import styles from "../page.module.css";

export function Icon({ name, size = 16 }) {
  const paths = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </>
    ),
    code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
    play: <path d="m8 5 12 7-12 7V5Z" />,
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 7h.01" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.code}
    </svg>
  );
}

export function Difficulty({ value }) {
  const level = String(value || "MEDIUM").toUpperCase();

  return (
    <span
      className={`${styles.difficulty} ${styles[`difficulty${level}`] || ""}`}
    >
      <span />
      {level.charAt(0) + level.slice(1).toLowerCase()}
    </span>
  );
}

export function ResizeHandle({ direction, onPointerDown, label }) {
  return (
    <div
      className={
        direction === "horizontal"
          ? styles.horizontalResizeHandle
          : styles.verticalResizeHandle
      }
      role="separator"
      aria-label={label}
      aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      title={`Drag to resize ${label}`}
    >
      <span />
    </div>
  );
}
