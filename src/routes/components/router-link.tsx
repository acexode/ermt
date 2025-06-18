import type { LinkProps as NextLinkProps } from 'next/link';

import Link from 'next/link';

// ----------------------------------------------------------------------

export type RouterLinkProps = Omit<NextLinkProps, 'href'> & {
  href: string;
};

export function RouterLink({ href, ...other }: RouterLinkProps) {
  return <Link href={href} {...other} />;
}
