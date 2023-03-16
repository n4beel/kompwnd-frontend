import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable()
export class SystemService  {
    private events : any = {};

    constructor(
        private snackBar: MatSnackBar
         ){

            this.on('toast').subscribe((data)=> {
                this.showToast(data);
            })

            this.on('toastOptions').subscribe((x)=> {
                this.showToastOptions();
            })
    }

    async showToast(data) {
        
        this.snackBar.open(data.message, 'okay', {
            duration: 3000
        })
        // const toast = await this.toast.create({
        //     header: data.header,
        //     message: data.message,
        //     duration: data.duration ? data.duration : 2500,
        //     position: 'bottom',
        //     color: data.color ? data.color : 'dark',
        //     cssClass: 'my-toast',
        //     buttons: data.icon ? [
        //         {
        //             side: 'start',
        //             icon: data.icon,
        //         }
        //     ]:[]
        // });
        // toast.present();
    }

    async showToastOptions() {
        // const toast = await this.toast.create({
        //     header: 'Toast header',
        //     message: 'Click to Close',
        //     position: 'top',
        //     buttons: [
        //         {
        //             side: 'start',
        //             icon: 'star',
        //             text: 'Favorite',
        //             handler: () => {
        //                 console.log('Favorite clicked');
        //             }
        //         }, 
        //         {
        //             text: 'Done',
        //             role: 'cancel',
        //             handler: () => {
        //                 console.log('Cancel clicked');
        //             }
        //         }
        //     ]
        // });
        // toast.present();
    }

    fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.zIndex = "-100";
      
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
      
        try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'successful' : 'unsuccessful';
          this.showToast({
              message: 'Fallback: Copying text command was ' + msg
          })
        } catch (err) {
            this.showToast({
                message: 'Fallback: Oops, unable to copy', err
            })
        }
      
        document.body.removeChild(textArea);
      }
      copyTextToClipboard(text) {
        if (!navigator.clipboard) {
          this.fallbackCopyTextToClipboard(text);
          return;
        }
        navigator.clipboard.writeText(text).then(() => {
            this.showToast({
                message: 'Async: Copying to clipboard was successful!'
            })
        }, (err) => {
            this.showToast({
                message: 'Async: Could not copy text: ', err
            })
        });
      }

    on(event : string) {
        return this.events[event] = new Subject();
    }

    emit(event : string, data?: any) {
        if (this.events[event]){
            this.events[event].next(data);
        }
    }
}
