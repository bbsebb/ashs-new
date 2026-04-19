import {computed, effect, inject, Injectable, linkedSignal, resource, signal, Signal} from '@angular/core';
import {email, FieldTree, form, pattern, required, SchemaPathTree} from '@angular/forms/signals';
import {CreateStaffDTO, FormErrorHandleService, StaffsStore, UpdateStaffDTO} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Staff} from '@shared-domain';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {StaffFormModel} from './staff.dtos';

/**
 * Service managing the state and logic for the staff member form.
 * Handles photo cropping integration, data synchronization with linkedSignal,
 * and asynchronous form submission.
 */
@Injectable()
export class StaffFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  /** Internal signal tracking the ID of the staff member being edited. */
  private _staffIdSignal = signal<string | undefined>(undefined);

  /** Signal providing staff data from the store based on the current ID. */
  readonly staffSignal: Signal<Staff | undefined> = this._staffsStore.staffById(this._staffIdSignal);
  /** Signal indicating if data is currently being fetched from the store. */
  readonly isLoadingSignal = this._staffsStore.isLoadingSignal;

  /**
   * Linked signal synchronizing the form model with the loaded staff data.
   * Automatically updates when staffSignal changes.
   */
  readonly staffFormModelSignal = linkedSignal<StaffFormModel>(() => {
    const staff = this.staffSignal();
    return {
      firstName: staff?.firstName ?? '',
      lastName: staff?.lastName ?? '',
      email: staff?.email ?? '',
      phone: staff?.phone ?? '',
    };
  });

  /** Signal for the cropped avatar blob. */
  readonly blobAvatarSignal = signal<Blob | undefined>(undefined);
  /** Signal for avatar processing state. */
  readonly blobIsLoadingSignal = signal<boolean>(false);
  /** Signal for avatar processing errors. */
  readonly blobErrorSignal = signal<Error | undefined>(undefined);
  /** Linked signal determining if an existing avatar should be shown or replaced. */
  readonly showExistingAvatarSignal = linkedSignal(() => !!this.staffSignal()?.avatarFileName);

  /**
   * Resource managing the lifecycle of the object URL for the avatar preview.
   * Ensures the URL is revoked when the blob changes or component is destroyed.
   */
  readonly previewAvatarResource = resource({
    params: () => this.blobAvatarSignal(),
    loader: async ({params: blob}) => {
      if (!blob) return undefined;
      const url = URL.createObjectURL(blob);
      return {
        url,
        cleanup: () => URL.revokeObjectURL(url)
      };
    }
  });

  /** Computed URL for the avatar preview. */
  readonly previewAvatarUrlSignal = computed(() => this.previewAvatarResource.value()?.url);

  /** Computed signal for a live preview of the staff member profile. */
  readonly staffPreviewSignal = computed(() => {
    const previewUrl = this.previewAvatarUrlSignal();
    const existingAvatar = this.showExistingAvatarSignal() ? this.staffSignal()?.avatarFileName : undefined;

    return {
      ...this.staffFormModelSignal(),
      id: this._staffIdSignal() ?? '',
      avatarFileName: previewUrl ?? existingAvatar,
    } as Staff;
  });

  /** The Signal-based form tree derived from the model. */
  readonly staffFormSignal: FieldTree<StaffFormModel>;
  /** Computed signal determining if the submit button should be disabled. */
  readonly isSubmitDisabledSignal = computed(() => this.staffFormSignal().submitting() || this.staffFormSignal().invalid());

  constructor() {
    this.staffFormSignal = this._buildForm();
    this._initializeAvatarCleanup();
  }

  /**
   * Initializes the service with a staff member ID.
   * @param id The UUID of the member to edit, or undefined for creation.
   */
  init(id: string | undefined) {
    this._staffIdSignal.set(id);
  }

  /**
   * Cleans up the preview URL resource when it changes.
   */
  private _initializeAvatarCleanup() {
    effect((onCleanup) => {
      const resourceValue = this.previewAvatarResource.value();
      if (resourceValue) {
        onCleanup(() => resourceValue.cleanup());
      }
    });
  }

  /**
   * Defines validation rules for the staff member form fields.
   */
  private _applyValidationSchema(path: SchemaPathTree<StaffFormModel>) {
    required(path.firstName, {message: 'Le prénom est requis.'});
    required(path.lastName, {message: 'Le nom est requis.'});
    email(path.email, {message: `L'email n'est pas valide.`});
    pattern(path.phone, /^[0-9+()\-\s]{6,20}$/, {message: 'Le numéro de téléphone est invalide.'});
  }

  /**
   * Handles form submission, including multipart data (JSON DTO + Avatar Blob).
   */
  private _handleStaffSubmission = async (form: FieldTree<StaffFormModel>) => {
    const currentId = this._staffIdSignal();
    const oldStaff = this.staffSignal();
    const model = this.staffFormModelSignal();

    const staffDTO: CreateStaffDTO | UpdateStaffDTO = {
      ...model,
      phone: model.phone.trim() || null,
      email: model.email.trim() || null,
    };

    const request$ = !oldStaff
      ? this._staffsStore.createStaff(staffDTO as CreateStaffDTO, this.blobAvatarSignal())
      : this._staffsStore.updateStaff(oldStaff.id, {
        ...staffDTO,
        avatarFileName: this.showExistingAvatarSignal() ? oldStaff.avatarFileName : null
      }, this.blobAvatarSignal());

    try {
      const result = await firstValueFrom(request$);
      this._notificationService.show(`Le membre de l'encadrement a été ${!oldStaff ? 'enregistré' : 'mise à jour'}`, 'success');

      if (this._dialogReference) {
        this._dialogReference.close(result);
      } else {
        void this._router.navigateByUrl(`/staffs/${result.id}`);
      }
      return undefined;
    } catch (error) {
      return this._handleSubmissionError(error, form);
    }
  };

  /**
   * Maps backend/network errors to the form tree using the central error handler.
   */
  private _handleSubmissionError(error: unknown, form: FieldTree<StaffFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  /**
   * Builds the Signal-based form configuration.
   */
  private _buildForm(): FieldTree<StaffFormModel> {
    return form(this.staffFormModelSignal, (path) => this._applyValidationSchema(path), {
      submission: {
        action: this._handleStaffSubmission
      }
    });
  }
}
