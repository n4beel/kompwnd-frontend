import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/_services/auth.service';
import { SocketService } from 'src/_services/socket.service';
// import 'rxjs/add/operator/filter';
import { Icon, Icons } from './icons';

import { environment } from "../environments/environment";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Globals } from './core/globals';
import { NotificationService } from './services/notification.service';
const { mainnet } = environment;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    title = 'kompwnd-frontend';

    constructor(
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer,
      private auth: AuthService,
      private globals: Globals,
      private notificationService: NotificationService,
      private socket: SocketService
      ) {

        this.socket.io.on("auth-request", () => {
          if(this.auth.user) {
            this.socket.io.emit("user-auth", {mainnet, username: this.auth.user.username})
          }
          else {
            this.socket.io.emit("user-auth", {mainnet});
          }
        });
      
        this.auth.on('user-set').subscribe(() => {
          if(this.auth.user) {
            this.socket.io.emit("user-auth", {mainnet, username: this.auth.user.username})
          }
        });

        Icons.forEach((icon: Icon) => {
            this.matIconRegistry.addSvgIcon(
              icon.name,
              this.domSanitizer.bypassSecurityTrustResourceUrl(icon.url)
            );
        })
    }

    ngOnInit(){
      this.requestPermission();
      this.listen();
    }
    requestPermission() {
      const messaging = getMessaging();
      console.log(messaging)
      console.log(environment.firebase.vapidKey)

      getToken(messaging, 
       { vapidKey: environment.firebase.vapidKey}).then(
         (currentToken) => {
          console.log(currentToken);
           if (currentToken) {
            this.globals.fcmToken = currentToken
             console.log("Hurraaa!!! we got the token.....");
             console.log(currentToken);
           } else {
             console.log('No registration token available. Request permission to generate one.');
           }
       }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
      });
    }
    listen() {
      const messaging = getMessaging();
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        this.notificationService.notification.next({
          title: payload.notification.title,
          body: payload.notification.body
        })
      });
    }
}
