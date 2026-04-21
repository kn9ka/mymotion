import { AnimatedNavFramer } from '@/shared/ui/shadcn/navigation-menu';

import { Experience } from './Experience';
import { Gamer } from './Gamer';
import { OtherProjects } from './OtherProjects';
import { SmokeWebGL } from './SmokeWebGL';
import { Socials } from './Socials';

export const Index = () => {
  const sectionClassName =
    'relative flex w-full max-w-295 flex-col justify-center overflow-x-hidden';

  return (
    <>
      <main className="relative flex w-full flex-col items-center gap-12 sm:gap-20">
        <AnimatedNavFramer />

        <section
          id="webgl"
          className={`${sectionClassName} max-w-none min-h-dvh`}
        >
          <div className="absolute inset-0 z-1 h-full w-full overflow-hidden">
            <SmokeWebGL />
          </div>

          <div className="pointer-events-none relative z-1">
            <h1 className="text-3xl text-center">
              Hi, I&apos;m Anton. I build systems, not pages.
            </h1>
          </div>
        </section>

        <section id="experience" className={sectionClassName}>
          <Experience />
        </section>

        <section id="other-projects" className={sectionClassName}>
          <OtherProjects />
        </section>

        <section id="side" className={sectionClassName}>
          <Gamer />
        </section>

        <section id="socials" className={sectionClassName}>
          <Socials />
        </section>
      </main>
    </>
  );
};
