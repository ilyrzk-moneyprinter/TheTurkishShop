/// <reference types="react-scripts" />

// Fix for react-icons compatibility with React 19
declare module 'react-icons' {
  import { ComponentType, SVGProps } from 'react';
  export type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;
}

declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  export const FaPaypal: IconType;
  export const FaSteam: IconType;
  export const FaPlaystation: IconType;
  export const FaXbox: IconType;
  export const FaDiscord: IconType;
  export const FaGamepad: IconType;
}

declare module 'react-icons/fa6' {
  import { IconType } from 'react-icons';
  export const FaSteam: IconType;
  export const FaPlaystation: IconType;
  export const FaXbox: IconType;
  export const FaDiscord: IconType;
  export const FaGamepad: IconType;
}

declare module 'react-icons/si' {
  import { IconType } from 'react-icons';
  export const SiEpicgames: IconType;
  export const SiNintendo: IconType;
  export const SiRoblox: IconType;
}

declare module 'react-icons/md' {
  import { IconType } from 'react-icons';
  export const MdPhoneAndroid: IconType;
}

// Fix for react-helmet-async compatibility
declare module 'react-helmet-async' {
  import * as React from 'react';
  
  export interface HelmetProps {
    children?: React.ReactNode;
    titleTemplate?: string;
    defaultTitle?: string;
    onChangeClientState?: (newState: any, addedTags: any, removedTags: any) => void;
  }
  
  export const Helmet: React.FC<HelmetProps>;
  
  export interface HelmetProviderProps {
    children?: React.ReactNode;
    context?: any;
  }
  
  export const HelmetProvider: React.FC<HelmetProviderProps>;
}
