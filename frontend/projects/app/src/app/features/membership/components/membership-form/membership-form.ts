import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormField, FormRoot, submit} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CommonModule} from '@angular/common';
import {CategoryDto, MembershipCreateRequest, MembershipPaymentOrder} from '@shared-api';
import {Campaign} from '@shared-domain';
import {FormFieldErrorDirective} from '@shared-ui';
import {MembershipFormService} from '../../services/membership-form.service';

export interface MembershipFormViewModel {
  campaign: Campaign;
  isSubmitting: boolean;
}

/**
 * Dumb Component for the Membership registration form.
 * Renders the payer info and a dynamic list of members to register.
 * Uses Angular Signal-based forms via MembershipFormService.
 */
@Component({
  selector: 'app-membership-form',
  providers: [MembershipFormService],
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    FormRoot,
    FormFieldErrorDirective,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './membership-form.html',
  styleUrl: './membership-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipFormComponent {
  readonly membershipFormService = inject(MembershipFormService);

  /** ViewModel input containing campaign details and loading state. */
  readonly viewModelInputSignal = input.required<MembershipFormViewModel>({alias: 'viewModel'});

  /** Event emitted on form submission. */
  readonly submitOrder = output<MembershipPaymentOrder>();

  /** Helper signal to iterate over the members form array. */
  protected readonly membersFormSignal = computed(() => [...this.membershipFormService.membershipFormSignal.members]);

  /** Calculates the cumulative price of all chosen membership categories. */
  calculateTotal(): number {
    const campaign = this.viewModelInputSignal().campaign;
    const model = this.membershipFormService.membershipModelSignal();
    const amounts: number[] = [];

    for (const member of model.members) {
      const matchedCategory = campaign.categories.find(c => c.name === member.categoryName);
      if (matchedCategory) {
        amounts.push(matchedCategory.amount);
      }
    }

    const initialAmount = amounts.reduce((acc, val) => acc + val, 0);
    let discountAmount = 0;

    if (this.membershipFormService.hasDiscountSignal() && this.membershipFormService.membershipSize() > 2 && amounts.length > 0) {
      const minAmount = Math.min(...amounts);
      discountAmount = Math.round((minAmount / 2) * 100) / 100;
    }

    return initialAmount - discountAmount;
  }

  /** Adds a new member. */
  addMember(): void {
    this.membershipFormService.addMember();
  }

  /** Handles the manual change of the family discount checkbox. */
  onDiscountChange(checked: boolean): void {
    this.membershipFormService.hasDiscountSignal.set(checked);
  }

  /** Handles the form submission. */
  onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.membershipFormService.membershipFormSignal, async () => {
      const val = this.membershipFormService.membershipModelSignal();
      const campaign = this.viewModelInputSignal().campaign;

      // Map form fields to API payload structure
      const membershipRequests: MembershipCreateRequest[] = val.members.map(m => {
        const matchedCategory = campaign.categories.find(c => c.name === m.categoryName);
        const category: CategoryDto = {
          name: m.categoryName,
          amount: matchedCategory ? matchedCategory.amount : 0
        };

        return {
          firstName: m.firstName.trim(),
          lastName: m.lastName.trim(),
          email: m.email.trim(),
          licenseNumber: m.licenseNumber.trim(),
          category: category
        };
      });

      const order: MembershipPaymentOrder = {
        campaignId: campaign.id,
        paymentPayerInfoCreateRequest: {
          firstname: val.payer.firstname.trim(),
          lastname: val.payer.lastname.trim(),
          email: val.payer.email.trim()
        },
        membershipCreateRequests: membershipRequests,
        hasDiscount: this.membershipFormService.hasDiscountSignal()
      };

      this.submitOrder.emit(order);
      return undefined;
    });
  }
}
