import {MediaDTO} from './mediaDTO';
import {SubAttachmentsDTO} from './subAttachementsDTO';

export interface AttachmentDTO {
  mediaType: string;
  type: string;
  media?: MediaDTO;
  subAttachments?: SubAttachmentsDTO;
}
