import React, { useState, useEffect, useMemo } from 'react';
import { NavItem, DashboardTab, Activity, FAQItem } from './types';

// SVG Icon Components
export const HomeIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 10.707V17.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5H5a1.5 1.5 0 0 1-1.5-1.5V10.707a1 1 0 0 1 .293-.707l7-7Z" clipRule="evenodd" />
  </svg>
);


export const ChartBarIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13A1.5 1.5 0 0 0 15.5 18a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 15.5 2ZM10 8A.5.5 0 0 1 10.5 7h.01a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-.01a.5.5 0 0 1-.5-.5V8Zm-4.49 2h-.01A.5.5 0 0 0 5 10.5v5A.5.5 0 0 0 5.5 16h.01a.5.5 0 0 0 .5-.5v-5A.5.5 0 0 0 5.51 10Z" />
     <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 3.5 18a1.5 1.5 0 0 1-1.5-1.5v-13Z" />
     <path d="M8.5 5.5A1.5 1.5 0 0 0 7 7v9a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 8.5 5.5Z" />
     <path d="M12.5 3.5A1.5 1.5 0 0 0 11 5v11a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5V5A1.5 1.5 0 0 0 12.5 3.5Z" />
  </svg>
);
export const DocumentTextIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5V6.707a1.5 1.5 0 0 0-.44-1.06L14.56 2.439A1.5 1.5 0 0 0 13.5 2H3.5Zm6 7.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Zm-2-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Zm-2 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
  </svg>
);
export const UserCircleIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
  </svg>
);
export const CogIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
  </svg>
);
export const BoltIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M11.983 1.904a.75.75 0 0 0-1.212-.726L4.017 6.904a.75.75 0 0 0-.244.654V8.5h.002a.75.75 0 0 0 .707.853l4.408.06a1.5 1.5 0 0 1 1.263.732l.933 1.475a.75.75 0 0 0 1.213.01L16.03 5.05a.75.75 0 0 0-1.213-.727l-2.834 4.483-1.027-1.625a.25.25 0 0 0-.21-.126H8.55l2.95-4.667.484-.766Zm-3.416 8.012.03-.048.015-.024.008-.012a3.04 3.04 0 0 1-.004-3.58L7.203 4.077a2.25 2.25 0 0 0-2.088.123L1.05 6.66a2.25 2.25 0 0 0-1.042 1.962V8.5h.003a2.25 2.25 0 0 0 2.122 2.56l4.407.06a3 3 0 0 1 2.526 1.464l.934 1.476a2.25 2.25 0 0 0 3.638.03l4.054-6.417a2.25 2.25 0 0 0-1.238-3.416l-.968-.323a2.25 2.25 0 0 0-2.572.528l-1.847 2.921-1.027-1.625a1.75 1.75 0 0 0-1.473-.881H5.256l.012.019 1.112 1.758.02.03Z" />
    <path fillRule="evenodd" d="M12.5 10.75a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-4.5Zm.75 1.5v1.5h1.5v-1.5h-1.5Z" clipRule="evenodd" />
  </svg>
);
export const LogoutIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 0 9.75 3.5h-5.5A.75.75 0 0 0 3.5 4.25v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M16.78 9.22a.75.75 0 0 0 0 1.06l2.25 2.25H10.5a.75.75 0 0 0 0 1.5h8.53l-2.25 2.25a.75.75 0 1 0 1.06 1.06l3.5-3.5a.75.75 0 0 0 0-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
  </svg>
);

export const WristCareLogoIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-8 h-8 ${props.className || ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.136 12.001a8.25 8.25 0 0 1 13.728 0M1.982 8.964a11.25 11.25 0 0 1 20.036 0M9 1.5H3L3 9M21 1.5h-6M21 9V3M15 22.5h6L21 15m-12 7.5H3L3 15" />
  </svg>
);

export const HeartIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9-22.35 22.35 0 0 1-2.949-2.589c-.751-.893-1.27-1.767-1.606-2.482a9.025 9.025 0 0 1-.425-2.656A4.5 4.5 0 0 1 5.5 4.014a4.5 4.5 0 0 1 4.491 4.49c.013.01.025.021.037.032l.012-.012.012.012.037-.032A4.5 4.5 0 0 1 14.5 4.014a4.5 4.5 0 0 1 4.491 4.49 9.025 9.025 0 0 1-.425 2.656c-.335.715-.855 1.589-1.606 2.482a22.35 22.35 0 0 1-2.949 2.589 22.045 22.045 0 0 1-2.582 1.9 20.753 20.753 0 0 1-1.162.682l-.019.01-.005.003Zm-.002-1.636.002.001.007.003.005.002a18.749 18.749 0 0 0 1.05-.606 20.043 20.043 0 0 0 2.356-1.734 20.352 20.352 0 0 0 2.688-2.392c.662-.808 1.116-1.61 1.414-2.272a7.523 7.523 0 0 0 .354-2.212A3 3 0 0 0 14.5 5.514a3 3 0 0 0-2.995 2.995l-.003.018a.75.75 0 0 1-1.006.515L10 8.84l-.5.267a.75.75 0 0 1-1.006-.515l-.003-.018A3 3 0 0 0 5.5 5.514a3 3 0 0 0-2.995 2.995 7.523 7.523 0 0 0 .354 2.212c.298.662.752 1.464 1.414 2.272a20.352 20.352 0 0 0 2.688 2.392 20.043 20.043 0 0 0 2.356 1.734 18.75 18.75 0 0 0 1.05.606l.005-.002.007-.003.002-.001Z" />
  </svg>
);
export const ShoePrintsIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M8.21 5.214A.75.75 0 0 1 9 6.31v1.079a2.5 2.5 0 0 0 .856 1.833l.144.144a.75.75 0 0 0 1.06 0l.144-.144a2.5 2.5 0 0 0 .856-1.833V6.31a.75.75 0 0 1 1.591-.596L14.4 6.24c.205.224.44.415.7.572L16 6.31v1.079a4 4 0 0 1-1.369 2.933l-.144.144a.75.75 0 0 1-1.06 0l-.144-.144A4 4 0 0 1 12 7.389V6.31c0-.603-.302-1.153-.79-1.518l-.82-.614a.75.75 0 0 1 .21-1.372L11.763 3a.75.75 0 0 1 .686.14l.003.002A6.232 6.232 0 0 1 16 8.536V10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8.536A6.232 6.232 0 0 1 7.55 3.142l.003-.002a.75.75 0 0 1 .686-.14L9.402 3.21a.75.75 0 0 1 .21 1.372l-.82.614A1.75 1.75 0 0 0 8 6.31v1.079a4 4 0 0 1-1.369 2.933l-.144.144a.75.75 0 0 1-1.06 0l-.144-.144A4 4 0 0 1 4 7.389V6.31l.873-.496a.75.75 0 0 1 .637-1.096Zm-1.915 8.31a.75.75 0 0 0-1.06-1.06l-.72.72a3.5 3.5 0 0 0-1.022 2.475V17a.75.75 0 0 0 .75.75C7.761 17.75 12.25 14.261 12.25 11a.75.75 0 0 0-1.5 0c0 2.156-2.89 4.25-5.455 4.25H4.545C3.47 15.25 3.13 13.71 3.81 12.7l.72-.72.765.765Z" clipRule="evenodd" />
    <path d="M16.313 11.018a.75.75 0 0 1-1.06 1.06l-.72-.72a3.5 3.5 0 0 1-1.022-2.475V7.25a.75.75 0 0 1 1.5 0C14.75 10.239 10.261 13.75 7.75 13.75a.75.75 0 0 1 0-1.5c2.156 0 4.25-2.891 4.25-5.455V6.045c.87-.967 2.29-1.37 3.218-.525l.72.72-.765-.764Z" />
  </svg>
);
export const MoonIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M7.455 1.055a.75.75 0 0 1 .832.316A6.002 6.002 0 0 0 9.554 5.224a.75.75 0 0 1 1.07 1.07 7.502 7.502 0 0 1-4.028 4.028.75.75 0 0 1-1.07-1.07 6.002 6.002 0 0 0 3.854-1.268.75.75 0 0 1-.316-.832A7.473 7.473 0 0 1 8 2.268a7.473 7.473 0 0 1-.545-1.213Z" clipRule="evenodd" />
    <path d="M12.121 12.121A6.025 6.025 0 0 1 5.543 4.635c.162-.242.354-.46.572-.648A8.978 8.978 0 0 0 2.12 7.939a8.978 8.978 0 0 0 7.938 7.938 8.978 8.978 0 0 0 5.327-2.501c-.188.218-.406.41-.648.572A6.024 6.024 0 0 1 12.12 12.121Z" />
  </svg>
);
export const DropletIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M10 1a6.5 6.5 0 0 0-6.5 6.5c0 2.035.902 4.29 2.458 6.012a16.86 16.86 0 0 0 3.612 3.152.75.75 0 0 0 .86 0 16.86 16.86 0 0 0 3.612-3.152C15.598 11.79 16.5 9.535 16.5 7.5A6.5 6.5 0 0 0 10 1Zm0 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" clipRule="evenodd" />
  </svg>
);
export const ThermometerIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M8.5 3A2.5 2.5 0 0 0 6 5.5V12a3.5 3.5 0 1 0 7 0V5.5A2.5 2.5 0 0 0 10.5 3h-2Zm2 10.5a.5.5 0 0 0-1 0V15a.5.5 0 0 0 1 0v-1.5Z" clipRule="evenodd" />
  </svg>
);
export const ActivityIcon = (props: { className?: string }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 15.5 2h-11Zm1.193 3.593a.75.75 0 0 0-1.061 1.06L6.35 8.372a.75.75 0 0 0 1.06 0l1.72-1.72-.97.97a.75.75 0 1 0 1.06 1.06l1.5-1.5a.75.75 0 0 0 0-1.06l-1.5-1.5a.75.75 0 1 0-1.06 1.06l.97.97-1.72-1.72a.75.75 0 0 0-1.06 0Zm6.25-.53a.75.75 0 0 1 0 1.06l-1.72 1.72.97-.97a.75.75 0 1 1 1.06 1.06l-1.5 1.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 1.72-1.72a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    <path d="M6.5 12.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5Z" />
  </svg>
);
export const TrendUpIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M3.5 3.75a.75.75 0 0 0-1.5 0v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 0-1.5H2.75v-1.5Zm9.06 8.19 2-2a.75.75 0 0 0-1.06-1.06L12 10.44l-2.47-2.47a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 1 0 1.06 1.06l2.97-2.97L11.5 11a.75.75 0 0 0 1.06 0Z" />
    <path d="M16.25 2.5a.75.75 0 0 0-1.5 0v12a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V6.648l.354-.353a.75.75 0 0 0-1.061-1.06L16.25 5.485V2.5Z" />
  </svg>
);

export const RunningIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);
export const BikingIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M3 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12.5 6a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0ZM5.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M5.013 10.078a.75.75 0 0 1 .735-.51l2.868-.026a.75.75 0 0 1 .567.09c.111.073.209.17.29.284l1.007 1.41a2.07 2.07 0 0 0 3.304.215L15.5 9.25a.75.75 0 0 1 1.39.584l-1.73 4.153a.75.75 0 0 1-.696.463h-.84a2.502 2.502 0 0 0-2.339 3.241.75.75 0 0 1-1.436.497A2.501 2.501 0 0 0 9.5 15.5h-.043a2.5 2.5 0 0 0-2.493 2.343A.75.75 0 0 1 5.53 18.5H4.13a.75.75 0 0 1-.736-.51l-.375-1.048a2.503 2.503 0 0 0-2.92-1.398.75.75 0 0 1-.376-1.384 2.503 2.503 0 0 0 2.92-1.398l.375-1.048a.75.75 0 0 1 .736-.51h.002Z" clipRule="evenodd" />
  </svg>
);
export const ChevronDownIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);
export const LoginIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M10 3.75a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M3.5 6.5a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 .75.75h13a.75.75 0 0 0 .75-.75v-9a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 1 0-1.5h2.5A2.25 2.25 0 0 1 18.5 7.25v9A2.25 2.25 0 0 1 16.25 18.5h-13A2.25 2.25 0 0 1 1.5 16.25v-9A2.25 2.25 0 0 1 3.75 5h2.5a.75.75 0 0 1 0 1.5h-2.5Z" clipRule="evenodd" />
  </svg>
);
export const BellIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 13.484 0 .75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 15.993c.11.343.422.607.796.607h2.308c.373 0 .686-.264.795-.607a12.44 12.44 0 0 1-.16-1.492A19.343 19.343 0 0 0 10 14c-.398 0-.79.018-1.18.052a12.442 12.442 0 0 1-.159 1.492Z" clipRule="evenodd" />
  </svg>
);
export const ExclamationCircleIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
  </svg>
);
export const CheckCircleIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);
export const PlusIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);
export const MinusIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" />
  </svg>
);

// Admin Dashboard Icons
export const PencilIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
  </svg>
);

export const TrashIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
  </svg>
);

export const EyeIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.147.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
  </svg>
);

export const UserPlusIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${props.className || ''}`}>
    <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 8 18a9.953 9.953 0 0 1-5.385-1.572ZM16.25 5.75a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2Z" />
  </svg>
);


// Smartwatch SVG for landing page with live clock and hover data
export const SmartwatchImageSVG = ({ className = "w-48 h-48 mx-auto" }: { className?: string }) => {
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondHandRotation = (seconds / 60) * 360 - 90;
  const minuteHandRotation = ((minutes * 60 + seconds) / 3600) * 360 - 90;
  const hourHandRotation = ((hours * 3600 + minutes * 60 + seconds) / (12 * 3600)) * 360 - 90;
  
  const healthMetrics = [
    { value: "72", unit: "BPM", color: "bg-pink-500", positionClasses: "top-0 -left-10 transform -translate-y-1/2" },
    { value: "98%", unit: "SpO2", color: "bg-blue-500", positionClasses: "left-0 top-1/2 transform -translate-x-full -translate-y-1/2" },
    { value: "36.5°", unit: "Temp", color: "bg-green-500", positionClasses: "bottom-0 -left-10 transform translate-y-1/2" },
    { value: "5280", unit: "Steps", color: "bg-yellow-500", positionClasses: "right-0 top-1/2 transform translate-x-full -translate-y-1/2" },
  ];

  return (
    <div 
      className={`relative group ${className}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Watch Body */}
        <circle cx="50" cy="50" r="48" fill="#374151" /> {/* Darker Gray Body */}
        <circle cx="50" cy="50" r="45" fill="#1f2937" /> {/* Black Face */}
        <circle cx="50" cy="50" r="46" stroke="#4b5563" strokeWidth="2" fill="none" /> {/* Bezel Highlight */}

        {/* Tick Marks */}
        {[...Array(12)].map((_, i) => (
          <line
            key={`major_tick_${i}`}
            x1="50"
            y1="10"
            x2="50"
            y2="14"
            stroke="#6b7280"
            strokeWidth="1.5"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        {[...Array(60)].map((_, i) => (
          <line
            key={`minor_tick_${i}`}
            x1="50"
            y1="10"
            x2="50"
            y2="12"
            stroke="#4b5563"
            strokeWidth="0.5"
            transform={`rotate(${i * 6} 50 50)`}
          />
        ))}
        
        {/* Hands */}
        <line
          x1="50"
          y1="50"
          x2="75" 
          y2="50"
          stroke="#60a5fa" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          transform={`rotate(${hourHandRotation} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="85" 
          y2="50"
          stroke="#93c5fd" 
          strokeWidth="2" 
          strokeLinecap="round"
          transform={`rotate(${minuteHandRotation} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="90" 
          y2="50"
          stroke="#ef4444" 
          strokeWidth="1" 
          strokeLinecap="round"
          transform={`rotate(${secondHandRotation} 50 50)`}
        />
        <circle cx="50" cy="50" r="2.5" fill="#ef4444" /> {/* Center dot */}
      </svg>
      
       {healthMetrics.map((metric, index) => (
        <div 
          key={index} 
          className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center text-xs font-semibold text-white shadow-lg
                     transition-all duration-300 ease-out opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100
                     ${metric.color} ${metric.positionClasses}`}
        >
          <span className="block text-lg font-bold">{metric.value}</span>
          <span className="block text-xs uppercase">{metric.unit}</span>
        </div>
      ))}
    </div>
  );
};


export const ADMIN_SIDEBAR_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon }
];

export const DASHBOARD_TABS: { name: DashboardTab, icon: (props: { className?: string }) => React.ReactNode }[] = [
  { name: DashboardTab.HeartRate, icon: HeartIcon },
  { name: DashboardTab.Steps, icon: ShoePrintsIcon },
  { name: DashboardTab.Sleep, icon: MoonIcon },
  { name: DashboardTab.BloodOxygen, icon: DropletIcon },
  { name: DashboardTab.Temperature, icon: ThermometerIcon },
];


const resolveActivityIcon = (type: string): (props: { className?: string }) => React.ReactNode => {
  if (type.toLowerCase().includes('run')) return RunningIcon;
  if (type.toLowerCase().includes('walk')) return ShoePrintsIcon; 
  if (type.toLowerCase().includes('cycl')) return BikingIcon;
  return ActivityIcon; 
};

export const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'Morning Run', duration: '45 min', caloriesBurned: 350, date: '2024-07-28', icon: resolveActivityIcon('run') },
  { id: '2', type: 'Cycling', duration: '1 hour 15 min', caloriesBurned: 600, date: '2024-07-27', icon: resolveActivityIcon('cycle') },
  { id: '3', type: 'Evening Walk', duration: '30 min', caloriesBurned: 150, date: '2024-07-26', icon: resolveActivityIcon('walk') },
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq1',
    question: "What is WristBud?",
    answer: "WristBud is an advanced platform designed for administrators to seamlessly monitor, manage, and analyze health data sourced from connected smartwatches. It provides comprehensive insights and tools for effective health data oversight."
  },
  {
    id: 'faq2',
    question: "How do I access the admin dashboard?",
    answer: "To access the admin dashboard, navigate to the 'Admin Login' page using the link in the top navigation bar. Enter your administrator credentials to gain access to the full suite of monitoring tools."
  },
  {
    id: 'faq3',
    question: "What kind of data can I monitor?",
    answer: "The admin dashboard allows you to monitor a variety of health metrics, including heart rate, step counts, sleep patterns, blood oxygen saturation (SpO2), and body temperature trends, among others."
  },
  {
    id: 'faq4',
    question: "Is the health data secure?",
    answer: "Yes, WristBud (conceptually) employs robust security measures and protocols to ensure the confidentiality and integrity of all health data. We prioritize data protection in accordance with industry best practices."
  },
   {
    id: 'faq5',
    question: "Can I manage user profiles?",
    answer: "The 'User Profile' section in the admin dashboard (currently a placeholder) is envisioned for managing user-specific data or admin profiles. In a full application, this would allow for detailed user management."
  }
];