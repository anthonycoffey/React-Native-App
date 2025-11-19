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
  phone?: string;
  defaultPhone?: { number: string };
  defaultPhoneId?: number;
  CustomerPhones?: CustomerPhone[];
  Cars?: Car[];
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
  proxy: Proxy | null;
  assignedTechnician?: AssignedTechnician;
  JobLineItems: JobLineItems[];
  JobActions?: JobActions[];
  Discounts?: Discount[];
  Invoices?: Invoice[];
  JobFiles?: JobFile[];
  JobComments?: JobComment[];
  referralCode?: string | null;
  Payments?: Payment[];
}

export interface Payment extends BaseEntity {
  JobId: number;
  type: 'cash' | 'card' | string;
  amount: number;
  tip?: number;
  status?: string;
  transactionId?: string | null;
  paymentIntentId?: string | null;
  notes?: string | null;
}

export interface JobComment extends BaseEntity {
  text: string;
  JobId: number;
  UserId: number;
  User?: User;
}

export interface JobFile {
  id: number;
  url: string;
  name: string;
  type: string;
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
  price: number;
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
  avatar?: string | null;
  location?: {
    type?: string;
    coordinates?: number[];
    crs?: object;
  } | null;
  referralCode?: string | null;
  referralCodeUsed?: number | null;
  vehicleDescription?: string;
  vehiclePlate?: string;
}

export interface ProxyNumber extends BaseEntity {
  inUse?: boolean;
  sid?: string;
  number?: string;
  ProxySessionId?: number;
}

export interface ApiDiscountCode extends BaseEntity {
  code: string;
  reason: string;
  type: 'fixed' | 'percent';
  amount: number;
  isActive: boolean;
}

export interface NewDiscountData {
  amount: number;
  reason: string;
  DiscountCodeId?: number | null;
}

export type JobScreenParams = {
  id: string;
};

export interface Paycheck extends BaseEntity {
  amount: number;
  status: string;
  UserId: number;
  PayrollId: number;
  User?: User;
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
