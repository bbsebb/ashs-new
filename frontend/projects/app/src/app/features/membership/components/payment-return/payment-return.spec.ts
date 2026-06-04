import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaymentReturnComponent} from './payment-return';
import {MembershipGateway} from '@shared-api';
import {of, throwError} from 'rxjs';
import {ComponentRef} from '@angular/core';

describe('PaymentReturnComponent', () => {
  let component: PaymentReturnComponent;
  let componentRef: ComponentRef<PaymentReturnComponent>;
  let fixture: ComponentFixture<PaymentReturnComponent>;
  let mockMembershipGateway: any;

  beforeEach(async () => {
    vi.useFakeTimers();

    mockMembershipGateway = {
      getPaymentTransactionStatus: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PaymentReturnComponent],
      providers: [
        {provide: MembershipGateway, useValue: mockMembershipGateway}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentReturnComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set the required ID input
    componentRef.setInput('id', 'tx-123-uuid');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component with initial LOADING status', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.statusSignal()).toBe('LOADING');
  });

  it('should wait 5s and set status to SUCCESS if payment is PAID', () => {
    mockMembershipGateway.getPaymentTransactionStatus.mockReturnValue(of({status: 'PAID'}));

    fixture.detectChanges(); // triggers ngOnInit/effects

    // 4.9s: no request yet (since delay is 5s)
    vi.advanceTimersByTime(4900);
    expect(mockMembershipGateway.getPaymentTransactionStatus).not.toHaveBeenCalled();
    expect(component.statusSignal()).toBe('LOADING');

    // 5s: first request is triggered and returns PAID
    vi.advanceTimersByTime(100);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(1);
    expect(component.statusSignal()).toBe('SUCCESS');
  });

  it('should wait 5s and set status to FAILED if payment is FAILED', () => {
    mockMembershipGateway.getPaymentTransactionStatus.mockReturnValue(of({status: 'FAILED'}));

    fixture.detectChanges();

    vi.advanceTimersByTime(5000);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(1);
    expect(component.statusSignal()).toBe('FAILED');
  });

  it('should wait 5s and set status to FAILED if payment is EXPIRED', () => {
    mockMembershipGateway.getPaymentTransactionStatus.mockReturnValue(of({status: 'EXPIRED'}));

    fixture.detectChanges();

    vi.advanceTimersByTime(5000);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(1);
    expect(component.statusSignal()).toBe('FAILED');
  });

  it('should poll multiple times: 5s (PENDING), +5s (PENDING), +15s (PENDING), +30s (PAID) -> SUCCESS', () => {
    // 1st check: PENDING, 2nd check: PENDING, 3rd check: PENDING, 4th check: PAID
    mockMembershipGateway.getPaymentTransactionStatus
      .mockReturnValueOnce(of({status: 'PENDING'}))
      .mockReturnValueOnce(of({status: 'PENDING'}))
      .mockReturnValueOnce(of({status: 'PENDING'}))
      .mockReturnValueOnce(of({status: 'PAID'}));

    fixture.detectChanges();

    // 5s: 1st check -> PENDING
    vi.advanceTimersByTime(5000);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(1);
    expect(component.statusSignal()).toBe('LOADING');

    // +5s (total 10s): 2nd check -> PENDING
    vi.advanceTimersByTime(5000);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(2);
    expect(component.statusSignal()).toBe('LOADING');

    // +15s (total 25s): 3rd check -> PENDING
    vi.advanceTimersByTime(15000);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(3);
    expect(component.statusSignal()).toBe('LOADING');

    // +30s (total 55s): 4th check -> PAID
    vi.advanceTimersByTime(30000);
    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(4);
    expect(component.statusSignal()).toBe('SUCCESS');
  });

  it('should poll multiple times and show PENDING_TIMEOUT if still PENDING after sequence', () => {
    // All 4 checks return PENDING
    mockMembershipGateway.getPaymentTransactionStatus.mockReturnValue(of({status: 'PENDING'}));

    fixture.detectChanges();

    // 5s (1st)
    vi.advanceTimersByTime(5000);
    // 5s (2nd, total 10s)
    vi.advanceTimersByTime(5000);
    // 15s (3rd, total 25s)
    vi.advanceTimersByTime(15000);
    // 30s (4th, total 55s)
    vi.advanceTimersByTime(30000);

    expect(mockMembershipGateway.getPaymentTransactionStatus).toHaveBeenCalledTimes(4);
    expect(component.statusSignal()).toBe('PENDING_TIMEOUT');
  });

  it('should set status to PENDING_TIMEOUT if the API call fails', () => {
    mockMembershipGateway.getPaymentTransactionStatus.mockReturnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();

    vi.advanceTimersByTime(5000);
    expect(component.statusSignal()).toBe('PENDING_TIMEOUT');
  });
});
