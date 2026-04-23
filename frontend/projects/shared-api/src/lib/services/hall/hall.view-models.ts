/**
 * View Model for the Hall Card component.
 */
export interface HallCardViewModel {
  /** The unique identifier of the hall. */
  id: string;
  /** The name of the hall. */
  name: string;
  /** The full formatted address line 1 (Street). */
  addressStreet: string;
  /** The full formatted address line 2 (Postal Code and City). */
  addressCityInfo: string;
  /** The country. */
  addressCountry: string;
  /** External Google Maps URL. */
  googleMapsUrl: string;
  /** Embedded Google Maps iframe URL. */
  googleMapsEmbedUrl: string;
}
