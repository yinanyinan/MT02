import { Component, OnInit } from '@angular/core';
import { OnsNavigator } from 'ngx-onsenui';
import { Top } from './top';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';

import { ValidationCheckService } from './validationCheckService';
import { RegisterService } from './registerService'; 

@Component({
  selector: 'ons-page[register]',
  template: `
    	<ons-page id="registrationPage">
		<ons-toolbar>
			<div class="center">
				新規登録
			</div>
		</ons-toolbar>

		<div style="text-align: center;">
			<ons-list>

				<ons-list-header>氏名（カタカナ入力）</ons-list-header>
				<p style="text-align: center;">
					<ons-input id="registerFirstName" type="text" modifier="underbar" ngModel maxlength="10" placeholder="姓" name="firstName" [ngModel]="firstName" float></ons-input>
					<ons-input id="registerLastName" type="text" modifier="underbar" ngModel maxlength="10" placeholder="名" name="lastName" [ngModel]="lastName" float></ons-input>
				</p>
				<ons-lazy-repeat id="infinite-list"></ons-lazy-repeat>
			</ons-list>

			<ons-list>
				<ons-list-header>管理番号</ons-list-header>
				<p style="text-align: center;">
					<ons-input id="registerManagementNum" type="text" modifier="underbar" ngModel maxlength="30" float></ons-input>
				</p>
			</ons-list>

			<ons-list>
				<ons-list-header>カテゴリ</ons-list-header>
				<p style="text-align: center;">
					<ons-select id="registerCategory" [(ngModel)]="selectedModifier" [attr.modifier]="selectedModifier">
						<option *ngFor="let modifier of modifiers" [value]="modifier.value">
							{{ modifier.label }}
						</option>
					</ons-select>
				</p>
			</ons-list>

			<ons-list>
				<ons-list-header>貸与元名称</ons-list-header>
				<p style="text-align: center;">
					<ons-input id="registerBorrowedSource" type="text" modifier="underbar" float></ons-input>
				</p>
			</ons-list>

			<ons-list>
				<ons-list-header>貸与開始日</ons-list-header>
				<p style="text-align: center;">
					<ons-input id="registerStartDate" modifier="underbar" type="date" name="currentDate" [ngModel]="currentDate" float></ons-input>
				</p>
			</ons-list>
			<ons-list>
				<ons-list-header>返却予定日</ons-list-header>
				<p style="text-align: center;">
					<ons-input id="registerExpectedReturnDate" modifier="underbar" type="date" name="currentDate" [ngModel]="currentDate" float></ons-input>
				</p>
			</ons-list>
			<ons-list>
				<ons-list-header>保管場所</ons-list-header>
				<p style="text-align: center;">
					<ons-select id="registerStorageLocation" [(ngModel)]="selectedStorageLocation" [attr.modifier]="selectedStorageLocation">
						<option *ngFor="let modifier of StorageLocation" [value]="modifier.value">
							{{ modifier.label }}
						</option>
					</ons-select>
				</p>
			</ons-list>
			<ons-list>
				<ons-list-header>備考</ons-list-header>
				<p style="text-align: center;">
					<textarea class="textarea textarea--transparent" id="registerNotes" rows="3" placeholder="30字以内で入力してください。" ngModel maxlength="30"></textarea>
				</p>
			</ons-list>


			<!--送信ボタン-->
			<div>
				<ons-button modifier="large" (click)="register()">登録</ons-button>
			</div>

		</div>
	</ons-page>`
})

export class Register implements OnInit {
  currentDate;

  firstName: string = '';
  lastName: string = '';

  constructor(
    private navi: OnsNavigator,
    private validCheck: ValidationCheckService,
    private registerService: RegisterService,
  ) { }

  async ngOnInit() {
    /* 現在時刻の取得*/
    this.currentDate = new Date().toISOString().substring(0, 10);
    await this.registerService.getUserInfo();

    this.modifiers = await this.registerService.getCategoryList();
    /*await this.categoryService.setCategoryList();*/

    this.StorageLocation = await this.registerService.getStorageLocationList();
    /*await this.registerService.setStorageLocationList();*/

    if (localStorage.getItem('firstName')) {
      this.firstName = localStorage.getItem('firstName');
    }

    if (localStorage.getItem('lastName')) {
      this.lastName = localStorage.getItem('lastName');
    }

  }


  /*カテゴリ、ストレージの生成*/
  selectedModifier: number = -1;
  modifiers = [
    { value: -1, label: '未選択' },
  ];

  selectedStorageLocation: number = -1;
  StorageLocation = [
    { value: -1, label: '未選択' },
  ];


  /* 登録*/
  async register() {

    /* 入力チェック*/
    if (!await this.validCheck.inputBlankCheck('register')) { return; }

    /* 入力値の取得*/
    let inquiryArray = [
      (<HTMLInputElement>document.getElementById("registerFirstName")).value + " " + (<HTMLInputElement>document.getElementById("registerLastName")).value,
      (<HTMLInputElement>document.getElementById("registerManagementNum")).value,
      Number((<HTMLInputElement>document.getElementById("registerCategory")).value),
      (<HTMLInputElement>document.getElementById("registerBorrowedSource")).value,
      (<HTMLInputElement>document.getElementById("registerStartDate")).value,
      (<HTMLInputElement>document.getElementById("registerExpectedReturnDate")).value,
      Number((<HTMLInputElement>document.getElementById("registerStorageLocation")).value),
      (<HTMLInputElement>document.getElementById("registerNotes")).value
    ];

    /* カタカナチェック*/
    if (!await this.validCheck.isPhoneticCheck('register')) { return; }

    /* 確認ダイアログ*/
    if (!await this.validCheck.executeConfirm('登録')) { return; }

    /* 上限検知*/
    let maximumResult = await this.registerService.maximumDataCheck();
    if (!maximumResult || typeof maximumResult === 'string') { return; }

    /* ユーザ存在有無検知*/
    if (!await this.validCheck.isExistUserCheck(inquiryArray[0])) { return; }

    /* 登録実行処理*/
    await this.registerService.executeRegist(inquiryArray);

  }
}
