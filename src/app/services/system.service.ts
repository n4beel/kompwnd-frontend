import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SystemService  {
    private events : any = {};

    constructor(
        private snackBar: MatSnackBar
         ){

    }

    async showToast(data) {
        
        this.snackBar.open(data.message, 'okay', {
            duration: 3000
        })
    }

      copyTextToClipboard(text) {
        if (!navigator.clipboard) {
          return;
        }
        navigator.clipboard.writeText(text).then(() => {
            this.showToast({
                message: 'Copying to clipboard was successful!'
            })
        }, (err) => {
            this.showToast({
                message: 'Could not copy text: ', err
            })
        });
      }
}
