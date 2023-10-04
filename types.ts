export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface Customer extends BaseEntity {
  fullName?: string;
  concat?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  defaultPhoneId?: number;
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
  AddressId?: number;
  Adddress?: Address;
  CarId?: number;
  Customer?: Customer;
  CustomerId?: number;
  FormSubmissionId?: number;
  arrivalTime: string;
  assignedTechnician?: object;
  assignedTechnicianId?: number;
  canceledAt?: string;
  completedAt?: string;
  dispatcherId?: number;
  linkCode?: string;
  paymentStatus?: string;
  status?: string;
}
