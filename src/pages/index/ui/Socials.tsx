import { SocialIcons } from '@/shared/ui/shadcn/social-icons';

export const Socials = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center pt-6 sm:pt-0">
      <div className="flex w-full flex-col items-center gap-8 sm:gap-12">
        <div className="w-full space-y-2 px-2 text-center sm:px-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Connect with me
          </h1>
        </div>

        <div className="flex w-full justify-center px-1 sm:px-0">
          <SocialIcons />
        </div>
      </div>
    </div>
  );
};
