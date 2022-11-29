import { Clipboard } from '@angular/cdk/clipboard';
import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { ShowNotificationAction } from '../../state/notifications/notification.actions';

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss'],
})
export class ShareButtonComponent {
  constructor(public clipboard: Clipboard, private store: Store) {}

  copyLink() {
    const url = window.location.href;
    this.clipboard.copy(url);
    this.store.dispatch(
      new ShowNotificationAction({
        message: `The URL to this page has been copied to your clipboard`,
        action: 'success',
      })
    );
  }
}
