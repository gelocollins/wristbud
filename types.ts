import { ReactNode } from 'react';

export interface NavItem {
  name: string;
  path: string;
  icon: (props: { className?: string }) => ReactNode; // For SVG icon components
}

export enum DashboardTab {
  HeartRate = 'Heart Rate',
  Steps = 'Steps',
  Sleep = 'Sleep',
  BloodOxygen = 'Blood Oxygen',
  Temperature = 'Temperature',
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface SleepStageDataPoint {
  time: string;
  awake: number;
  rem: number;
  light: number;
  deep: number;
}

export interface Activity {
  id: string;
  type: string;
  duration: string;
  caloriesBurned: number;
  date: string;
  icon: (props: { className?: string }) => ReactNode; // For SVG icon components
}

export interface UserProfile {
  name: string;
  email: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}