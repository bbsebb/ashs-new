import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {Notification} from './notification';


@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private snackBar = inject(MatSnackBar);

  show(message: string, levelType:LevelType) {
    switch (levelType) {
      case 'info':
        this.snackBar.openFromComponent<Notification,string>(Notification, this.buildNotificationConfig(message,'info',0))
        break;
      case 'error':
        this.snackBar.openFromComponent<Notification,string>(Notification, this.buildNotificationConfig(message,'error',0))
        break;
      case 'success':
        this.snackBar.openFromComponent<Notification,string>(Notification, this.buildNotificationConfig(message,'success'))
        break;
    }
  }

  private buildNotificationConfig(message: string,level:LevelType = 'info',duration = 5000): MatSnackBarConfig<string> {
    return {
      panelClass: [`${level}-notification`],
      data: message,
      duration: duration,
      verticalPosition: 'top',
    };
  }
}

export type LevelType = 'info' | 'error' | 'success';

