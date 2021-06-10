import { Injectable } from '@angular/core';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';


@Injectable()
export class OnlineCheckService {


    async onlineCheck(retries = 3) {
        console.log('ネットワーク状態を確認します。');
        let Obj = ncmb.DataStore('Object');
        let objClass = new Obj();
        let onlineResult = await Obj.count().fetch().then(function (results) {
            /* 検索成功*/
            console.log("チェックOK");
            return true;    
        })
            .catch(function (error) {
                /* 検索失敗*/
                console.log("チェック失敗");
                return error;
            });
    if(onlineResult === true){
      return true;
    }else{
        let msg = errCodeToMsg(onlineResult);
        if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
            console.log("NWエラーではない");
            return false;
        } else {
            console.log("NWエラー");
            if (retries > 0) {
                console.log("残り: " + retries + "回リトライ。");
                await this.onlineCheck(--retries);
            } else {
                console.log("アラート表示");
                return false;
            }
        }
        return ;
    }
  }
}