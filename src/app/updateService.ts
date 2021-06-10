import { Injectable } from '@angular/core';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';

@Injectable()
export class UpdateService {


  /**
    * 更新の実行
    */
  async executeUpdate(inquiryArray, retries = 3) {
    /* 保存先クラスのインスタンスを生成*/
    let ObjectClass = ncmb.DataStore("Object");
    let objClass = new ObjectClass();

    if (inquiryArray[6] === '') { inquiryArray[6] = null; }

    let result = await objClass.set('objectId', localStorage.getItem('objectId'))
      .set('name', inquiryArray[0])
      .set('managementNum', inquiryArray[1])
      .set('categoryID', inquiryArray[2])
      .set('borrowedSource', inquiryArray[3])
      .set('startDate', inquiryArray[4])
      .set('expectedReturnDate', inquiryArray[5])
      .set('returnDate', inquiryArray[6])
      .set('storageLocationID', inquiryArray[7])
      .set('notes', inquiryArray[8])
      .set('userName', localStorage.getItem('userName'))
      .update()
      .then(function () {
        /* throw new Error('ERROR: ');*//* 明示的なエラー*/
        /* 保存に成功した場合の処理*/
        localStorage.removeItem("objectId");
        return true;

      }).catch(function (error) {
        /* 保存に失敗した場合の処理*/
        console.log("更新に失敗");
        return error;
      });


    if (result === true) {
      return true;
    }

    let msg = errCodeToMsg(result);

    /* その他エラー：「更新に失敗しました。エラー　：　エラー内容」*/

    if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
      console.log("NWエラーではない");
      await ons.notification.alert({ title: '更新失敗', message: '更新に失敗しました。エラー：' + msg, timeout: 1000 });
    } else {
      console.log("NWエラー");
      if (retries > 0) {
        console.log("残り: " + retries + "回リトライ。")
        await this.executeUpdate(inquiryArray, --retries);
      } else {
        await ons.notification.alert({ title: '更新失敗', message: '更新に失敗しました。エラー：' + msg, timeout: 1000 });
      }
    }
    return false;
  }
}