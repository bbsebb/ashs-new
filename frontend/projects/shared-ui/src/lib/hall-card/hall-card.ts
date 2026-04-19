import {Component, computed, input} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {Hall} from '@shared-domain';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDividerModule} from "@angular/material/divider";
import {SafePipe} from "../pipes";

/**
 * Component for displaying a card with information about a sports hall.
 * Includes the address and links to Google Maps (search and embed).
 */
@Component({
  selector: 'lib-hall-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    SafePipe,
  ],
  templateUrl: './hall-card.html',
  styleUrl: './hall-card.scss',
})
export class HallCard {
  /**
   * The hall object to display.
   */
  hallInputSignal = input.required<Hall>({alias: 'hall'})

  /**
   * Computed signal: formatted address string for display and maps integration.
   */
  fullAddressSignal = computed(() => {
    const h = this.hallInputSignal();
    return `${h.addressStreet}, ${h.addressPostalCode} ${h.addressCity}, ${h.addressCountry}`;
  });

  /**
   * Computed signal: the external Google Maps search URL.
   */
  googleMapsUrlSignal = computed(() => {
    const query = encodeURIComponent(this.fullAddressSignal());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  });

  /**
   * Computed signal: the embedded Google Maps iframe URL.
   */
  googleMapsEmbedUrlSignal = computed(() => {
    const query = encodeURIComponent(this.fullAddressSignal());
    return `https://www.google.com/maps?q=${query}&output=embed`;
  });
}
