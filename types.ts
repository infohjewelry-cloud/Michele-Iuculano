
export type UserRole = 'customer' | 'installer';
export type InstallerType = 'idraulico' | 'elettricista';

export interface Review {
  id: string;
  authorId: string; // Added to identify the owner for editing
  authorName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface PlatformReview {
  id: string;
  authorName: string;
  role: string; // 'Cliente' or 'Installatore'
  rating: number;
  comment: string;
  date: string;
}

export interface ServicePrice {
  id: string;
  name: string;
  price: number;
  icon?: string; // Added icon field
}

export interface InstallerProfile {
  id: string;
  name: string;
  type: InstallerType;
  location: string;
  bio: string;
  isAvailable: boolean;
  services: ServicePrice[];
  reviews: Review[];
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  isSubscribed: boolean;
  isAdmin?: boolean; // NEW: Flag to identify the platform owner/admin
  profile?: InstallerProfile; // Only if role is installer
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected';

export interface Booking {
  id: string;
  installerId: string;
  customerId: string; // Added to target notifications
  customerName: string;
  serviceName: string;
  date: string; // ISO String for simplicity
  status: BookingStatus;
  notes: string;
}

export interface BigOpportunity {
  id: string;
  authorId: string; // ID of the creator (admin or installer)
  title: string;
  description: string;
  location: string;
  budgetRange: string;
  postedDate: string;
  applicants: string[]; // List of installer IDs who applied
  type: InstallerType | 'both';
}

export interface Supplier {
  id: string;
  name: string;
  category: 'idraulica' | 'elettrico' | 'generale';
  description: string;
  discount: string; // e.g. "20% di sconto"
  location: string;
  website: string;
  logoUrl: string;
}

export interface AppNotification {
  id: string;
  userId: string; // The recipient
  message: string;
  type: 'success' | 'info' | 'alert';
  isRead: boolean;
  timestamp: number;
}

// Community Types
export interface Comment {
  id: string;
  authorName: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'consiglio' | 'prezzi' | 'esperienza' | 'altro';
  date: string;
  likes: number;
  comments: Comment[];
}

export const SUBSCRIPTION_PRICES = {
  customer: 4.99,
  customerYearly: 44.99,
  installer: 9.99,
  installerYearly: 99.9
};
