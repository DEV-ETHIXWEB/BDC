import { iconLayers, ICON_STROKE, type IconName, type IconVariant } from '../icons/paths';

export function Icon({ name, size = 24, className, label, variant = 'line' }: { name: IconName; size?: number; className?: string; label?: string; variant?: IconVariant }) {
  const layers = iconLayers(name, variant);
  return (
    <svg
      className={`ic${variant === 'tile' ? ' ic--tile' : ''} ${className ?? ''}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE[variant]}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {layers.map((l, k) =>
        l.k === 'f' ? <path key={k} d={l.d} className="ic-fill" fill="currentColor" opacity={0.16} stroke="none" />
        : l.k === 't' ? <path key={k} d={l.d} strokeWidth={1} opacity={0.5} />
        : l.k === 'a' ? <path key={k} d={l.d} fill="currentColor" strokeWidth={1} />
        : l.k === 'd' ? <circle key={k} cx={l.cx} cy={l.cy} r={l.r} fill="currentColor" stroke="none" />
        : <path key={k} d={l.d} />
      )}
    </svg>
  );
}
