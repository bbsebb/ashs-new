import {ISO8601String} from '@shared-domain';

export interface ImageDTO {
  height: number;
  src: string;
  width: number;
}

export interface MediaDTO {
  image: ImageDTO;
  source?: string;
}

export interface TargetDTO {
  id: string;
  url: string;
}

export interface SubAttachmentDTO {
  media: MediaDTO;
  target: TargetDTO;
  type: string;
  url: string;
}

export interface SubAttachmentsDTO {
  data: SubAttachmentDTO[];
}

export interface AttachmentDTO {
  mediaType: string;
  type: string;
  media?: MediaDTO;
  subAttachments?: SubAttachmentsDTO;
  target?: TargetDTO;
}


export interface AttachmentsDTO {
  data: AttachmentDTO[];
}

export interface FeedDTO {
  id: string;
  createdTime: ISO8601String;
  message?: string;
  attachments: AttachmentsDTO;
}

export interface FeedsDTO {
  data: FeedDTO[];
}

export interface GraphMetaDTO {
  data: FeedDTO[];
}
