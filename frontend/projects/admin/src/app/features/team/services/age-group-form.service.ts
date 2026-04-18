import {computed, inject, Injectable, linkedSignal} from '@angular/core';
import {AgeGroupStore, CreateAgeGroupDTO, FormErrorHandleService} from '@shared-api';
import {Router} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {FieldTree, form, schema, SchemaPathTree} from '@angular/forms/signals';
import {firstValueFrom} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {AgeGroupFormModel} from './age-group.dtos';

@Injectable()
export class AgeGroupFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  readonly ageGroupModelSignal = linkedSignal<AgeGroupFormModel>(() => {
    return {
      ageLimit: 0,
      upperLimit: false,
    };
  });

  readonly ageGroupPreviewSignal = computed(() => this._preview(this.ageGroupModelSignal()));
  readonly isSubmitDisabledSignal = computed(() => this.ageGroupForm().submitting() || this.ageGroupForm().invalid());
  readonly ageGroupForm: FieldTree<AgeGroupFormModel>;

  constructor() {
    this.ageGroupForm = this._buildForm();
  }

  private _applyValidationSchema(path: SchemaPathTree<AgeGroupFormModel>) {
    // Schema logic if needed
  }

  private _handleAgeGroupSubmission = async (form: FieldTree<AgeGroupFormModel>) => {
    const model = this.ageGroupModelSignal();
    const ageGroupDTO: CreateAgeGroupDTO = {
      ...model,
    };

    try {
      const result = await firstValueFrom(this._ageGroupStore.createAgeGroup(ageGroupDTO));
      this._notificationService.show("La catégorie a été enregistrée", 'success');

      if (this._dialogReference) {
        this._dialogReference.close(result);
      } else {
        void this._router.navigateByUrl(`/teams`);
      }
      return undefined;
    } catch (error) {
      return this._handleSubmissionError(error, form);
    }
  };

  private _handleSubmissionError(error: unknown, form: FieldTree<AgeGroupFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  private _buildForm(): FieldTree<AgeGroupFormModel> {
    return form(this.ageGroupModelSignal, schema((path) => this._applyValidationSchema(path)), {
      submission: {
        action: this._handleAgeGroupSubmission
      }
    });
  }

  private _preview(ageGroupModel: AgeGroupFormModel): string {
    const sign = ageGroupModel.upperLimit ? "-" : "+";
    return `${sign}${ageGroupModel.ageLimit} ans`;
  }
}
