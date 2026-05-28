import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {applyEach, FieldTree, form, min, required, SchemaPathTree, validateTree} from '@angular/forms/signals';
import {CampaignStore, FormErrorHandleService, SeasonsStore} from '@shared-api';
import {Campaign} from '@shared-domain';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {AdminDialogService} from '../../../shared/services/admin-dialog.service';
import {CampaignFormModel} from './campaign.dtos';

/**
 * Service managing the state and logic for the membership campaign form.
 * Handles creation, updates, and dynamic category management.
 */
@Injectable()
export class CampaignFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _campaignStore = inject(CampaignStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  private readonly _adminDialogs = inject(AdminDialogService);

  /** Internal signal tracking the ID of the campaign being edited. */
  private _campaignIdSignal = signal<string | undefined>(undefined);

  /** Signal providing the campaign data from the store based on the current ID. */
  readonly campaignSignal: Signal<Campaign | undefined> = this._campaignStore.campaignById(this._campaignIdSignal);
  /** Signal for available seasons. */
  readonly seasonsSignal = this._seasonsStore.seasonsSignal;

  /**
   * Linked signal synchronizing the form model with the loaded campaign data.
   * Resets to empty for new campaigns.
   */
  readonly campaignFormModelSignal = linkedSignal<CampaignFormModel>(() => {
    const campaign = this.campaignSignal();
    return {
      seasonId: campaign?.seasonId ?? '',
      categories: campaign?.categories?.map(c => ({...c})) ?? []
    };
  });

  /** The Signal-based form tree derived from the model. */
  readonly campaignFormSignal: FieldTree<CampaignFormModel>;
  /** Computed signal determining if the submit button should be disabled. */
  readonly isSubmitDisabledSignal = computed(() => this.campaignFormSignal().submitting() || this.campaignFormSignal().invalid());

  constructor() {
    this.campaignFormSignal = this._buildForm();
  }

  /**
   * Initializes the service with a campaign ID.
   * @param id The UUID of the campaign to edit, or undefined for creation.
   */
  init(id: string | undefined) {
    this._campaignIdSignal.set(id);
  }

  /**
   * Defines validation rules for the campaign form.
   */
  private _applyValidationSchema(path: SchemaPathTree<CampaignFormModel>) {
    required(path.seasonId, {message: 'La saison est requise.'});

    validateTree(path.categories, (context) => {
      if (this.campaignFormModelSignal().categories.length === 0) {
        return {
          kind: 'error',
          message: 'La campagne doit contenir au moins une catégorie.'
        };
      }
      return undefined;
    });

    applyEach(path.categories, (category) => {
      required(category.name, {message: 'Le nom de la catégorie est requis.'});
      required(category.amount, {message: 'Le montant est requis.'});
      min(category.amount, 0, {message: 'Le montant doit être positif.'});
    });
  }

  /**
   * Handles form submission logic.
   * Dispatches create or update requests based on campaign state.
   */
  private _handleCampaignSubmission = async (form: FieldTree<CampaignFormModel>) => {
    const currentId = this._campaignIdSignal();
    const model = this.campaignFormModelSignal();

    const request$ = !currentId
      ? this._campaignStore.createCampaign({
        seasonId: model.seasonId,
        categories: model.categories
      })
      : this._campaignStore.updateCampaign(currentId, {
        categories: model.categories
      });

    try {
      const result = await firstValueFrom(request$);
      this._notificationService.show(
        `La campagne a été ${!currentId ? 'enregistrée' : 'mise à jour'}`,
        'success'
      );

      if (this._dialogReference) {
        this._dialogReference.close(result);
      } else {
        void this._router.navigateByUrl(`/membership`);
      }
      return undefined;
    } catch (error) {
      return this._handleSubmissionError(error, form);
    }
  };

  private _handleSubmissionError(error: unknown, form: FieldTree<CampaignFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  private _buildForm(): FieldTree<CampaignFormModel> {
    return form(this.campaignFormModelSignal, (path) => this._applyValidationSchema(path), {
      submission: {
        action: this._handleCampaignSubmission
      }
    });
  }

  /**
   * Adds a new empty category row to the model.
   */
  addCategory() {
    this.campaignFormModelSignal.update(model => ({
      ...model,
      categories: [...model.categories, {name: '', amount: 0}]
    }));
  }

  /**
   * Removes a category row by its index.
   */
  removeCategory(index: number) {
    this.campaignFormModelSignal.update(model => ({
      ...model,
      categories: model.categories.filter((_, i) => i !== index)
    }));
  }

  /**
   * Opens a dialog to create a new season and selects it upon success.
   */
  addSeason() {
    this._adminDialogs.openSeasonForm().subscribe((result) => {
      if (result) {
        queueMicrotask(() => {
          this.campaignFormModelSignal.update(currentModel => ({
            ...currentModel,
            seasonId: result.id
          }));
        });
      }
    });
  }
}
