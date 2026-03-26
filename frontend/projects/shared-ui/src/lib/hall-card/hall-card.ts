import {Component, computed, input} from '@angular/core';
import {
  MatCardModule
} from "@angular/material/card";
import {Hall} from '@shared-domain';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDividerModule} from "@angular/material/divider";
import {SafePipe} from "../pipes/safe.pipe";

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
  hallSignal = input.required<Hall>({alias: 'hall'})

  fullAddress = computed(() => {
    const h = this.hallSignal();
    return `${h.addressStreet}, ${h.addressPostalCode} ${h.addressCity}, ${h.addressCountry}`;
  });

  googleMapsUrl = computed(() => {
    const query = encodeURIComponent(this.fullAddress());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  });

  googleMapsEmbedUrl = computed(() => {
    const query = encodeURIComponent(this.fullAddress());
    return `https://www.google.com/maps?q=${query}&output=embed`;
  });
}
