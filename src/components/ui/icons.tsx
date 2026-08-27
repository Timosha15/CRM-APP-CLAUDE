type IconProps = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconHome({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-3.5v-5.5h-5V17H4a1 1 0 0 1-1-1V8.5Z" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="7.5" cy="7" r="2.75" />
      <path d="M2.5 16.5c0-2.5 2.2-4 5-4s5 1.5 5 4" />
      <circle cx="14.5" cy="7.5" r="2.1" />
      <path d="M12.7 9.6c1.9.3 3.8 1.5 3.8 3.9" />
    </svg>
  );
}

export function IconBuilding({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3" width="8" height="14" rx="0.6" />
      <rect x="13" y="7.5" width="3.5" height="9.5" rx="0.6" />
      <path d="M6 6.2h1.6M6 9h1.6M6 11.8h1.6" />
    </svg>
  );
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="6.5" />
      <circle cx="10" cy="10" r="3.4" />
      <circle cx="10" cy="10" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconCheckSquare({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.25" y="3.25" width="13.5" height="13.5" rx="2.5" />
      <path d="m7 10 2.2 2.2L13.5 7.7" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m17 17-3.5-3.5" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export function IconLogOut({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 17H4.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" />
      <path d="M13 14.5 17.5 10 13 5.5" />
      <path d="M17.2 10H7.5" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 3.5h2.7l1.1 3.6-1.9 1.6a10.4 10.4 0 0 0 4.9 4.9l1.6-1.9 3.6 1.1v2.7a1 1 0 0 1-1.1 1A13.5 13.5 0 0 1 3.5 4.6a1 1 0 0 1 1-1.1Z" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4.5" width="14" height="11" rx="1.4" />
      <path d="m3.5 5.5 6.5 5 6.5-5" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="14" height="13" rx="1.4" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" />
    </svg>
  );
}

export function IconNote({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 3h7l3.5 3.5V17H5V3Z" />
      <path d="M12 3v3.5h3.5" />
      <path d="M7.3 10h5.4M7.3 12.6h5.4" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5h12M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6 5.5 6.7 16a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.7-10.5" />
    </svg>
  );
}

export function IconEdit({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12.9 3.5 16.5 7 7 16.5H3.5V13Z" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function IconSpinner({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconDollar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 2.5v15M13.5 6c0-1.4-1.6-2.5-3.5-2.5S6.5 4.6 6.5 6c0 3 7 2 7 5 0 1.4-1.6 2.5-3.5 2.5S6.5 12.4 6.5 11" />
    </svg>
  );
}

export function IconTrendingUp({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m3 13 5-5 3.5 3.5L17 6" />
      <path d="M12.5 6H17v4.5" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 5.5V10l3 2" />
    </svg>
  );
}

export function IconAlert({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 2.5 18 16.5H2Z" />
      <path d="M10 8v3.2" />
      <circle cx="10" cy="14" r="0.6" fill="currentColor" />
    </svg>
  );
}
