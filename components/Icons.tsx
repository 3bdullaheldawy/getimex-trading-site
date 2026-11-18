type IconProps = { className?: string; size?: number };

const base = (size = 18) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export function Arrow({ className = "" }: { className?: string }) {
  return <svg className={`arrow-icon ${className}`} viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>;
}

export function PhoneIcon({ className, size }: IconProps) { return <svg {...base(size)} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>; }
export function ChatIcon({ className, size }: IconProps) { return <svg {...base(size)} className={className}><path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z" /><path d="M9 10.5c.5 1.6 1.9 3 3.5 3.5l1.2-1 1.8.8" /></svg>; }
export function PinIcon({ className, size }: IconProps) { return <svg {...base(size)} className={className}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>; }
export function SearchIcon({ className, size }: IconProps) { return <svg {...base(size)} className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>; }
export function MailIcon({ className, size }: IconProps) { return <svg {...base(size)} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>; }
