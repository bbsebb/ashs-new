import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-video-embed-dialog',
  imports: [
    MatIcon,
    MatIconButton
  ],
  templateUrl: './video-embed-dialog.html',
  styleUrl: './video-embed-dialog.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class VideoEmbedDialog implements OnInit {
  private readonly _dialogRef = inject(MatDialogRef<VideoEmbedDialog>);
  private readonly _data = inject(MAT_DIALOG_DATA);
  private readonly _sanitizer = inject(DomSanitizer);

  safeEmbedHtml?: SafeHtml;
  safeSourceUrl?: SafeResourceUrl;
  rawSourceUrl?: string;
  aspectRatio = '16 / 9';

  ngOnInit(): void {
    if (this._data.embedHtml) {
      this.safeEmbedHtml = this._sanitizer.bypassSecurityTrustHtml(this._data.embedHtml);
    } else if (this._data.sourceUrl) {
      this.rawSourceUrl = this._data.sourceUrl;
      this.safeSourceUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this._data.sourceUrl);
    }

    if (this._data.videoWidth && this._data.videoHeight) {
      this.aspectRatio = `${this._data.videoWidth} / ${this._data.videoHeight}`;
    }
  }

  close(): void {
    this._dialogRef.close();
  }
}
