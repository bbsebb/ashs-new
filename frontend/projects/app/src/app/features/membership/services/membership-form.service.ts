import {computed, inject, Injectable, linkedSignal, signal, WritableSignal} from '@angular/core';
import {applyEach, email, FieldTree, form, pattern, required, SchemaPathTree} from '@angular/forms/signals';
import {DialogService} from '@shared-ui';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {exhaustMap, filter, pairwise} from 'rxjs';

export interface MemberFormModel {
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  categoryName: string;
}

export interface PayerFormModel {
  firstname: string;
  lastname: string;
  email: string;
}

export interface MembershipFormModel {
  payer: PayerFormModel;
  members: MemberFormModel[];
}

/**
 * Service managing the state and validation for the Membership registration form.
 * Uses Angular Signal-based forms.
 */
@Injectable()
export class MembershipFormService {
  private readonly _dialogService = inject(DialogService);

  /** Writable Signal representing the raw form data. */
  readonly membershipModelSignal = signal<MembershipFormModel>({
    payer: {
      firstname: '',
      lastname: '',
      email: ''
    },
    members: [
      {
        firstName: '',
        lastName: '',
        email: '',
        licenseNumber: '',
        categoryName: ''
      }
    ]
  });

  readonly membershipSize = computed(() => {
    const members = this.membershipModelSignal().members;

    // On filtre le tableau pour ne garder que les membres
    // ayant un categoryName défini et non vide (après suppression des espaces)
    return members.filter(member =>
      member.categoryName && member.categoryName.trim() !== ''
    ).length;
  });

  /** Signal managing whether a family discount should be applied. */
  readonly hasDiscountSignal: WritableSignal<boolean> = linkedSignal({
    source: this.membershipSize,
    computation: (newCount, previous) => {
      // À l'initialisation (quand previous n'existe pas encore)
      if (!previous) return false;

      const wasTrue = previous.value;

      // Règle 1 et 2 : S'il est actuellement true...
      if (wasTrue) {
        // ...il reste true UNIQUEMENT si on a 3 items ou plus.
        // S'il y a moins de 3 items, ça retournera automatiquement false.
        return newCount >= 3;
      }

      // Règle 3 : S'il est actuellement false, il reste false quoi qu'il arrive
      return false;
    }
  });
  /** The Signal-based form tree. */
  readonly membershipFormSignal: FieldTree<MembershipFormModel>;

  constructor() {
    this.membershipFormSignal = this._buildForm();
    toObservable(this.membershipSize)
      .pipe(
        pairwise(),
        // On ne déclenche QUE si on passe strictement de 2 à 3
        filter(([prev, curr]) => prev === 2 && curr === 3),
        // exhaustMap ouvre le dialogue et attend la réponse (true/false)
        exhaustMap(() => this._dialogService.showConfirmation(
          "Cette réduction ne s'applique que pour les membres du même foyer. Souhaitez-vous l'appliquer ?",
          "Réduction Foyer"
        )),
        takeUntilDestroyed()
      )
      .subscribe((resultatDuDialogue: boolean) => {
        // 4. On met à jour le linkedSignal avec la réponse de l'utilisateur
        this.hasDiscountSignal.set(resultatDuDialogue);
      });

  }

  private _buildForm(): FieldTree<MembershipFormModel> {
    return form(this.membershipModelSignal, (path) => this._applyValidationSchema(path));
  }

  private _applyValidationSchema(path: SchemaPathTree<MembershipFormModel>) {
    required(path.payer.firstname, {message: 'Le prénom du payeur est requis.'});
    pattern(path.payer.firstname, /^\s*\S.*$/, {message: 'Le prénom du payeur ne peut pas être vide.'});

    required(path.payer.lastname, {message: 'Le nom du payeur est requis.'});
    pattern(path.payer.lastname, /^\s*\S.*$/, {message: 'Le nom du payeur ne peut pas être vide.'});

    required(path.payer.email, {message: "L'adresse e-mail du payeur est requise."});
    email(path.payer.email, {message: "L'adresse e-mail du payeur n'est pas valide."});

    applyEach(path.members, (member) => {
      required(member.firstName, {message: 'Le prénom est requis.'});
      pattern(member.firstName, /^\s*\S.*$/, {message: 'Le prénom ne peut pas être vide.'});

      required(member.lastName, {message: 'Le nom est requis.'});
      pattern(member.lastName, /^\s*\S.*$/, {message: 'Le nom ne peut pas être vide.'});

      required(member.email, {message: "L'adresse e-mail est requise."});
      email(member.email, {message: "L'adresse e-mail n'est pas valide."});

      required(member.licenseNumber, {message: 'Le numéro de licence est requis.'});
      pattern(member.licenseNumber, /^\s*\S.*$/, {message: 'Le numéro de licence ne peut pas être vide.'});

      required(member.categoryName, {message: 'La catégorie est requise.'});
    });
  }

  /** Adds a new empty member to the form model. */
  addMember() {
    this.membershipModelSignal.update(model => ({
      ...model,
      members: [
        ...model.members,
        {
          firstName: '',
          lastName: '',
          email: '',
          licenseNumber: '',
          categoryName: ''
        }
      ]
    }));
  }

  /** Removes a member from the form model by index. */
  removeMember(index: number) {
    this.membershipModelSignal.update(model => {
      if (model.members.length > 1) {
        return {
          ...model,
          members: model.members.filter((_, i) => i !== index)
        };
      }
      return model;
    });
  }
}
