import { Component, OnInit } from '@angular/core';
import { OnsNavigator, Params } from 'ngx-onsenui';
import * as ons from 'onsenui';

import { View } from './view';
import { errCodeToMsg } from './common';

import { ValidationCheckService } from './validationCheckService';
import { RegisterService } from './registerService'; 
import { UpdateService } from './updateService';

@Component({
  selector: 'ons-page[update]',
  template: `
   <ons-page id="updatePage" ng-controller="updateController">
    <ons-toolbar>
        <div class="center">
            更新
        </div>
        <div class="left">
          <ons-back-button>Back</ons-back-button>
        </div>
    </ons-toolbar>
    <div style="text-align: center;">
        <ons-list>
            <ons-list-header>氏名</ons-list-header>
            <p style="text-align: center;">
              <ons-input id="updateFirstName" type="text" modifier="underbar" ngModel maxlength="10" placeholder="姓" name="firstName" [ngModel]="firstName" float></ons-input>
              <ons-input id="updateLastName" type="text" modifier="underbar" ngModel maxlength="10" placeholder="名" name="lastName" [ngModel]="lastName" float></ons-input>
            </p>
        </ons-list>

        <ons-list>
            <ons-list-header>管理番号</ons-list-header>
            <p style="text-align: center;">
              <ons-input id="updateManagementNum" type="text" modifier="underbar" ngModel maxlength="30" name="managementNum" [ngModel]="managementNum" float></ons-input>
            </p>
        </ons-list>
            
        <ons-list>
          <ons-list-header>カテゴリ</ons-list-header>
          <p style="text-align: center;">
            <ons-select id="updateCategory" [(ngModel)]="selectedModifier" [attr.modifier]="selectedModifier">
              <option *ngFor="let modifier of modifiers" [value]="modifier.value">
                {{ modifier.label }}
               </option>
            </ons-select>
          </p>
        </ons-list>    

        <ons-list>
        <ons-list-header>貸与元名称</ons-list-header>
            <p style="text-align: center;">
              <ons-input id="updateBorrowedSource" type="text" modifier="underbar" name="borrowedSource" [ngModel]="borrowedSource" float></ons-input>
            </p>
        </ons-list>

        <ons-list>
            <ons-list-header>貸与開始日</ons-list-header>
            <p style="text-align: center;">
                <ons-input id="updateStartDate" modifier="underbar" type="date" name="startDate" [ngModel]="startDate" float></ons-input>
            </p>
        </ons-list>
        <ons-list>
            <ons-list-header>返却予定日</ons-list-header>
            <p style="text-align: center;">
                <ons-input id="updateExpectedReturnDate" modifier="underbar" type="date" name="expectedReturnDate" [ngModel]="expectedReturnDate" float></ons-input>
            </p>
        </ons-list>
        <ons-list>
            <ons-list-header>返却日</ons-list-header>
            <p style="text-align: center;">
                <ons-input style="width: 30%;" id="updateReturnDate" modifier="underbar" type="date" name="returnDate" [ngModel]="returnDate" float></ons-input>
            </p>
        </ons-list>
        <ons-list>
            <ons-list-header>保管場所</ons-list-header>
          <p style="text-align: center;">
            <ons-select id="updateStorageLocation" [(ngModel)]="selectedStorageLocation" [attr.location]="selectedStorageLocation">
              <option *ngFor="let location of StorageLocation" [value]="location.value">
                {{ location.label }}
               </option>
            </ons-select>
          </p>
        </ons-list>
        <ons-list>
            <ons-list-header>備考</ons-list-header>
            <p style="text-align: center;">
                <textarea class="textarea textarea--transparent" id="updateNotes" rows="3" placeholder="30字以内で入力してください。" ngModel maxlength="30" name="notes" [ngModel]="notes"></textarea>
            </p>
        </ons-list>
        
        
        <!--更新ボタン-->
        <div >
            <ons-button modifier="large" (click)="update()">更新</ons-button>
        </div>
        
    </div>
</ons-page>

  `
})
export class Update implements OnInit {
  param;
  firstName;
  lastName;

  objectId;
  managementNum;
  borrowedSource;
  startDate;
  expectedReturnDate;
  returnDate;
  notes;

  /*本当はこの辺もDBから呼び出し*/
  selectedModifier: number = -1;
  modifiers = [
    { value: -1, label: '未選択' },
  ];

  selectedStorageLocation: number = -1;
  StorageLocation = [
    { value: -1, label: '未選択' },
  ];



  constructor(
    private navigator: OnsNavigator,
    private params: Params,
    private validCheck: ValidationCheckService,
    private registerService: RegisterService,
    private updateService: UpdateService,
  ) { }

  ngOnInit() {
    /*  console.log(this.params.data);*/
    this.modifiers = JSON.parse(localStorage.getItem('categoryList'));
    this.StorageLocation = this.registerService.getStorageLocationList();
    console.log("データゲット");
    this.param = this.params;

    this.firstName = this.param.data.name.split(' ')[0];
    this.lastName = this.param.data.name.split(' ')[1];
    this.objectId = this.param.data.objectId;
    this.managementNum = this.param.data.managementNum;
    this.selectedModifier = this.param.data.categoryID;
    this.borrowedSource = this.param.data.borrowedSource;
    this.startDate = this.param.data.startDate;
    this.expectedReturnDate = this.param.data.expectedReturnDate;
    if (this.param.data.returnDate) {
      /*存在する時の処理*/
      this.returnDate = this.param.data.returnDate;
    }
    this.selectedStorageLocation = this.param.data.storageLocationID;
    this.notes = this.param.data.notes;

    /* 保存時の検索に使用*/
    localStorage.setItem('objectId', this.param.data.objectId);
  }


  async update() {

    /* 入力チェック*/
    if (!await this.validCheck.inputBlankCheck('update')) { return; }

    /* 入力値の取得*/
    let inquiryArray = [
      (<HTMLInputElement>document.getElementById("updateFirstName")).value + " " + (<HTMLInputElement>document.getElementById("updateLastName")).value,
      (<HTMLInputElement>document.getElementById("updateManagementNum")).value,
      Number((<HTMLInputElement>document.getElementById("updateCategory")).value),
      (<HTMLInputElement>document.getElementById("updateBorrowedSource")).value,
      (<HTMLInputElement>document.getElementById("updateStartDate")).value,
      (<HTMLInputElement>document.getElementById("updateExpectedReturnDate")).value,
      (<HTMLInputElement>document.getElementById("updateReturnDate")).value,
      Number((<HTMLInputElement>document.getElementById("updateStorageLocation")).value),
      (<HTMLInputElement>document.getElementById("updateNotes")).value
    ];

    /* カタカナチェック*/
    if (!await this.validCheck.isPhoneticCheck('update')) { return; }

    /* 確認ダイアログ*/
    if (!await this.validCheck.executeConfirm('更新')) { return; }

    /* ユーザ存在有無検知*/
    if (!await this.validCheck.isExistUserCheck(inquiryArray[0])) { return; }

    /* 更新処理の実行*/
    let executeUpdate = await this.updateService.executeUpdate(inquiryArray);

    /* 前画面に戻る*/
    if (executeUpdate) {
      console.log('更新OK');
      await ons.notification.toast({ message: '更新が完了しました。', timeout: 1000 });
      sessionStorage.setItem('updateFlag', this.objectId);
      await this.navigator.element.popPage()
    }

  }
}
