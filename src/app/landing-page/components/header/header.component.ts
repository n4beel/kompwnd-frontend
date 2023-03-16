import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from 'src/app/auth/components/login/login.component';
import { Globals } from 'src/app/core/globals';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild("productRef") private productRef: ElementRef<HTMLElement>;

  showProductDropdown = false;

  constructor(private dialog: MatDialog, public globals: Globals, private router: Router) { }

  ngOnInit(): void {
  }

  onRegisterClick() {
    if (this.globals.userName) {
      this.router.navigate(['/dashboard'])
    } else {
      this.dialog.open(LoginComponent);
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !this.productRef.nativeElement.contains(targetElement)) {
      this.showProductDropdown = false;
    }
  }

}
