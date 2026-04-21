'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import * as React from 'react';

import { useTheme } from '@/shared/lib/theme-context';
import { cn } from '@/shared/lib/utils';

const buttonVariants = {
  dark: {
    borderColor: 'rgb(125 211 252 / 0.18)',
    boxShadow: '0 10px 35px rgb(14 165 233 / 0.12)',
  },
  light: {
    borderColor: 'rgb(251 191 36 / 0.22)',
    boxShadow: '0 10px 35px rgb(251 191 36 / 0.16)',
  },
};

const backgroundVariants = {
  dark: {
    background:
      'linear-gradient(135deg, rgb(14 165 233 / 0.16), rgb(15 23 42 / 0.08), rgb(99 102 241 / 0.18))',
  },
  light: {
    background:
      'linear-gradient(135deg, rgb(251 191 36 / 0.24), rgb(255 255 255 / 0.06), rgb(249 115 22 / 0.18))',
  },
};

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setMounted] = React.useState(false);
  const layout = {
    button: 'h-9 w-17 p-1',
    skeletonKnob: 'size-7',
    shimmer:
      'absolute inset-y-1 -left-5 w-6 rotate-12 rounded-full bg-white/40 blur-md',
    shimmerInitialDarkX: -18,
    shimmerInitialLightX: 68,
    shimmerAnimateDarkX: 72,
    shimmerAnimateLightX: -20,
    glow: 'absolute inset-y-1 left-1 z-0 w-8 rounded-full blur-md',
    glowDarkX: 4,
    glowLightX: 32,
    iconsWrap: 'px-1.5',
    trackIcon: 'size-3.5',
    knob: 'absolute left-1 top-1 z-20 flex size-7 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm',
    knobLightX: 32,
    knobIcon: 'size-3.5',
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'relative flex items-center rounded-full border border-border/70 bg-background/70 shadow-md backdrop-blur-sm',
          layout.button,
          className,
        )}
      >
        <span
          className={cn(
            'rounded-full border border-border/60 bg-background/90 shadow-sm',
            layout.skeletonKnob,
          )}
        />
      </span>
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      aria-pressed={theme === 'light'}
      onClick={(event) => {
        event.stopPropagation();
        toggleTheme();
      }}
      className={cn(
        'relative flex items-center overflow-hidden rounded-full border bg-background/70 backdrop-blur-sm',
        layout.button,
        className,
      )}
      animate={theme}
      variants={buttonVariants}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        animate={theme}
        variants={backgroundVariants}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />

      <motion.span
        key={theme}
        aria-hidden="true"
        className={layout.shimmer}
        initial={{
          opacity: 0,
          x:
            theme === 'dark'
              ? layout.shimmerInitialDarkX
              : layout.shimmerInitialLightX,
        }}
        animate={{
          opacity: [0, 0.65, 0],
          x:
            theme === 'dark'
              ? layout.shimmerAnimateDarkX
              : layout.shimmerAnimateLightX,
        }}
        transition={{ duration: 0.65, ease: 'easeInOut' }}
      />

      <motion.span
        aria-hidden="true"
        className={layout.glow}
        animate={theme}
        variants={{
          dark: {
            backgroundColor: 'rgb(56 189 248 / 0.34)',
            x: layout.glowDarkX,
          },
          light: {
            backgroundColor: 'rgb(250 204 21 / 0.38)',
            x: layout.glowLightX,
          },
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      />

      <span
        className={cn(
          'relative z-10 flex w-full items-center justify-between',
          layout.iconsWrap,
        )}
      >
        <Moon
          className={cn(
            'transition-colors duration-300',
            layout.trackIcon,
            theme === 'dark' ? 'text-sky-100/78' : 'text-foreground/45',
          )}
        />
        <Sun
          className={cn(
            'transition-colors duration-300',
            layout.trackIcon,
            theme === 'light' ? 'text-amber-950/70' : 'text-foreground/45',
          )}
        />
      </span>

      <motion.span
        aria-hidden="true"
        className={layout.knob}
        animate={theme}
        variants={{
          dark: {
            x: 0,
            rotate: -180,
            backgroundColor: 'rgb(15 23 42 / 0.86)',
            borderColor: 'rgb(125 211 252 / 0.14)',
          },
          light: {
            x: layout.knobLightX,
            rotate: 0,
            backgroundColor: 'rgb(255 255 255 / 0.94)',
            borderColor: 'rgb(251 191 36 / 0.24)',
          },
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {theme === 'dark' ? (
              <Moon className={cn(layout.knobIcon, 'text-sky-100')} />
            ) : (
              <Sun className={cn(layout.knobIcon, 'text-amber-500')} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
};
