import { Component, HostListener, OnInit } from '@angular/core';
import { OnsNavigator, Params } from 'ngx-onsenui';
import { Update } from './update';
import { Top } from './top';
import { networkError, errCodeToMsg } from './common';
import { LocationStrategy } from '@angular/common';

import * as ons from 'onsenui';
import { RegisterService } from './registerService'; 
import { OnlineCheckService } from './onlineCheckService'; 
import { ViewService } from './viewService';

@Component({
  selector: 'ons-page[view]',
  template: `
    <ons-page id="registrationallPage">
        <ons-toolbar>
            <div class="center">
                一覧表示
            </div>
        </ons-toolbar>
        
        <ul id="dataList" class="list list--material">
        <a id="viewTitle"></a>
        <div>
            <div *ngIf = "resultCnt <= page">
            <li class="list-header" >表示結果：{{resultCnt}}/{{resultCnt}} 件</li>
            </div>
            <div *ngIf = "resultCnt > page">
            <li class="list-header" >表示結果：{{page}}/{{resultCnt}} 件</li>
            </div>
            <div *ngFor="let result of results | slice: begin: begin+length; index as i" (click)="update(result)">
                <li class='list-item list-item--material' style='text-align: left;'>
                <table border="1" [ngSwitch] = result?.categoryID>
                    <tr><th rowspan="7">{{(page - 10) + i + 1}}</th></tr>
                    <tr><td>カテゴリ</td><td >{{result?.categoryID |category:categoryList}}</td></tr>
                    <tr><td>管理番号</td><td>{{result?.managementNum}}</td></tr>
                    <tr><td>貸与元名称</td><td>{{result?.borrowedSource}}</td></tr>
                    <tr><td>貸与開始日</td><td>{{result?.startDate}}</td></tr>
                    <tr><td>返却予定日</td><td>{{result?.expectedReturnDate}}</td></tr>
                    <tr><td>備考</td><td>{{result?.notes}}</td></tr>
                </table>
                </li>
            </div>
        </div>
        </ul>

        <div class="center">
        <ul class = "pagination">
            <li *ngFor="let pager of pagerArr(results?.length / length) ; let i = index">
                <a href="#viewTitle" (click)="paging(i)">{{i + 1}}</a>
            </li>
        </ul>
        </div>

    </ons-page>

    <ons-modal id="modal" #modal>
        <ons-icon icon="fa-spinner" spin></ons-icon>
        <p>読み込み中・・・</p>
    </ons-modal>
`
})

export class View implements OnInit {
  constructor(
    private navi: OnsNavigator,
    private registerService: RegisterService,
    private onlineCheckService: OnlineCheckService,
    private viewService: ViewService,
  ) { }

  modal;
  categoryList: Array;

  /*isOnline = navigator.onLine;*/
  isOnline: boolean;
  localUsername = '';
  localName = '';
  results;
  resultCnt;

  begin = 0;
  length = 10;
  page: number = 10;

  isTaskExecute: boolean;


  /* TODO: 配列は最大5つまでにする*/
  pagerArr = function (num) {
    /* result / 10*/
    num = Math.ceil(num); // numの切り上げ
    let array = [];
    /* if (num < 5) {*/
    for (let i = 0; i < num; i++) {
      array[i] = i; /* ページャー数分の配列を作成*/
    }
    /*
        console.log(JSON.stringify(array))
    } else {

        let basisPage = (this.page / 10) - 1;

        if (basisPage < 2) { basisPage = 2 }
        if (basisPage === num) { basisPage = num - 2 }
        if (basisPage === num - 1) { basisPage = num - 1 }

        let minPage = basisPage - 2;
        let maxPage = basisPage + 2;

        for (let i = minPage; i <= maxPage; i++) {
            console.log(i)
            if (i === null) { continue; }
            array[i] = i; // ページャー数分の配列を作成
        }
    }
    */
    return array;

  };

  paging(page: number) {
    this.begin = this.length * page;
    this.page = (page + 1) * 10;
  }

  async ngOnInit() {
    this.isOnline = await this.onlineCheckService.onlineCheck();
    if (this.isOnline) {
      this.categoryList = await this.registerService.getCategoryList();
    } else {
      this.categoryList = JSON.parse(localStorage.getItem('categoryList'));
    }
    this.displayList();
  }

  switchDialog(isShow) {
    if (isShow) {
      this.modal.show();
    } else {
      this.modal.hide();
    }
  }

  /* ons-pageのshowイベント*/
  @HostListener('show', ['$event.target']) async show() {
    this.isOnline = await this.onlineCheckService.onlineCheck();
    if (this.isOnline) {
      this.displayList();
    }
  }
  /* ブラウザのfocusイベント(バックグラウンドから帰ってきたとき)*/
  @HostListener('window:focus', ['$event.target']) async focus() {
    this.isOnline = await this.onlineCheckService.onlineCheck();
    if (this.isOnline) {
      this.displayList();
    }
  }


  async displayList() {

    /* 排他制御 (複数回(ngOnInit,show,focus)の受け取りがあるため)*/
    if (this.isTaskExecute) { return; }
    this.isTaskExecute = true;

    this.modal = <HTMLInputElement>document.getElementById('modal');
    this.switchDialog(true);

    /*
    localStorage.clear();
    this.localUsername = localStorage.getItem('userName');
    this.localName = localStorage.getItem('name');
    */

    if (this.isOnline) {
      /*
      オンライン時処理
      インスタンスの生成
      console.log(localStorage.getItem('userName'));
      */
      console.log("一覧表示");
      this.results = await this.viewService.createDisplayList();
      this.resultCnt = this.results.length;

    } else {
      /*オフライン時処理：ログイン処理は行わず、ローカルストレージに保存されたデータを基に貸与物一覧画面（オフライン用）へ遷移*/
      this.results = JSON.parse(localStorage.getItem('objectInfo'));
      this.resultCnt = this.results.length;
      /*ons.notification.toast('オフライン状態です。ローカルストレージのデータを出力しています。', { timeout: 5000 });*/
    }
    this.switchDialog(false);
    this.isTaskExecute = false;
  }

  async update(result) {
    /*this.isOnline = navigator.onLine;*/
    this.isOnline = await this.onlineCheckService.onlineCheck();
    if (this.isOnline) {
      this.navi.element.pushPage(Update, { data: result });
    }
  }


}
