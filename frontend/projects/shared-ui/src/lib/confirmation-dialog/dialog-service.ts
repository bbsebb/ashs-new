import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {map} from 'rxjs';
import {ConfirmationDialog, ConfirmationDialogData} from './confirmation-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly dialog = inject(MatDialog);

  showConfirmation(content: string, title: string = 'Confirmation') {
    const dialogConfig = {data: {title: title, content: content}};

    return this.dialog.open<ConfirmationDialog, ConfirmationDialogData, boolean>(ConfirmationDialog, dialogConfig).afterClosed().pipe(
      map(response => response ?? false),
    );
  }
}
