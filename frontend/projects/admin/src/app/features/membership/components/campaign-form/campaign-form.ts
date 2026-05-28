import {Component, inject, input, effect} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {
  FormFieldErrorDirective,
  FormSubmitButton,
  PageTitle
} from '@shared-ui';
import {CampaignFormService} from '../../services/campaign-form.service';
import {CampaignCategoryFields} from './campaign-category-fields/campaign-category-fields';

@Component({
  selector: 'app-campaign-form',
  providers: [CampaignFormService],
  imports: [
    FormRoot,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    FormFieldErrorDirective,
    FormSubmitButton,
    PageTitle,
    CampaignCategoryFields
  ],
  templateUrl: './campaign-form.html',
  styleUrl: './campaign-form.scss'
})
export class CampaignForm {
  protected readonly campaignFormService = inject(CampaignFormService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  private readonly _router = inject(Router);

  /** Input signal for the campaign ID, used to switch to edit mode. */
  idInputSignal = input<string | undefined>(undefined, {alias: 'id'});

  constructor() {
    effect(() => {
      this.campaignFormService.init(this.idInputSignal());
    });
  }

  /**
   * Closes the dialog or navigates back when the user cancels.
   */
  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/membership`);
    }
  }
}
