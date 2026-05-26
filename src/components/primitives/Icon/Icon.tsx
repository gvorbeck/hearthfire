import type { SVGProps } from 'react';

const icons = {
  'chevron-up': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 15.75 7.5-7.5 7.5 7.5"
    />
  ),
  'chevron-down': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  ),
  pencil: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
    />
  ),
  check: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  ),
  copy: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  ),
  spring: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12C12 12 8 10 7 6c2 0 4 1 5 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12C12 12 16 10 17 6c-2 0-4 1-5 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12C12 12 10 8 12 4c2 4 0 8 0 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18c0-1.66 1.34-3 3-3s3 1.34 3 3" />
    </>
  ),
  summer: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  autumn: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 4 7 4 11c0 2.5 1.5 4.5 3 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c5 0 8 4 8 8 0 2.5-1.5 4.5-3 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0 0 10-3 14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0 0 10 3 14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17c1-2 3-2 3-2s2 0 3 2" />
    </>
  ),
  winter: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l-2 2 2 2 2-2zM12 14l-2 2 2 2 2-2zM6 12l2-2 2 2-2 2zM14 12l2-2 2 2-2 2z" />
    </>
  ),
  'empty-provisions': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l10 10-10 10L2 12z" />
  ),
  'filled-provisions': (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l10 10-10 10L2 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12 3 3 5-5" />
    </>
  ),
  plus: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  ),
  minus: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 12h-15"
    />
  ),
  close: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  ),
  trash: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </>
  ),
};

export type IconName = keyof typeof icons;
export type IconSize = 'small' | 'medium' | 'large';

const sizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: IconSize;
}

export const Icon = ({ name, size = 'medium', ...props }: IconProps) => {
  const px = sizeMap[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      width={px}
      height={px}
      aria-hidden="true"
      {...props}
    >
      {icons[name]}
    </svg>
  );
};
