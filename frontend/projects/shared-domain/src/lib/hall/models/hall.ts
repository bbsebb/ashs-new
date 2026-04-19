/**
 * Represents a sports hall or training facility used by the club.
 */
export interface Hall {
  /** Unique identifier for the hall. */
  id: string;
  /** The name of the facility (e.g., "Palais des Sports"). */
  name: string;
  /** The street address of the hall. */
  addressStreet: string;
  /** The city where the hall is located. */
  addressCity: string;
  /** The postal code for the hall's address. */
  addressPostalCode: string;
  /** The country where the hall is located. */
  addressCountry: string;
}
