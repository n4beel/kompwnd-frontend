import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Globals } from 'src/app/core/globals';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent implements OnInit {
  @ViewChild("elementRef") private elementRef: ElementRef<HTMLElement>;
  @ViewChild("productRef") private productRef: ElementRef<HTMLElement>;
  
  @ViewChild("notificationRef") private notificationRef: ElementRef<HTMLElement>;

  showDropdown = false
  showProductDropdown = false
  showNotification = false;
  newNotification = false;

  alertMessage: string;
  title: string;
  notificationList = [];
  offSet = 0
  limit = 10
  messageTimout: NodeJS.Timeout;
  totalNotfications = 0;
  constructor(public router: Router, public globals: Globals, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.notification.subscribe(notification => {
      this.notificationList.push(notification)
      this.totalNotfications = this.totalNotfications + 1
      this.showAlertMessage(notification.title, notification.body)
      this.newNotification = true
    });
    this.getNotifications()
  }

  getNotifications() {
    this.notificationService.getNotifications(`/notification?offset=${this.offSet}&limit=${this.limit}`).then((res: any) => {
      if (res && res.notifications && res.notifications.length > 0) {
        this.notificationList = this.notificationList.concat(res.notifications)
        this.totalNotfications = res.total
      }
    });
  }

  onReadMoreClick() {
    this.offSet = this.notificationList.length
    this.getNotifications();
  }

  onNotificationIconClick() {
    this.newNotification = false;
    this.showNotification = true;
  }
  onDisconnectWalletClick() {
    this.globals.flush()
    this.router.navigate(['']);
  }

  showAlertMessage(title: string, message: string) {
    this.title = title;
    this.alertMessage = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  hideMessage() {
    this.title = null
    this.alertMessage = null;
    clearTimeout(this.messageTimout);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !this.elementRef.nativeElement.contains(targetElement)) {
      this.showDropdown = false;
    }
    if (targetElement && !this.notificationRef.nativeElement.contains(targetElement)) {
      this.showNotification = false;
    }
    if (targetElement && !this.productRef.nativeElement.contains(targetElement)) {
      this.showProductDropdown = false;
    }
  }

}
