import {Component, computed, inject, input} from '@angular/core';
import {FieldTree, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreakpointService, FormFieldErrorDirective, PageTitle} from '@shared-ui';
import {CampaignFormService} from '../../../services/campaign-form.service';
import {CampaignFormModel} from '../../../services/campaign.dtos';
import {FormDeleteButton} from '../../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-campaign-category-fields',
  imports: [
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatButtonModule,
    FormFieldErrorDirective,
    PageTitle,
    FormDeleteButton
  ],
  templateUrl: './campaign-category-fields.html',
  styleUrl: './campaign-category-fields.scss'
})
export class CampaignCategoryFields {
  private readonly _breakpointService = inject(BreakpointService);
  protected readonly campaignFormService = inject(CampaignFormService);

  categoriesArrayInputSignal = input.required<FieldTree<CampaignFormModel['categories']>>({alias: 'categoriesArray'});

  /** Helper signal to iterate over the form array. */
  protected readonly categoriesFormSignal = computed(() => [...this.categoriesArrayInputSignal()]);

  isHandsetSignal = this._breakpointService.isHandsetSignal;
}
