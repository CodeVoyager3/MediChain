import React from 'react';

export function MissionBentoStar({ className }) {
  const uid = React.useId().replace(/:/g, '');

  return (
    <svg
      width="290"
      height="290"
      viewBox="0 0 290 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M133.668 8.33545C137.534 -2.11196 152.31 -2.11197 156.176 8.33545L188.112 94.6413C189.328 97.926 191.917 100.516 195.202 101.731L281.508 133.667C291.955 137.533 291.955 152.31 281.508 156.176L195.202 188.112C191.917 189.327 189.328 191.917 188.112 195.201L156.176 281.507C152.31 291.955 137.534 291.955 133.668 281.507L101.732 195.201C100.516 191.917 97.9264 189.327 94.6418 188.112L8.33594 156.176C-2.11148 152.31 -2.11148 137.533 8.33594 133.667L94.6418 101.731C97.9264 100.516 100.516 97.926 101.732 94.6413L133.668 8.33545Z"
        fill={`url(#${uid}-sp0)`}
        fillOpacity="0.25"
        stroke={`url(#${uid}-sp1)`}
      />
      <defs>
        <linearGradient id={`${uid}-sp0`} x1="382.021" y1="163.827" x2="35.657" y2="162.3" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--foreground) / 0.2)" stopOpacity="0.5" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.1)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-sp1`} x1="301.613" y1="158.61" x2="46.0508" y2="163.455" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted-foreground) / 0.85)" />
          <stop offset="1" stopColor="hsl(var(--card))" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MissionBentoStarIcon({ className }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M6 0L7.62054 4.37946L12 6L7.62054 7.62054L6 12L4.37946 7.62054L0 6L4.37946 4.37946L6 0Z"
        className="fill-muted-foreground dark:fill-[#A1ACB1]"
      />
      <path
        d="M7.15137 4.55273L7.23145 4.76855L7.44727 4.84863L10.5586 6L7.44727 7.15137L7.23145 7.23145L7.15137 7.44727L6 10.5586L4.84863 7.44727L4.76855 7.23145L4.55273 7.15137L1.44043 6L4.55273 4.84863L4.76855 4.76855L4.84863 4.55273L6 1.44043L7.15137 4.55273Z"
        className="stroke-border dark:stroke-[#BFB9B9]"
        strokeOpacity="0.25"
      />
    </svg>
  );
}
