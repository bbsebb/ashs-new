import {Component, computed, input} from '@angular/core';
import {Hall} from '@shared-domain';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';


@Component({
  selector: 'app-hall-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatTooltipModule],
  templateUrl: './hall-card.html',
  styleUrl: './hall-card.scss',
})
export class HallCard {
  hall = input.required<Hall>();

  fullAddress = computed(() => {
    const h = this.hall();
    return `${h.addressStreet}, ${h.addressPostalCode} ${h.addressCity}, ${h.addressCountry}`;
  });

  googleMapsUrl = computed(() => {
    const query = encodeURIComponent(this.fullAddress());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  });
}
