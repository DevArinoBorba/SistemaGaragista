import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Stroke({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowLeftIcon = (props: IconProps) => <Stroke {...props}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></Stroke>;
export const ArrowRightIcon = (props: IconProps) => <Stroke {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Stroke>;
export const ArrowUpRightIcon = (props: IconProps) => <Stroke {...props}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Stroke>;
export const ArrowDownIcon = (props: IconProps) => <Stroke {...props}><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></Stroke>;
export const ChevronLeftIcon = (props: IconProps) => <Stroke {...props}><path d="m15 5-7 7 7 7" /></Stroke>;
export const ChevronRightIcon = (props: IconProps) => <Stroke {...props}><path d="m9 5 7 7-7 7" /></Stroke>;
export const SearchIcon = (props: IconProps) => <Stroke {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Stroke>;
export const ClockIcon = (props: IconProps) => <Stroke {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>;
export const PhoneIcon = (props: IconProps) => <Stroke {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Stroke>;
export const MailIcon = (props: IconProps) => <Stroke {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Stroke>;
export const PinIcon = (props: IconProps) => <Stroke {...props}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></Stroke>;
export const ShieldIcon = (props: IconProps) => <Stroke {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></Stroke>;
export const InstagramIcon = (props: IconProps) => <Stroke {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></Stroke>;
export const YoutubeIcon = (props: IconProps) => <Stroke {...props}><rect width="20" height="14" x="2" y="5" rx="4" ry="4" /><polygon points="10 9 15 12 10 15 10 9" /></Stroke>;
export const TiktokIcon = (props: IconProps) => <Stroke {...props}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></Stroke>;
export const FacebookIcon = (props: IconProps) => <Stroke {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Stroke>;
export const CheckIcon = (props: IconProps) => <Stroke {...props}><path d="M20 6 9 17l-5-5" /></Stroke>;
export const PercentIcon = (props: IconProps) => <Stroke {...props}><line x1="19" x2="5" y1="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></Stroke>;
export const FileCheckIcon = (props: IconProps) => <Stroke {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" /></Stroke>;
export const TrashIcon = (props: IconProps) => <Stroke {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></Stroke>;

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.45 0-2.88-.38-4.13-1.12l-.3-.18-3.07.81.82-2.99-.2-.31a8.2 8.2 0 0 1-1.26-4.45c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32" />
    </svg>
  );
}
