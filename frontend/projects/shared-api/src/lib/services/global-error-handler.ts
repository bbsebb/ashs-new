import {ErrorHandler, Injectable} from '@angular/core';

/**
 * Global error handler that detects chunk loading failures (common after a new deployment)
 * and forces a page reload to fetch the latest version of the application.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    const moduleFailedMessage = /Failed to fetch dynamically imported module/;

    if (
      error.message &&
      (chunkFailedMessage.test(error.message) || moduleFailedMessage.test(error.message))
    ) {
      console.warn('Chunk load failed. Refreshing page to fetch the latest version...', error);
      window.location.reload();
      return;
    }

    // Default behavior: log to console
    console.error('Global Error:', error);
  }
}
