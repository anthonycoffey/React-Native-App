import { ImageSourcePropType } from 'react-native';

export type availableAppsProps = {
  icon: ImageSourcePropType;
  name: string;
  id: number;
  open: () => Promise<void>;
};

export type location = {
  lat: number;
  lng: number;
  place_id?: string;
  formatted_address?: string;
  location_type: string;
};

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface Customer extends BaseEntity {
  fullName?: string;
  concat?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string; // For new customer creation
  defaultPhone?: { number: string };
  defaultPhoneId?: number;
  CustomerPhones?: CustomerPhone[];
  Cars?: Car[]; // Optional list of cars associated with the customer
}

export interface CustomerPhone extends BaseEntity {
  number: string;
  note?: string;
  CustomerId?: number;
  Customer?: Customer;
}

export interface Address extends BaseEntity {
  short?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  zipcode?: number;
  lat?: number;
  lng?: number;
}

export interface Job extends BaseEntity {
  AddressId: number;
  Address: Address;
  CarId: number;
  Car: Car;
  Customer: Customer;
  CustomerId: number;
  FormSubmissionId?: number;
  arrivalTime: string;
  assignedTechnicianId?: number;
  canceledAt?: string;
  completedAt?: string;
  dispatcherId?: number;
  linkCode?: string;
  paymentStatus: string;
  status: string;
  proxy: Proxy | null; // Allow null for no active proxy
  assignedTechnician?: AssignedTechnician; // Add assignedTechnician object
  JobLineItems: JobLineItems[];
  JobActions?: JobActions[];
  Discounts?: Discount[];
  Invoices?: Invoice[];
  JobFiles?: JobFile[];
  JobComments?: JobComment[]; // Added JobComments
  referralCode?: string | null; // Added for job-specific referral code
  Payments?: Payment[]; // Added for list of payments
}

export interface Payment extends BaseEntity {
  JobId: number;
  type: 'cash' | 'card' | string; // Payment method
  amount: number; // Amount in cents
  tip?: number; // Optional tip in cents
  status?: string; // e.g., 'succeeded', 'pending', 'failed'
  transactionId?: string | null; // Optional transaction ID from payment gateway
  paymentIntentId?: string | null; // Optional payment intent ID
  notes?: string | null; // Optional notes about the payment
}

export interface JobComment extends BaseEntity {
  text: string;
  JobId: number;
  UserId: number; // Assuming comments are linked to a User
  User?: User; // To include commenter details
}

export interface JobFile {
  id: number;
  url: string;
  name: string;
  type: string; // e.g., "image/jpeg", "video/mp4"
  createdAt: string;
  updatedAt: string;
  JobId: number;
}

export interface Invoice extends BaseEntity {
  jobId: number;
  linkCode?: string;
  status: string;
  total: number;
}

export interface Discount extends BaseEntity {
  reason?: string;
  amount: number;
  JobId?: number;
  DiscountCodeId?: number;
}

export interface JobLineItems extends BaseEntity {
  price: number;
  JobId: number;
  ServiceId: number;
  Service: Service;
}

export interface JobLineItemCreate {
  ServiceId: number;
  price: number; // Price in cents
}

export interface Service extends BaseEntity {
  name: string;
  description: string | '';
  payoutRate?: number;
  payoutMinimum?: number;
  price: number;
  isDefault?: boolean;
  isInternal?: boolean;
}

export interface JobActions extends BaseEntity {
  action?: string;
  JobId?: number;
  UserId?: number;
  User?: User;
}

export interface Car extends BaseEntity {
  concat?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  plate?: string;
  vin?: string | null;
  CustomerId?: number;
}

export interface Dispatcher extends BaseEntity {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  otp?: string;
  otpExpiration?: string;
  banned?: boolean;
  isOnline?: boolean;
  latitude?: number;
  longitude?: number;
  lastGeolocationUpdate?: string;
  darkMode?: boolean;
}

export interface AssignedTechnician extends BaseEntity {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  otp?: string;
  otpExpiration?: string;
  banned?: boolean;
  isOnline?: boolean;
  latitude?: number;
  longitude?: number;
  lastGeolocationUpdate?: string;
  darkMode?: boolean;
}

export interface Proxy extends BaseEntity {
  active?: boolean;
  JobId?: number;
  UserId?: number;
  CustomerId?: number;
  ProxyNumberId?: number;
  CustomerPhoneId?: number;
  ProxyNumber?: ProxyNumber;
  CustomerPhone: CustomerPhone;
  User?: User;
}

export interface User extends BaseEntity {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  otp?: string;
  otpExpiration?: string;
  banned?: boolean;
  isOnline?: boolean;
  latitude?: number;
  longitude?: number;
  lastGeolocationUpdate?: string;
  darkMode?: boolean;
  avatar?: string | null; // Added from AuthContext
  location?: { // Added from AuthContext
    type?: string;
    coordinates?: number[];
    crs?: object;
  } | null;
  referralCode?: string | null; // Added from AuthContext
  referralCodeUsed?: number | null; // Added from AuthContext
}

export interface ProxyNumber extends BaseEntity {
  inUse?: boolean;
  sid?: string;
  number?: string;
  ProxySessionId?: number;
}

// Types for Discount Feature Refactor
export interface ApiDiscountCode extends BaseEntity {
  code: string;
  reason: string; // Or constructed if not directly from API
  type: 'fixed' | 'percent';
  amount: number; // Cents for 'fixed', percentage value for 'percent'
  isActive: boolean; // Likely true if fetched from 'active' endpoint
  // Add any other relevant fields from your DiscountCode model
}

export interface NewDiscountData {
  amount: number; // Final calculated discount amount in cents
  reason: string;
  DiscountCodeId?: number | null;
}

export type JobScreenParams = {
  id: string;
};

// Paycheck related types
export interface Paycheck extends BaseEntity {
  amount: number; // in cents
  status: string;
  UserId: number;
  PayrollId: number;
  User?: User; // Optional, as it's an included relation
}

export interface PaginationMeta {
  total: number;
  currentPage: number;
  limit: number;
  lastPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
