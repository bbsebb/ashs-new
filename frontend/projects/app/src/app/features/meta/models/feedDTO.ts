import {AttachmentDTO} from './attachment-dto';
import {AttachmentsDTO} from './attachmentsDTO';

export type ISO8601String = string;


export interface FeedDTO {
  id: string;
  createdTime: ISO8601String;
  message?: string;
  attachments: AttachmentsDTO;
}
