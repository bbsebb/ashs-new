import {UUID} from '@shared-domain';

/** DTO for payment payer information. */
export type PaymentPayerInfoCreateRequest = {
  firstname: string;
  lastname: string;
  email: string;
}

/** DTO for category details in a membership creation request. */
export type CategoryDto = {
  name: string;
  amount: number;
}

/** DTO for creating a single membership. */
export type MembershipCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  category: CategoryDto;
}

/** DTO for initiating a membership payment process. */
export type MembershipPaymentOrder = {
  campaignId: UUID;
  paymentPayerInfoCreateRequest: PaymentPayerInfoCreateRequest;
  membershipCreateRequests: MembershipCreateRequest[];
  hasDiscount: boolean;
}

/** DTO for detailed SumUp checkout details returned by the API. */
export type SumUpCheckoutDto = {
  id: string;
  description?: string;
  returnUrl?: string;
  date?: string;
  checkoutUrl: string;
}

/** DTO representing a created membership response. */
export type MembershipResponse = {
  id: UUID;
  campaignId: UUID;
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  categoryName: string;
  amount: number;
  status: string;
}


export type PaymentPayerResponse = {
  firstName: string;
  lastName: string;
  email: string;
}

export type PaymentResponse = {
  id: UUID;
  campaignId: UUID;
  amount: number;
  payerInfo: PaymentPayerResponse;
  status: string;
  checkoutDate?: string;
  isDiscounted: boolean;
  memberships: MembershipResponse[];
}

