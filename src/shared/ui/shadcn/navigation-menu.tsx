'use client';

import {
  motion,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from 'framer-motion';
import { Navigation, Menu } from 'lucide-react';
import * as React from 'react';

import { ThemeToggle } from '@/shared/ui/shadcn/theme-toggle';
import { cn } from '@/shared/lib/utils';

const navItems = [
  { name: 'Home', href: '#webgl' },
  { name: 'Experience', href: '#experience' },
  { name: 'Projects', href: '#other-projects' },
  { name: 'Gaming', href: '#side' },
  { name: 'Socials', href: '#socials' },
];

const EXPAND_SCROLL_THRESHOLD = 80;
const COLLAPSED_LEFT_OFFSET = 16;
const COLLAPSED_WIDTH = 48;
const COLLAPSED_X_OFFSET = `calc(-50vw + ${COLLAPSED_LEFT_OFFSET + COLLAPSED_WIDTH / 2}px)`;

const containerVariants = {
  expanded: {
    x: '0px',
    y: 0,
    opacity: 1,
    width: 'auto',
    transition: {
      y: { type: 'spring', damping: 18, stiffness: 250 },
      opacity: { duration: 0.3 },
      type: 'spring',
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  collapsed: {
    x: COLLAPSED_X_OFFSET,
    y: 0,
    opacity: 1,
    width: '3rem',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
} satisfies Variants;

const logoVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: 'spring', damping: 15 },
  },
  collapsed: {
    opacity: 0,
    x: -25,
    rotate: -180,
    transition: { duration: 0.3 },
  },
} satisfies Variants;

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', damping: 15 },
  },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
} satisfies Variants;

const collapsedIconVariants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
      delay: 0.15,
    },
  },
} satisfies Variants;

export function AnimatedNavFramer() {
  const [isExpanded, setExpanded] = React.useState(true);

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastScrollY.current;

    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setExpanded(true);
    }

    lastScrollY.current = latest;
  });

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  return (
    <>
      <div className="fixed top-2.5 left-1/2 z-50 -translate-x-1/2 sm:top-6">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          variants={containerVariants}
          whileHover={!isExpanded ? { scale: 1.1 } : {}}
          whileTap={!isExpanded ? { scale: 0.95 } : {}}
          onClick={handleNavClick}
          className={cn(
            'flex h-10 max-w-[calc(100vw-0.75rem)] items-center overflow-hidden rounded-full border bg-background/80 shadow-lg backdrop-blur-sm sm:h-12 sm:max-w-none',
            !isExpanded && 'cursor-pointer justify-center',
          )}
        >
          <motion.div
            variants={logoVariants}
            className="hidden shrink-0 items-center pr-2 pl-4 font-semibold sm:flex"
          >
            <Navigation className="h-6 w-6" />
          </motion.div>

          <motion.div
            className={cn(
              'flex items-center gap-1 px-1.5 text-[11px] sm:gap-2 sm:px-4 sm:text-base',
              !isExpanded && 'pointer-events-none',
            )}
          >
            {navItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                variants={itemVariants}
                onClick={(e) => e.stopPropagation()}
                className="px-1 py-1 text-[11px] leading-none font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:px-2 sm:py-1 sm:text-sm"
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              variants={collapsedIconVariants}
              animate={isExpanded ? 'expanded' : 'collapsed'}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          </div>
        </motion.nav>
      </div>

      <div
        className="fixed bottom-8 z-50 sm:bottom-6"
        style={{ left: COLLAPSED_LEFT_OFFSET }}
      >
        <ThemeToggle />
      </div>
    </>
  );
}
