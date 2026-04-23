/**
 * View Model for the Contact form component.
 */
export interface ContactViewModel {
  /** Small introductory text displayed above the title. */
  eyebrow: string;
  /** The main heading of the contact section. */
  title: string;
  /** Descriptive text displayed below the title. */
  subtitle: string;
}

/**
 * Data emitted when the contact form is submitted.
 */
export interface ContactSubmitEvent {
  /** The sender's email address. */
  from: string;
  /** The subject of the message. */
  subject: string;
  /** The main message content. */
  content: string;
}
