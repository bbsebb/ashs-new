import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MembershipGateway} from '@shared-api';
import {ButtonBackHomeDirective} from '@shared-ui';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [
    CommonModule,
    ButtonBackHomeDirective,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-return.html',
  styleUrl: './payment-return.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentReturnComponent {
  private readonly _membershipGateway = inject(MembershipGateway);
  private readonly _destroyRef = inject(DestroyRef);

  readonly idInputSignal = input.required<string>({alias: 'id'});

  readonly statusSignal = signal<'LOADING' | 'SUCCESS' | 'FAILED' | 'PENDING_TIMEOUT'>('LOADING');

  private readonly delays = [5000, 5000, 15000, 30000];
  private currentAttempt = 0;
  private timeoutId?: any;

  constructor() {
    // Register cleanup callback on component destruction using DestroyRef
    this._destroyRef.onDestroy(() => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    });

    // Initialize polling immediately
    this.scheduleNextCheck();
  }

  private scheduleNextCheck(): void {
    if (this.currentAttempt >= this.delays.length) {
      this.statusSignal.set('PENDING_TIMEOUT');
      return;
    }

    const delay = this.delays[this.currentAttempt];
    this.timeoutId = setTimeout(() => {
      this.checkStatus();
    }, delay);
  }

  private checkStatus(): void {
    const id = this.idInputSignal();
    this._membershipGateway.getPaymentTransactionStatus(id).subscribe({
      next: (response) => {
        if (response.status === 'PAID' || response.status === 'PROCESSED') {
          this.statusSignal.set('SUCCESS');
        } else if (response.status === 'FAILED' || response.status === 'EXPIRED') {
          this.statusSignal.set('FAILED');
        } else if (response.status === 'PENDING') {
          this.currentAttempt++;
          this.scheduleNextCheck();
        }
      },
      error: () => {
        this.statusSignal.set('PENDING_TIMEOUT');
      }
    });
  }
}
