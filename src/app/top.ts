import { Component, OnInit } from '@angular/core';
import * as ons from 'onsenui';
import { OnsNavigator } from 'ngx-onsenui';

import { View } from './view';
import { Register } from './register';
import { Search } from './search';

import { errCodeToMsg } from './common';
import { OnlineCheckService } from './onlineCheckService'; 

@Component({
  selector: 'ons-page[top]',
  template: `
    <ons-page>
  <div class="content">
    <ons-tabbar [attr.animation]="animation" position="auto">
      <div class="tabbar__content"></div>
      <div class="tabbar">
        <ons-tab icon="square" label="全件表示" [page]="view" active></ons-tab>
        <ons-tab icon="square" label="登録" [page]="register" *ngIf = "isOnline"></ons-tab>
        <ons-tab icon="square" label="検索" [page]="search" *ngIf = "classID && isOnline"></ons-tab>
      </div>
    </ons-tabbar>
  </div>
</ons-page>
`
})
export class Top implements OnInit {
  view = View;
  register = Register;
  search = Search;


  classID = false;
  /*isOnline = navigator.onLine;*/
  isOnline = false;

  animation = ons.platform.isAndroid() ? 'slide' : 'none';
  modifier = ons.platform.isAndroid() ? 'material noshadow' : '';


  constructor(private onlineCheckService: OnlineCheckService) {
  }

  async ngOnInit() {
    this.isOnline = await this.onlineCheckService.onlineCheck();
    this.loginCheck();
    /*this.isOnline = navigator.onLine;*/
  }


  async loginCheck() {
    let user = await ncmb.User.getCurrentUser();
    if (user.classID === "01") {
      this.classID = true;
    }

    if (!user) {
      this.navi.element.resetToPage(Login, { animation: "fade" });
      ncmb.sessionToken = null;
      ons.notification.toast('セッションが無効です。ログインしてください。', { timeout: 2000 });
    }
    /*
    try {
        await ncmb.DataStore('Hello').fetch();
    } catch (e) {
        localStorage.removeItem(`NCMB/${ncmb.apikey}/CurrentUser`);
        ncmb.sessionToken = null;
        this.navi.element.resetToPage(Login, { animation: "fade" });
        ons.notification.toast('セッションが無効です。ログインしてください。', { timeout: 2000 });
    }
    */
  }
}



