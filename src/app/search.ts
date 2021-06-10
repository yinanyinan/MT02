import { Component, OnInit, AfterViewInit } from '@angular/core';
import { networkError, errCodeToMsg } from './common';

import { SearchView } from './searchView';
import * as ons from 'onsenui';

import { SearchService } from './searchService';

@Component({
  selector: 'ons-page[search]',
  template: `
   <ons-page id="registrationallPage">
    <ons-toolbar>
        <div class="center">
            検索
        </div>
    </ons-toolbar>
    <div class="content">
      <ons-pull-hook height="64px" threshold-height="256px" (changestate)="onChangeState($event)" (action)="onAction($event)">
        {{MESSAGE}}
      </ons-pull-hook>
    <ul id="dataList" class="list list--material">
    <div>
    <li class="list-header">検索条件</li>
    <div class = "search">
    <table class="searchList" border="1">
          <tr><td>氏名</td><td>
            <li class = "search_1">
              <ons-select [(ngModel)]="SELECTED_NAME" [attr.modifier]="SELECTED_NAME" 
              (change)="onChangeSelectName($event?.target?.value)" id = "selectName">
              
                <option *ngFor="let name of NAME_AFTER" [value]="name?.value" >
                  {{ name?.label }}
                </option>
              </ons-select>
            </li>
          </td></tr>
          <tr><td>カテゴリ</td><td>
            <li class = "search_1" >
              <ons-select name="category" [(ngModel)]="SELECTED_CATEGORY" [attr.modifier]="SELECTED_CATEGORY"
              (change)=onChangeSelectCategory($event?.target?.value)>
              
                <option *ngFor="let category of CATEGORYS_AFTER" [value]="category?.value" >
                  {{ category?.label }}
                </option>
              </ons-select>
            </li>
          </td></tr>
          <tr><td>備考</td><td>
            <li class = "search_2" >
            <p style="text-align: center;">
              <ons-input id="searchRemarks" type="text" modifier="underbar" ngModel maxlength="30" placeholder="検索文字" name="NOTES" [(ngModel)]="NOTES" #input (keyup.enter)="broadMatchModifier(input)" float></ons-input>
            </p>
            </li>
          </td></tr>
        </table>
     
    </div>
    </div>
    </ul>
    <ul id="dataList" class="list list--material">
    <div>
    <li class="list-header">表示方法</li>
    <div class = "search">
    <table class="searchList" border="1">
          <tr><td>氏名</td><td>
            <li class = "search_1">
              <ons-select [(ngModel)]="SELECTED_DISP" [attr.modifier]="SELECTED_DISP" 
              (change)=onChangeSort($event?.target?.value)>
                <option *ngFor="let disp of DISPS" [value]="disp?.value">
                  {{ disp?.label }}
                </option>
              </ons-select>
            </li>
        </table>
    </div>
    </div>
    </ul>
   <searchView [item]="LENT_ARTICLES_AFTER"  (updated)="onupdate($event)"></searchView>
   </div>
</ons-page>

    <ons-modal id="MODAL_SEARCH" #MODAL_SEARCH>
        <ons-icon icon="fa-spinner" spin></ons-icon>
        <p>読み込み中・・・</p>
    </ons-modal>

  `
})
export class Search implements OnInit {
  constructor(
    private searchService: SearchService,
  ) { }
  /*初期化時*/
  async ngOnInit() {
    
    this.USER_ROLE = sessionStorage.getItem('groupID');
    this.getInfo();
    /*this.searchService.threeLevelHierarchy(this.USER_ROLE);*/
  }

  NOTES: string = '';

  MESSAGE: string = '下へ引いて再取得します。';
  MODAL;
  USER_ROLE = "";

  SELECTED_NAME: string = '';
  NAME_BEFORE: Array = [];
  NAME_AFTER: Array = [];

  SELECTED_CATEGORY: string = '';
  CATEGORYS_BEFORE: Array = [];
  CATEGORYS_AFTER: Array = [];

  SELECTED_DISP: string = '未選択';
  DISPS = [
    { value: '未選択', label: '-' },
    { value: 'upper', label: '昇順' },
    { value: 'downer', label: '降順' }
  ];

  LENT_ARTICLES_BERORE: RESULT[] = new Array();
  LENT_ARTICLES_AFTER: RESULT[] = new Array();
  NAME_LIST: NAME[] = new Array();
  CATEGORY_LIST: CATEGORY[] = new Array();


  /*MODALの表示・非表示を制御*/
  switchDialog(isShow) {
    if (isShow) {
      this.MODAL.show();
    } else {
      this.MODAL.hide();
    }
  }

  /*pullHookの更新処理*/
  async onAction($event) {
    this.getInfo();
    this.NOTES = '';
    this.SELECTED_NAME = '';
    this.SELECTED_CATEGORY = '';
    this.SELECTED_DISP = '未選択';
    let temp_disp = Array.from(this.DISPS);
    this.DISPS = Array.from(temp_disp);
    setTimeout(() => {
      $event.done();
    }, 1000);
  }

  /*pullHookの状態*/
  onChangeState($event) {
    switch ($event.state) {
      case 'initial':
        this.MESSAGE = '下へ引いて再取得します。';
        break;
      case 'preaction':
        this.MESSAGE = '離すと再取得されます。';
        break;
      case 'action':
        this.MESSAGE = '再取得中...';
        break;
    }
  }


  /*貸与物情報をコンポーネントに渡す処理（再取得含む）*/
  async getInfo() {
    this.MODAL = <HTMLInputElement>document.getElementById('MODAL_SEARCH');
    this.switchDialog(true);
    this.LENT_ARTICLES_BERORE = await this.searchService.determine(this.USER_ROLE);
    this.LENT_ARTICLES_AFTER = Array.from(this.LENT_ARTICLES_BERORE);
    this.sortExpectedReturnDate(this.LENT_ARTICLES_BERORE);
    this.createCategoryList(this.LENT_ARTICLES_AFTER);
    this.createNameList(this.LENT_ARTICLES_AFTER);
    this.switchDialog(false);
  }

  /*更新後のデータ再取得*/
  async onupdate(flag: string) {
    /*console.log("thirdに移りました。");*/
    await this.searchService.update(flag, this.LENT_ARTICLES_AFTER);
    await this.searchService.update(flag, this.LENT_ARTICLES_BERORE);
    this.preCreateCategoryList(this.LENT_ARTICLES_BERORE);
    this.preCreateNameList(this.LENT_ARTICLES_BERORE);
    this.processedCategoryList(this.LENT_ARTICLES_BERORE);
    this.processedNameList(this.LENT_ARTICLES_BERORE);
    sessionStorage.removeItem('updateFlag');
  }


  /*氏名でソート*/
  onChangeSort(value) {
    this.SELECTED_DISP = value;
    /*console.log(this.selectedDisp);*/
    if (value === "upper") {
      this.LENT_ARTICLES_AFTER.sort(function (a, b) {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        if (new Date(a.expectedReturnDate) > new Date(b.expectedReturnDate)) return 1;
        if (new Date(a.expectedReturnDate) < new Date(b.expectedReturnDate)) return -1;
        return 0;
      });
    }
    else if (value === "downer") {
      this.LENT_ARTICLES_AFTER.sort(function (a, b) {
        if (a.name > b.name) return -1;
        if (a.name < b.name) return 1;
        if (new Date(a.expectedReturnDate) > new Date(b.expectedReturnDate)) return 1;
        if (new Date(a.expectedReturnDate) < new Date(b.expectedReturnDate)) return -1;
        return 0;
      });
    }
  }


  /*カテゴリのセレクトボックス変化時の操作*/
  onChangeSelectCategory(value) {
    this.SELECTED_CATEGORY = value;
    let sort = this.SELECTED_DISP;
    let name = this.SELECTED_NAME;
    let notes = this.NOTES;

    /*カテゴリ選択済み→どちらも空欄の場合*/
    if ((value === '') && (name === '')) {
      this.LENT_ARTICLES_AFTER = Array.from(this.LENT_ARTICLES_BERORE);
      this.onChangeSort(sort);
      this.createNameList(this.LENT_ARTICLES_BERORE);
      this.createCategoryList(this.LENT_ARTICLES_BERORE);

      /*どちらも選択状態→カテゴリ未選択*/
    } else if ((value === '') && (name !== '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.name == name;
      });
      this.onChangeSort(sort);
      this.createCategoryList(this.LENT_ARTICLES_AFTER);
      this.processedNameList(this.LENT_ARTICLES_BERORE);

      /*どちらも未選択→カテゴリ選択*/
    } else if ((value !== '') && (name === '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.categoryID == value.toString();
      });
      this.onChangeSort(sort);
      this.createNameList(this.LENT_ARTICLES_AFTER);
      this.processedCategoryList(this.LENT_ARTICLES_BERORE);

      /*氏名選択済みかつカテゴリ未選択→どちらも選択済み*/
    } else {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.categoryID == value.toString();
      }).filter(function (element) {
        return element.name == name;
      });
      this.CATEGORY_LIST = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.categoryID == value.toString();
      });
      this.onChangeSort(sort);
      this.processedNameList(this.CATEGORY_LIST);
    }
    this.broadMatchModifier(notes);
  }


  /*氏名のセレクトボックス変化時の操作*/
  onChangeSelectName(value) {
    this.SELECTED_NAME = value;
    let sort = this.SELECTED_DISP;
    let category = this.SELECTED_CATEGORY;
    let notes = this.NOTES;

    /*氏名選択済み→どちらも空欄の場合*/
    if ((value === '') && (category === '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE;
      this.onChangeSort(sort);
      this.createNameList(this.LENT_ARTICLES_BERORE);
      this.createCategoryList(this.LENT_ARTICLES_BERORE);

      /*どちらも選択状態→氏名未選択*/
    } else if ((value === '') && (category !== '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.categoryID == category.toString();
      });
      this.onChangeSort(sort);
      this.processedCategoryList(this.LENT_ARTICLES_BERORE);

      /*どちらも未選択→氏名選択*/
    } else if ((value !== '') && (category === '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.name == value;
      });
      this.onChangeSort(sort);
      this.createCategoryList(this.LENT_ARTICLES_AFTER);

      /*カテゴリ選択済みかつ氏名未選択→どちらも選択済み*/
    } else {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.name == value;
      }).filter(function (element) {
        return element.categoryID == category.toString();
      });
      this.NAME_LIST = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.name == value;
      });
      this.onChangeSort(sort);
      console.log(JSON.stringify(this.CATEGORYS_BEFORE));
      console.log(JSON.stringify(this.NAME_LIST));
      this.processedCategoryList(this.NAME_LIST);
    }
    this.broadMatchModifier(notes);
  }


  /*重複を排除して配列を追加するメソッド*/
  add(array, value, label) {
    if (!(array.some(el => el.value === value))) {
      array.push({ value: value, label: label });
    }
  }

  /*配列をvalueでソートするメソッド*/
  sortValue(array) {
    array.sort(function (a, b) {
      if (a.value > b.value) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  }


  /*カテゴリのセレクトボック生成*/
  createCategoryList(item) {
    let categoryArray = [{ value: '', label: '未選択' }];
    let categoryList = JSON.parse(localStorage.getItem('categoryList'));

    /*検索で一覧取得されたデータからカテゴリリストを生成*/
    for (let i in item) {
      for (let j in categoryList) {
        if (item[i].categoryID === categoryList[j].value) {
          this.add(categoryArray, item[i].categoryID, categoryList[j].label);
          break;
        }
      }
    }
    /*カテゴリのvalueでソート*/
    this.CATEGORYS_BEFORE = this.sortValue(categoryArray);
    this.CATEGORYS_AFTER = Array.from(this.CATEGORYS_BEFORE);
  }


  /*一時カテゴリのセレクトボック生成*/
  preCreateCategoryList(item) {
    let categoryArray = [{ value: '', label: '未選択' }];
    let categoryList = JSON.parse(localStorage.getItem('categoryList'));

    /*検索で一覧取得されたデータからカテゴリリストを生成*/
    for (let i in item) {
      for (let j in categoryList) {
        if (item[i].categoryID === categoryList[j].value) {
          this.add(categoryArray, item[i].categoryID, categoryList[j].label);
          break;
        }
      }
    }
    /*カテゴリのvalueでソート*/
    this.CATEGORYS_BEFORE = this.sortValue(categoryArray);
  }


  /*カテゴリのセレクトボックス加工*/
  /*現在のカテゴリリストをさらに絞り込む*/
  processedCategoryList(item) {
    let selectedCategory = this.SELECTED_CATEGORY;
    let searchedArray = [{ value: '', label: '未選択' }];

    /*絞り込まれた貸与物一覧(item)のカテゴリリストを、絞り込む前の一覧と比較→一致したカテゴリを追加*/
    for (let i in item) {
      for (let j in this.CATEGORYS_BEFORE) {
        if (item[i].categoryID === this.CATEGORYS_BEFORE[j].value) {
          this.add(searchedArray, item[i].categoryID, this.CATEGORYS_BEFORE[j].label);
          /*console.log(JSON.stringify(searchedArray));*/
          break;
        }
      }
    }
    let processedArray = this.sortValue(searchedArray);

    /*現在選択されているカテゴリがある場合*/
    if (JSON.stringify(processedArray).indexOf(selectedCategory) !== -1) {

      /*現在選択されているカテゴリの添え字を取得し、その他を削除*/
      let selectedCategoryNumber = this.CATEGORYS_AFTER.findIndex(({ value }) => value === Number(selectedCategory));
      this.CATEGORYS_AFTER.splice(0, selectedCategoryNumber);
      this.CATEGORYS_AFTER.splice(1, this.CATEGORYS_AFTER.length - 1);

      /*検索で取得した一覧と、絞り込みした一覧の配列を比較→一致したカテゴリを追加*/
      for (let i in this.CATEGORYS_BEFORE) {
        for (let j in processedArray) {
          if (this.CATEGORYS_BEFORE[i].value === processedArray[j].value) {
            this.add(this.CATEGORYS_AFTER, processedArray[j].value, this.CATEGORYS_BEFORE[i].label);
            break;
          }
        }
      }

      this.sortValue(this.CATEGORYS_AFTER);
      /*現在選択されているカテゴリがない場合*/
    } else {
      this.CATEGORYS_AFTER = Array.from(processedArray);
    }
  }


  /*氏名のセレクトボックス生成*/
  createNameList(item) {
    let nameArray = [{ value: '', label: '未選択' }];

    for (let i in item) {
      this.add(nameArray, item[i].name, item[i].name);
    }
    this.NAME_BEFORE = this.sortValue(nameArray);
    this.NAME_AFTER = Array.from(this.NAME_BEFORE);
  }


  /*一時氏名のセレクトボックス生成*/
  preCreateNameList(item) {
    let nameArray = [{ value: '', label: '未選択' }];

    for (let i in item) {
      this.add(nameArray, item[i].name, item[i].name);
    }
    this.NAME_BEFORE = this.sortValue(nameArray);
  }


  /*氏名のセレクトボックス加工
  現在の氏名リストをさらに絞り込む*/
  processedNameList(item) {
    let selectedName = this.SELECTED_NAME;
    let nameArray = [];
    let searchedArray = [{ value: '', label: '未選択' }];

    for (let i in item) {
      this.add(searchedArray, item[i].name, item[i].name);
    }
    let processedArray = this.sortValue(searchedArray);

    /*現在選択されている氏名がある場合*/
    if (JSON.stringify(processedArray).indexOf(selectedName) !== -1) {

      /*現在選択されている氏名の添え字を取得し、その他を削除*/
      let selectedNameNumber = this.NAME_AFTER.findIndex(({ value }) => value === selectedName);
      this.NAME_AFTER.splice(0, selectedNameNumber);
      this.NAME_AFTER.splice(1, this.NAME_AFTER.length - 1);

      /*絞り込みした氏名一覧の配列を追加*/
      for (let j in processedArray) {
        this.add(this.NAME_AFTER, processedArray[j].value, processedArray[j].label);
      }
      this.sortValue(this.NAME_AFTER);

      /*現在選択されている氏名がない場合*/
    } else {
      this.NAME_AFTER = Array.from(processedArray);
    }
  }


  /*返却期限日でソート*/
  sortExpectedReturnDate(list) {
    this.LENT_ARTICLES_AFTER = Array.from(this.LENT_ARTICLES_BERORE).sort(function (a, b) {
      if (new Date(a.expectedReturnDate) > new Date(b.expectedReturnDate)) return 1;
      if (new Date(a.expectedReturnDate) < new Date(b.expectedReturnDate)) return -1;
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
  }


  /*備考内容と部分一致した貸与物を表示する。*/
  broadMatchModifier(input) {
    let name = this.SELECTED_NAME;
    let category = this.SELECTED_CATEGORY;
    let pattern = input.value;
    /*let LENT: Array = [];*/
    if (typeof input.value === 'undefined') {
      pattern = input;
    }

    /*検索欄に文字が入力されている時*/
    if (pattern != "") {

      /* 部分一致*/
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_AFTER.filter(function (element) {
        return element.notes.indexOf(pattern) > -1;
      });

      /*存在しない文字列だった場合*/
      if (this.LENT_ARTICLES_AFTER.length === 0) {
        this.emptyProcess();
        ons.notification.toast('検索結果が存在しませんでした。', { timeout: 1000 });
      }

      /*検索結果がある場合*/
      else {
        /*未選択*/
        if ((category === '') && (name === '')) {
          this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
            return element.notes.indexOf(pattern) > -1;
          });
          this.createNameList(this.LENT_ARTICLES_AFTER);
          this.createCategoryList(this.LENT_ARTICLES_AFTER);

          /*氏名選択済み*/
        } else if ((category === '') && (name !== '')) {
          this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_AFTER.filter(function (element) {
            return element.name == name;
          });
          this.createCategoryList(this.LENT_ARTICLES_AFTER);
          this.processedNameList(this.LENT_ARTICLES_AFTER);

          /*カテゴリ選択済み*/
        } else if ((category !== '') && (name === '')) {
          this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_AFTER.filter(function (element) {
            return element.categoryID == category.toString();
          });
          this.processedNameList(this.LENT_ARTICLES_AFTER);
          this.processedCategoryList(this.LENT_ARTICLES_AFTER);

          /*どちらも選択済み*/
        } else {
          this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_AFTER.filter(function (element) {
            return element.categoryID == category.toString();
          }).filter(function (element) {
            return element.name == name;
          });
          this.processedNameList(this.LENT_ARTICLES_AFTER);
          this.processedCategoryList(this.LENT_ARTICLES_AFTER);
        }
      }

      /*検索欄が空文字の場合*/
    } else {
      this.emptyProcess();
    }
  }


  /*検索結果もしくは備考欄が空の時の処理*/
  emptyProcess() {
    let name = this.SELECTED_NAME;
    let category = this.SELECTED_CATEGORY;

    /*未選択*/
    if ((category === '') && (name === '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE;
      this.createNameList(this.LENT_ARTICLES_BERORE);
      this.createCategoryList(this.LENT_ARTICLES_BERORE);

      /*氏名選択済み*/
    } else if ((category === '') && (name !== '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.name == name;
      });
      this.createCategoryList(this.LENT_ARTICLES_AFTER);
      this.processedNameList(this.LENT_ARTICLES_BERORE);

      /*カテゴリ選択済み*/
    } else if ((category !== '') && (name === '')) {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.categoryID == category.toString();
      });
      this.createNameList(this.LENT_ARTICLES_AFTER);
      this.processedCategoryList(this.LENT_ARTICLES_BERORE);

      /*どちらも選択済み*/
    } else {
      this.LENT_ARTICLES_AFTER = this.LENT_ARTICLES_BERORE.filter(function (element) {
        return element.categoryID == category.toString();
      }).filter(function (element) {
        return element.name == name;
      });
      this.processedNameList(this.LENT_ARTICLES_AFTER);
      this.processedCategoryList(this.LENT_ARTICLES_AFTER);
    }
  }
}