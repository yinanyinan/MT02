import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { OnsNavigator } from 'ngx-onsenui';
import { Update } from './update';



import * as ons from 'onsenui';

@Component({
    selector: 'searchView',
    template: `
   
    <ul id="dataList" class="list list--material">
        <a id="searchTitle"></a>
        <div>
            <div *ngIf = "item?.length <= page">
                <li class="list-header" >表示結果：{{item?.length}}/{{item?.length}} 件</li>
            </div>
            <div *ngIf = "item?.length > page">
                <li class="list-header" >表示結果：{{page}}/{{item?.length}} 件</li>
            </div>
        </div>
        
        <div *ngFor = "let r of item | slice: start: start+len ; index as i" (click)="update(r)">
            <li class='list-item list-item--material' style='text-align: left;'>
                <table border="1" >
                    <tr><th rowspan="9">{{i+1}}</th></tr>
                    <tr><td>氏名</td><td>{{r?.name}}</td></tr>
                    <tr><td>カテゴリ</td><td >{{r?.categoryID | category:categoryList}}</td></tr>
                    <tr><td>管理番号</td><td>{{r?.managementNum}}</td></tr>
                    <tr><td>貸与元名称</td><td>{{r?.borrowedSource}}</td></tr>
                    <tr><td>貸与開始日</td><td>{{r?.startDate}}</td></tr>
                    <tr><td>返却予定日</td><td>{{r?.expectedReturnDate}}</td></tr>
                    <tr><td>返却日</td><td>{{r?.returnDate }}</td></tr>
                    <tr><td>備考</td><td>{{r?.notes}}</td></tr>
                </table>
            </li>
        </div>
    </ul>

    <div class="center">
      <ul class = "pagination">
          <li *ngFor="let pager of pagerArr(item.length / len) ; let i = index" >
            <a href="#searchTitle" (click)="paging(i)">{{i + 1}}</a>
          </li>
      </ul>
    </div>

  `
})
export class SearchView implements OnInit {
    @Input() item: RESULT[];
    @Output() updated = new EventEmitter<string>();
    constructor(private navi: OnsNavigator) {
    }

    start: number = 0;
    len: number = 10;
    page: number = 10;

    categoryList: Array;

  async ngOnInit() {
    this.categoryList = JSON.parse(localStorage.getItem('categoryList'));
  }

    pagerArr = function (num) {
        num = Math.ceil(num); /* numの切り上げ*/
        let array = [];
        for (let i = 0; i < num; i++) {
            array[i] = i; /* ページャー数分の配列を作成*/
        }
        return array;
    };


    paging(page: number) {
        this.start = this.len * page;
        this.page = (page + 1) * 10;

    }

    update(result) {
        let updated = this.updated;
        this.navi.element.pushPage(Update, { data: result });
        document.addEventListener('postpop', function (event) {
            let flag = sessionStorage.getItem('updateFlag');
            if (flag) {
                updated.emit(flag);
            }
        })
    }
}




