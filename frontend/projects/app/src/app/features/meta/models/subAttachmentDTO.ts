import {MediaDTO} from './mediaDTO';
import {TargetDTO} from './targetDTO';


/**
 * Représente une sous-pièce jointe (par exemple, une photo ou une vidéo dans un album).
 */
export interface SubAttachmentDTO {
  media: MediaDTO;
  target: TargetDTO;
  type: string;
  url: string;
}
