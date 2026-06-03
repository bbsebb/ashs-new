/**
 * ViewModel for displaying full details of a membership.
 */
export interface MembershipDetailsViewModel {
  id: string;
  campaignId: string;
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  categoryName: string;
  amount: number;
  status: string;
}

/**
 * ViewModel for a mini/compact representation of a membership.
 */
export interface MembershipMiniViewModel {
  id: string;
  firstName: string;
  lastName: string;
  categoryName: string;
  status: string;
}

/**
 * ViewModel for displaying full details of a payment transaction.
 */
export interface PaymentDetailsViewModel {
  id: string;
  campaignId: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  status: string;
  checkoutDate?: string;
  isDiscounted: boolean;
  memberships: MembershipMiniViewModel[];
}

/**
 * ViewModel for displaying the list of payment transactions for a campaign.
 */
export interface CampaignPaymentsViewModel {
  payments: PaymentDetailsViewModel[];
  isLoading: boolean;
  error: any;
}
