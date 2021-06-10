import { Injectable } from '@angular/core';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';

@Injectable()
export class ViewService {


  async createDisplayList(retries = 3) {
    let Obj = ncmb.DataStore('Object');

    let result = await Obj.order('expectedReturnDate') /* 返却予定日昇順*/
      .equalTo('name', JSON.parse(localStorage.getItem('kana'))) /* 借りている人物のカナ名称*/
      .or(
        ncmb.DataStore('Object').exists('returnDate', false).equalTo('returnDate', null)
      )
      .fetchAll()
      .then(function (results) {
        /*
        検索成功
        ローカルストレージに保存
        throw new Error();
        */
        localStorage.setItem('objectInfo', JSON.stringify(results));
        return results;
      })
      .catch(function (error) {
        /* 通信に失敗した場合の処理*/
        console.log("通信に失敗");
        /* error.code = 'E429001'; *//* debug*/
        return error;
      });

    if (Array.isArray(result)) {
      return result;
      /*
      this.results = result;
      this.resultCnt = this.results.length;
      */

    } else {
      let msg = errCodeToMsg(result);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        await ons.notification.alert({ title: '通信失敗', message: '通信に失敗しました。エラー：' + msg, timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          /*this.isTaskExecute = false;*/
          await this.createDisplayList(--retries);
        } else {
          await ons.notification.alert({ title: '通信失敗', message: '通信に失敗しました。エラー：' + msg, timeout: 1000 });
        }
      }
    }
  }
}