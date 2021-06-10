import { Injectable } from '@angular/core';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';

@Injectable()
export class RegisterService {


  /* 登録されているユーザの一覧取得*/
  async getUserInfo(retries = 3) {
    let result = await ncmb.User.exists('userName').fetchAll().then(function (results) {
      /* 検索成功*/
      /* throw new Error("わざとエラーをぶん投げるなどする");*/

      /* sessionStorage にデータを保存する*/
      let userInfo = [];
      for (let i = 0; i < results.length; i++) {
        userInfo.push([results[i].name, results[i].phonetic, results[i].userName]);
      }
      sessionStorage.setItem('kanaArray', JSON.stringify(userInfo));
      /* let item = sessionStorage.getItem('kanaArray');*/

      console.log("カナ配列追加:" + JSON.stringify(userInfo));
      return true;
    })
      .catch(function (error) {
        /* 検索失敗*/
        return error;
      });

    if (result === true) {
      return;
    }

    let msg = errCodeToMsg(result);
    if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
      /* if (msg !== networkError) {*/
      console.log("NWエラーではない");
      ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
    } else {
      console.log("NWエラー");
      if (retries > 0) {
        console.log("残り: " + retries + "回リトライ。")
        await this.getUserInfo(--retries);
      } else {
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      }
    }
  }



    async getCategoryList(retries = 3) {
        let categoryListFlag = false;
        let Category = ncmb.DataStore('Category');
        let result = await Category.fetchAll()
            .then(function (results) {
                /* sessionStorage にデータを保存する*/
                /*console.log(JSON.stringify(results));*/
                categoryListFlag = true;
                /*sessionStorage.setItem('category', JSON.stringify(results));*/
                console.log('カテゴリー取得');
                console.log(JSON.stringify(results));
                return results;
            })
            .catch(function (error) {
                /* 検索失敗*/
                return error;
            });
        if (categoryListFlag) {
            return this.setCategoryList(result);
        }

        let msg = errCodeToMsg(result);
        if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
            /* if (msg !== networkError) {*/
            console.log("NWエラーではない");
            ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        } else {
            console.log("NWエラー");
            if (retries > 0) {
                console.log("残り: " + retries + "回リトライ。")
                await this.getCategoryList(--retries);
            } else {
                ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
            }
        }
    }

    /*カテゴリーリスト作成*/
    setCategoryList(result) {
      let temp_categoryList :Array = [
      { value: -1, label: '未選択' },
    ];
        try {
            let categoryList = result;
            console.log(JSON.stringify(categoryList));
            for (let i = 0; i < categoryList.length; i++) {
                let categoryItem = { value: categoryList[i].categoryID, label: categoryList[i].category };
                temp_categoryList.push(categoryItem);
            }
        } catch {
            console.log("カテゴリーリストの作成に失敗しました。");
        }
        temp_categoryList.sort(function (a, b) {
            if (a.value > b.value) {
                return 1;
            } else {
                return -1;
            }
        });
        localStorage.setItem('categoryList', JSON.stringify(temp_categoryList));
        return temp_categoryList;
    }


  async getStorageLocationList(retries = 3) {
    let StorageLocation = ncmb.DataStore('StorageLocation');
    let result = await StorageLocation.fetchAll()
      .then(function (results) {
        /* sessionStorage にデータを保存する*/
        /*console.log(JSON.stringify(results));*/
        sessionStorage.setItem('storageLocation', JSON.stringify(results));
        return true;
      })
      .catch(function (error) {
        /* 検索失敗*/
        return error;
      });
    if (result === true) {
      return this.setStorageLocationList();
    }

    let msg = errCodeToMsg(result);
    if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
      /* if (msg !== networkError) {*/
      console.log("NWエラーではない");
      ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
    } else {
      console.log("NWエラー");
      if (retries > 0) {
        console.log("残り: " + retries + "回リトライ。")
        await this.getStorageLocationList(--retries);
      } else {
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      }
    }
  }


  /*保管場所のリスト作成*/
  setStorageLocationList() {
    let temp_storageLocationList = [
      { value: -1, label: '未選択' },
    ];
    try {
      let storageLocationList = JSON.parse(sessionStorage.getItem('storageLocation'));
      console.log(JSON.stringify(storageLocationList));
      for (let i = 0; i < storageLocationList.length; i++) {
        let categoryItem = { value: storageLocationList[i].storageLocationID, label: storageLocationList[i].storageLocation };
        temp_storageLocationList.push(categoryItem);
      }
    } catch {
      console.log("保管場所リストの作成に失敗しました。");
    }
    temp_storageLocationList.sort(function (a, b) {
      if (a.value > b.value) {
        return 1;
      } else {
        return -1;
      }
    });
    return temp_storageLocationList;
  }


  async maximumDataCheck(retries = 3) {
    /* 上限の検知*/
    console.log('上限を確認します。');
    /* 保存先クラスのインスタンスを生成*/
    let Obj = ncmb.DataStore('Object');
    let objClass = new Obj();

    /* 上限検索（10,000,000 = 一千万）*/
    let maximumResult = await Obj.count().fetchAll().then(function (results) {
      //* throw new Error('error!!!!!'); *//* 明示的なエラー*/
      /* 検索成功*/
      console.log("条件検索成功" + JSON.stringify(results));
      console.log(results.count);
      const maxData = 10000000;
      /* const maxData = 0; *//* debug*/
      if (results.count >= maxData) {
        ons.notification.alert({
          title: '登録エラー',
          message: '本アプリの登録可能上限数（1千万件）を超過しています。'
        });
      }
      return results.count < maxData;
    })
      .catch(function (error) {
        /* 検索失敗*/
        console.log('上限NG:' + error);
        return error;
      });

    if (typeof maximumResult === 'boolean') {
      return maximumResult;
    }

    let msg = errCodeToMsg(maximumResult);
    if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
      console.log("NWエラーではない");
      await ons.notification.alert({ title: '登録失敗', message: '登録に失敗しました。エラー：' + msg, timeout: 1000 });
    } else {
      console.log("NWエラー");
      if (retries > 0) {
        console.log("残り: " + retries + "回リトライ。");
        await this.executeRegist(--retries);
      } else {
        console.log("アラート表示");
        await ons.notification.alert({ title: '登録失敗', message: '登録に失敗しました。エラー：' + msg, timeout: 1000 });
      }
    }
    return false;
  }


  async executeRegist(inquiryArray, retries = 3) {
    /* 値を設定と保存*/
    let Obj = ncmb.DataStore('Object');
    let objClass = new Obj();

    let result = await objClass.set('name', inquiryArray[0])
      .set('managementNum', inquiryArray[1])
      .set('categoryID', inquiryArray[2])
      .set('borrowedSource', inquiryArray[3])
      .set('startDate', inquiryArray[4])
      .set('expectedReturnDate', inquiryArray[5])
      .set('storageLocationID', inquiryArray[6])
      .set('notes', inquiryArray[7])
      .set('userName', localStorage.getItem('userName'))
      .save()
      .then(function (object) {
        /* throw new Error('ERROR: '); *//* 明示的なエラー*/
        ons.notification.toast({ message: '登録が完了しました。', timeout: 1000 });
        return true;

      }).catch(function (error) {
        /* 保存に失敗した場合の処理*/
        console.log("登録に失敗");
        return error;
      });

    if (result === true) {
      return;
    }

    let msg = errCodeToMsg(result);

    /* その他エラー：「登録に失敗しました。エラー　：　エラー内容」*/
    if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
      console.log("NWエラーではない");
      await ons.notification.alert({ title: '登録失敗', message: '登録に失敗しました。エラー：' + msg, timeout: 1000 });
    } else {
      console.log("NWエラー");
      if (retries > 0) {
        console.log("残り: " + retries + "回リトライ。")
        await this.executeRegist(inquiryArray, --retries);
      } else {
        await ons.notification.alert({ title: '登録失敗', message: '登録に失敗しました。エラー：' + msg, timeout: 1000 });
      }
    }
    return;
  }
}