import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MigrateModal } from "src/_modals/migrate/migrate.modal";
import { AuthService } from "src/_services/auth.service";
import { EosService, GetRowData, Token } from "src/_services/eos.service";
import { SystemService } from "src/_services/system.service";
import { ProfileService } from "src/_services/profile.service";
import { LoginModal } from '../login/login';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
})
export class AppHeaderComponent {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('slider') slider: ElementRef;
  @ViewChildren('routeLink') links: QueryList<any>;
  private activeElement: HTMLElement;
  slideFast: boolean = false;
  fastTimout;
  hideSlider: boolean = false;
  username: string;
  alaBalance: Token;

  slideColor: string;

  migration: boolean = false;

  profileImage: string = '';

  constructor(
    private router: Router,
    public auth: AuthService,
    private eos: EosService,
    private dialog: MatDialog,
    private system: SystemService,
    public profile: ProfileService
  ) {
    this.username = this.auth.user ? this.auth.user.username : null;

    this.eos.on('balanceUpdate').subscribe(() => {
      this.getBalance();
    });

    this.auth.on('user-set').subscribe(() => {
      this.checkMigration();
    });
    if (this.auth.user) {
      this.checkMigration();
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        let hideSlider = true;

        for (let ref of this.links.toArray()) {
          // ref.nativeElement.classList.contains('active')
          if (event.url == ref.nativeElement.pathname) {
            // this.slideColor = (<any>(<HTMLElement>ref.nativeElement).attributes).color.value;

            this.getOffset(<HTMLElement>ref.nativeElement);
            hideSlider = false;
          }
        }
      });

    window.addEventListener('resize', () => {
      if (!this.slideFast) {
        this.slideFast = true;
        if (this.fastTimout) clearTimeout(this.fastTimout);
        this.fastTimout = setTimeout(() => {
          this.slideFast = false;
          clearTimeout(this.fastTimout);
        }, 100);
      }
      this.getOffset();
    });
    this.eos.on('balanceUpdate').subscribe(() => {
      this.getBalance();
    });
    if (this.auth.user) {
      this.getBalance();
    }
  }

  async ngOnInit() {
  }

  getBalance() {
    this.eos
      .getBalance(this.auth.user.username, 'alaio.token', 'ALA')
      .then((data: any) => {
        this.alaBalance = this.eos.toToken(data.data);
      });
  }

  getOffset(element: HTMLElement = null) {
    if (!element && this.activeElement) {
      element = this.activeElement;
    }
    if (element) {
      this.activeElement = element;
      this.slider.nativeElement.style.width = element.clientWidth + 'px';
      this.slider.nativeElement.style.left = element.offsetLeft + 'px';
    }
  }

  checkMigration() {
    this.getGeneration(this.auth.user.username).then((gens) => {
      if (gens.user < gens.kompwnd) {
        this.migration = true;
        this.openMigrate();
      } else {
        this.migration = false;
      }
    });
  }

  async getGeneration(
    user: string
  ): Promise<{ user: number; kompwnd: number }> {
    let data = await (<Promise<GetRowData>>this.eos.getRows({
      scope: user,
      table: 'generation',
    }));
    let user_generation = 0;
    let kompwnd_generation = 0;
    if (data.rows.length) {
      user_generation = data.rows[0].generation;
    }

    let state = await (<Promise<GetRowData>>this.eos.getRows({
      table: 'state',
    }));
    if (state.rows) kompwnd_generation = state.rows[0].generation;
    return {
      user: user_generation,
      kompwnd: kompwnd_generation,
    };
  }

  onLogin() {
    let loginModal = this.dialog.open(LoginModal);
    // loginModal.afterClosed().subscribe((data) => {
    //     if(data) {

    //         this.auth.login(data.email, data.password, data.mnemonic).then((res: any)=>{
    //             console.log(res);

    //             if(res.error) {

    //             } else {
    //                 res.data.mnemonicCode = data.mnemonic;
    //                 res.data.password = data.password;

    //                 this.eos.login(data.mnemonic, data.password);

    //                 this.auth.setUser(res.data);

    //                 // this.auth.setActive(this.auth.user);
    //             }
    //         })
    //     }
    // })
  }

  onRedirect() {
    window.location.href = 'http://alacritys.net/';
  }

  openMigrate() {
    let migrate = this.dialog.open(MigrateModal, { disableClose: true });
    migrate.afterClosed().subscribe(() => {
      this.checkMigration();
      this.eos.emit('migration');
    });
  }

  onCopy() {
    // this.system.showToast({message: 'Referral Link Coppied'})
    this.system.copyTextToClipboard(
      `http://kompwnd.io?referral=${this.auth.user.username}`
    );
  }

  onLogout() {
    this.auth.logout();
  }
}
