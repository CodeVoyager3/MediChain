import React from 'react';
import { motion } from 'framer-motion';

/**
 * Box-1 illustration — structure, motion, and defs match the reference Bento5 “One” SVG.
 */
export function PlatformEcosystemBentoOne({ className }) {
  return (
    <svg
      width="755"
      height="672"
      viewBox="0 0 755 672"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g opacity="0.36">
        <g clipPath="url(#clip0_702_404)" />
        <rect
          x="91"
          y="1"
          width="313"
          height="313"
          rx="19"
          stroke="hsl(var(--border))"
          strokeOpacity="0.31"
          strokeWidth="2"
        />
      </g>
      <g opacity="0.36">
        <rect
          x="366"
          y="358"
          width="388"
          height="313"
          rx="19"
          stroke="hsl(var(--border))"
          strokeOpacity="0.31"
          strokeWidth="2"
        />
      </g>
      <line y1="352" x2="513" y2="352" stroke="hsl(var(--border))" strokeWidth="2" />
      <line x1="108" y1="314" x2="621" y2="314" stroke="hsl(var(--border))" strokeWidth="2" />
      <motion.g
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 500, opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
      >
        <line x1="23" y1="352" x2="64" y2="352" stroke="url(#paint0_linear_702_404)" strokeWidth="2" />
        <line x1="23" y1="352" x2="64" y2="352" stroke="url(#paint1_linear_702_404)" strokeWidth="2" />
        <line x1="23" y1="352" x2="64" y2="352" stroke="url(#paint2_linear_702_404)" strokeWidth="2" />
        <line x1="23" y1="352" x2="64" y2="352" stroke="url(#paint3_linear_702_404)" strokeWidth="2" />
        <g filter="url(#filter0_f_702_404)">
          <line x1="23" y1="352" x2="64" y2="352" stroke="url(#paint4_linear_702_404)" strokeWidth="2" />
        </g>
        <g filter="url(#filter1_f_702_404)">
          <line x1="23" y1="352" x2="64" y2="352" stroke="url(#paint5_linear_702_404)" strokeWidth="2" />
        </g>
      </motion.g>
      <motion.g
        initial={{ x: -350, opacity: 0 }}
        animate={{ x: 200, opacity: [0, 1, 1, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear', delay: 1 }}
      >
        <line x1="414" y1="314" x2="455" y2="314" stroke="url(#paint6_linear_702_404)" strokeWidth="2" />
        <line x1="414" y1="314" x2="455" y2="314" stroke="url(#paint7_linear_702_404)" strokeWidth="2" />
        <line x1="414" y1="314" x2="455" y2="314" stroke="url(#paint8_linear_702_404)" strokeWidth="2" />
        <line x1="414" y1="314" x2="455" y2="314" stroke="url(#paint9_linear_702_404)" strokeWidth="2" />
        <g filter="url(#filter2_f_702_404)">
          <line x1="414" y1="314" x2="455" y2="314" stroke="url(#paint10_linear_702_404)" strokeWidth="2" />
        </g>
        <g filter="url(#filter3_f_702_404)">
          <line x1="414" y1="314" x2="455" y2="314" stroke="url(#paint11_linear_702_404)" strokeWidth="2" />
        </g>
      </motion.g>
      <g opacity="0.66" filter="url(#filter4_iif_702_404)">
        <path
          d="M337 332C337 381.153 297.153 421 248 421C198.847 421 159 381.153 159 332C159 282.847 198.847 243 248 243C297.153 243 337 282.847 337 332Z"
          fill="url(#paint12_linear_702_404)"
          fillOpacity="0.1"
        />
        <path
          d="M248 244C296.601 244 336 283.399 336 332C336 380.601 296.601 420 248 420C199.399 420 160 380.601 160 332C160 283.399 199.399 244 248 244Z"
          stroke="url(#paint13_linear_702_404)"
          strokeWidth="2"
        />
      </g>
      <g filter="url(#filter5_ii_702_404)">
        <path
          d="M328 332C328 376.735 291.735 413 247 413C202.265 413 166 376.735 166 332C166 287.265 202.265 251 247 251C291.735 251 328 287.265 328 332Z"
          fill="url(#paint14_linear_702_404)"
          fillOpacity="0.1"
        />
      </g>
      <path
        d="M247 252C291.183 252 327 287.817 327 332C327 376.183 291.183 412 247 412C202.817 412 167 376.183 167 332C167 287.817 202.817 252 247 252Z"
        stroke="url(#paint15_linear_702_404)"
        strokeWidth="2"
      />
      <g opacity="0.78">
        <g filter="url(#filter6_i_702_404)">
          <path
            d="M310 332C310 366.242 282.242 394 248 394C213.758 394 186 366.242 186 332C186 297.758 213.758 270 248 270C282.242 270 310 297.758 310 332Z"
            fill="hsl(var(--muted))"
          />
        </g>
        <path
          d="M248 270.5C281.966 270.5 309.5 298.034 309.5 332C309.5 365.966 281.966 393.5 248 393.5C214.034 393.5 186.5 365.966 186.5 332C186.5 298.034 214.034 270.5 248 270.5Z"
          stroke="hsl(var(--border))"
          strokeOpacity="0.18"
        />
      </g>
      <path
        opacity="0.78"
        d="M299 332C299 360.719 275.719 384 247 384C218.281 384 195 360.719 195 332C195 303.281 218.281 280 247 280C275.719 280 299 303.281 299 332Z"
        fill="hsl(var(--primary))"
      />
      <g opacity="0.67" filter="url(#filter7_f_702_404)">
        <path
          d="M248 332C248 351.882 231.882 368 212 368C192.118 368 176 351.882 176 332C176 312.118 192.118 296 212 296C231.882 296 248 312.118 248 332Z"
          fill="hsl(var(--primary))"
        />
      </g>
      <g opacity="0.51" filter="url(#filter8_f_702_404)">
        <path
          d="M320 332C320 351.882 303.882 368 284 368C264.118 368 248 351.882 248 332C248 312.118 264.118 296 284 296C303.882 296 320 312.118 320 332Z"
          fill="hsl(var(--primary))"
        />
      </g>
      <g opacity="0.81" filter="url(#filter9_d_702_404)">
        <path
          d="M247 304L222 319C222 343.4 238.667 355.833 247 359C268.6 349.8 272.667 328.5 272 319L247 304Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_702_404"
          x="18.7"
          y="346.7"
          width="49.6"
          height="10.6"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.15" result="effect1_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter1_f_702_404"
          x="18.7"
          y="346.7"
          width="49.6"
          height="10.6"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.15" result="effect1_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter2_f_702_404"
          x="409.7"
          y="308.7"
          width="49.6"
          height="10.6"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.15" result="effect1_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter3_f_702_404"
          x="409.7"
          y="308.7"
          width="49.6"
          height="10.6"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.15" result="effect1_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter4_iif_702_404"
          x="140.9"
          y="224.9"
          width="214.2"
          height="214.2"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="12" dy="1" />
          <feGaussianBlur stdDeviation="8.65" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0784314 0 0 0 0 0.541176 0 0 0 0 0.882353 0 0 0 0.5 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_702_404" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-18" />
          <feGaussianBlur stdDeviation="7.7" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0784314 0 0 0 0 0.541176 0 0 0 0 0.882353 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="effect1_innerShadow_702_404" result="effect2_innerShadow_702_404" />
          <feGaussianBlur stdDeviation="9.05" result="effect3_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter5_ii_702_404"
          x="150.6"
          y="251"
          width="189.4"
          height="163"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="12" dy="1" />
          <feGaussianBlur stdDeviation="8.65" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0784314 0 0 0 0 0.541176 0 0 0 0 0.882353 0 0 0 0.5 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_702_404" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-18" />
          <feGaussianBlur stdDeviation="7.7" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0784314 0 0 0 0 0.541176 0 0 0 0 0.882353 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="effect1_innerShadow_702_404" result="effect2_innerShadow_702_404" />
        </filter>
        <filter
          id="filter6_i_702_404"
          x="186"
          y="270"
          width="124"
          height="124"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="7.1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.865185 0 0 0 0 0.911791 0 0 0 0 0.946154 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_702_404" />
        </filter>
        <filter
          id="filter7_f_702_404"
          x="146"
          y="266"
          width="132"
          height="132"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter8_f_702_404"
          x="218"
          y="266"
          width="132"
          height="132"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_702_404" />
        </filter>
        <filter
          id="filter9_d_702_404"
          x="199.6"
          y="281.6"
          width="94.8664"
          height="99.8"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="11.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.992308 0 0 0 0 0.992308 0 0 0 0 0.992308 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_702_404" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_702_404" result="shape" />
        </filter>
        <linearGradient id="paint0_linear_702_404" x1="23" y1="353.5" x2="64" y2="353.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint1_linear_702_404" x1="23" y1="353.5" x2="64" y2="353.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint2_linear_702_404" x1="23" y1="353.5" x2="64" y2="353.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary) / 0.65)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint3_linear_702_404" x1="23" y1="353.5" x2="64" y2="353.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint4_linear_702_404" x1="23" y1="353.5" x2="64" y2="353.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary) / 0.8)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint5_linear_702_404" x1="23" y1="353.5" x2="64" y2="353.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary) / 0.8)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint6_linear_702_404" x1="414" y1="315.5" x2="455" y2="315.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint7_linear_702_404" x1="414" y1="315.5" x2="455" y2="315.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint8_linear_702_404" x1="414" y1="315.5" x2="455" y2="315.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary) / 0.65)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint9_linear_702_404" x1="414" y1="315.5" x2="455" y2="315.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint10_linear_702_404" x1="414" y1="315.5" x2="455" y2="315.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary) / 0.8)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint11_linear_702_404" x1="414" y1="315.5" x2="455" y2="315.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary) / 0.8)" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint12_linear_702_404" x1="248" y1="243" x2="248" y2="421" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" />
        </linearGradient>
        <linearGradient id="paint13_linear_702_404" x1="337" y1="332" x2="159" y2="332" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="0.5" stopColor="hsl(var(--foreground) / 0.15)" stopOpacity="0" />
          <stop offset="1" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <linearGradient id="paint14_linear_702_404" x1="247" y1="251" x2="247" y2="413" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary) / 0.35)" />
        </linearGradient>
        <linearGradient id="paint15_linear_702_404" x1="328" y1="332" x2="166" y2="332" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="0.5" stopColor="hsl(var(--foreground) / 0.15)" stopOpacity="0" />
          <stop offset="1" stopColor="hsl(var(--primary))" />
        </linearGradient>
        <clipPath id="clip0_702_404">
          <rect x="90" width="315" height="315" rx="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
