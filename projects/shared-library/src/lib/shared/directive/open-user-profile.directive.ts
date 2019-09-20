import { Directive, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[stlOpenUserProfile]'
})

export class OpenUserProfileDirective {

  @Input('stlOpenUserProfile') user: any;

  @HostListener('click', ['$event'])
  @HostListener('tap', ['$event'])
  onClick(event) {
    if (this.user && this.user !== null && this.user.userId && this.user.userId !== '' && this.user.redirectTo === 'otherUserProfile') {
      this.router.navigate([`/user/game-profile/${this.user.userId}`]);
    } else if (this.user && this.user !== null &&  this.user.userId && this.user.userId !== '' && this.user.redirectTo === 'userProfile') {
      this.router.navigate([`/user/my/game-profile/${this.user.userId}`]);
    }
  }


  constructor(private router: Router) { }

}

