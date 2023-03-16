import { Component } from "@angular/core";
import { AuthService } from "src/_services/auth.service";
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService } from 'src/_services/profile.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'profile-page',
    templateUrl: 'profile.page.html',
    styleUrls: ['profile.page.scss']
})
export class ProfilePage {
    user: string;
    button: string = 'edit';

    submitMessage: string;
    searchMessage: string;
    messageType: 'error' | 'success';
    messageTimeout: NodeJS.Timeout;

    oldImg: string = '';
    newImg: any;
    formData = new FormData();

    profileLoading: boolean = false
    performanceLoading: boolean = false
    loadingLong: boolean = false

    userSearch: string = '';
    startDate: string;
    endDate: string;
    public today = new Date().toISOString().split('T')[0]
    public minDate: string = '2022-08-29'
    limit: number

    performanceTable: Performance;

    constructor(
        public auth: AuthService,
        public router: Router,
        private route: ActivatedRoute,
        public profile: ProfileService
    ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false
    }

    async ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.user = params.get('user');
        })
        await this.profile.getProfile(this.user);
        this.oldImg = this.profile.user.imgPath
    }

    preview(event: Event) {
        let input = (<HTMLInputElement>event.target);

        if (input.files && input.files.length) {
            this.newImg = {
                file: input.files[0],
                preview: ''
            }

            //Create the filename for uploading
            let fileExtension = "." + input.files[0].name.split(".")[1];
            let filename = this.user + fileExtension;
            this.formData.append('imgFile', input.files[0], filename)

            //Image preview
            let reader = new FileReader();
            reader.onloadend = () => {
                this.newImg.preview = <string>reader.result;
            }
            reader.readAsDataURL(this.newImg.file);
        }
        else {
            console.log("No files");
        }
    }

    audioUpload(event: Event) {
        let input = (<HTMLInputElement>event.target);

        //Create the filename for uploading
        let fileExtension = "." + input.files[0].name.split(".")[1];
        let filename = this.user + fileExtension;
        this.formData.append('audioFile', input.files[0], filename)
    }

    onSubmit() {
        if (this.profile.user.description.length > 255) {
            this.showMessage("Description must be 255 characters or less", 'submit')
        }
        else {
            this.profileLoading = true
            this.formData.append('description', this.profile.user.description)

            this.profile.post('/edit-profile', this.formData).then((res: any) => {
                console.log("profile", res)
                if (res.ok === true) {
                    this.button = 'edit'
                    this.profile.getProfile(this.user);
                }
                else {
                    this.showMessage(res.message, 'submit', true)
                }
                this.profileLoading = false
            })
        }
        this.formData = new FormData()
    }

    onCancel() {
        this.formData = new FormData()
        this.button = 'edit'
        this.newImg = null
    }

    onSearch() {
        if (this.userSearch === '' || this.startDate === undefined || this.endDate === undefined) {
            this.showMessage('Please fill out all fields', 'search')
        }
        else if (this.startDate > this.endDate) {
            this.showMessage('Start Date cannnot be greater than End Date', 'search')
        }
        else {
            this.performanceLoading = true
            this.profile.post('/search-performance-table', {
                user: this.userSearch,
                startDate: this.startDate,
                endDate: this.endDate,
                limit: this.limit
            }).then((res: any) => {
                if(res.ok === false) {
                    this.showMessage(res.message, 'search', true)
                }
                else {
                    this.performanceTable = res.data
                    console.log(this.performanceTable)
                }
                this.performanceLoading = false
            })
            setTimeout(() => {
                if(this.performanceLoading) this.loadingLong = true
            }, 5000)
        }
    }

    showMessage(message: string, type: string, error: boolean = false) {
        this.messageType = error ? 'error' : 'success';
        if(type === 'submit') {
            this.submitMessage = message
        }
        else if(type ==='search') {
            this.searchMessage = message
        }
        this.messageTimeout = setTimeout(() => {
            this.hideMessage();
        }, 5000);
    }

    hideMessage() {
        this.submitMessage = null
        this.searchMessage = null
        clearTimeout(this.messageTimeout)
    }
}

export interface Performance {
    user: string;
    teamDeposit: string;
    gen: number;
    buddies: Performance[]
}