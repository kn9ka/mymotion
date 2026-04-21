import {
  DiscordIcon,
  GithubIcon,
  LinkedInIcon,
  MailIcon,
  TelegramIcon,
} from './icons';

const socials = [
  {
    name: 'GitHub',
    href: 'https://github.com/kn9ka',
    icon: <GithubIcon />,
  },

  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/anton-krachkov',
    icon: <LinkedInIcon />,
  },
  {
    name: 'Telegram',
    href: 'https://t.me/knyaka',
    icon: <TelegramIcon />,
  },
  {
    name: 'Discord',
    href: 'https://discordapp.com/users/232159043194454016',
    icon: <DiscordIcon />,
  },
  {
    name: 'Email',
    href: 'mailto:kn9kaa@gmail.com',
    icon: <MailIcon />,
  },
];

export function SocialIcons() {
  return (
    <div className="flex h-12 items-center gap-1 overflow-visible rounded-full border bg-background/80 px-2 shadow-lg backdrop-blur-sm">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
          aria-label={social.name}
        >
          <span className="absolute inset-0 rounded-full bg-foreground/6 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
            {social.icon}
          </span>

          <span className="absolute bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-foreground transition-all duration-200 group-hover:w-3" />

          <span className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 rounded-full border bg-background px-3 py-1 text-[11px] font-medium whitespace-nowrap text-foreground opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100">
            {social.name}
            <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b bg-background" />
          </span>
        </a>
      ))}
    </div>
  );
}
