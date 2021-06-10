import { Injectable } from '@angular/core';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';

@Injectable()
export class LoginService {

  async login(retries = 3) {

    let userName = (<HTMLInputElement>document.getElementById("userName")).value;
    let password = (<HTMLInputElement>document.getElementById("password")).value;

    /*オンライン時処理*/
    let result = await ncmb.User.login(userName, password)
      .then(function (user) {
        /* console.log("ログイン成功" + JSON.stringify(user));*/

        localStorage.setItem('userName', userName);
        localStorage.setItem('password', password);
        sessionStorage.setItem('groupID', user.groupID);

        /* let fullNameStr = JSON.stringify(user.phonetic);*/
        let fullNameStr = user.phonetic;
        localStorage.setItem('kana', JSON.stringify(fullNameStr));

        let fullName = fullNameStr.split(' ');
        console.log('名字' + fullName[0])
        localStorage.setItem('firstName', fullName[0]);
        localStorage.setItem('lastName', fullName[1]);

        return true;
      })
      .catch(function (error) {
        return error;
      });

    if (result === true) {
      return true;
      /* ons.notification.toast('ログインに成功しました。', { timeout: 1000 });*/
      /* await this.navi.element.resetToPage(Top, { animation: "fade" });*/
    } else {
      /*エラーが発生する時の処理*/
      let msg = errCodeToMsg(result);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        await ons.notification.toast('ログインに失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.login(--retries);
        } else {
          /* await ons.notification.toast('ログインに失敗しました。エラー：' + msg, { timeout: 1000 });
          オフライン時処理：ログイン処理は行わず、ローカルストレージに保存されたデータを基に貸与物一覧画面（オフライン用）へ遷移
           this.navi.element.resetToPage(Top, { animation: "fade" })
           ons.notification.toast('オフライン状態です。ローカルストレージのデータを出力します。', { timeout: 1000 });
           */
          return false;
        }
      }
    }
  }

  async authMailAddress() {
    let mailAuth = await ons.notification.confirm({
      message: 'メールアドレスの認証を行いますか？',
      title: '確認',
      callback: function (answer) { return answer === 1; }
    });

    if (!mailAuth) { return; }


    let userID = await ons.notification.prompt({
      message: '社員番号を入力してください。',
      title: '入力：社員番号',
      callback: function (userID) { return userID; }
    });

    let password = await ons.notification.prompt({
      message: 'パスワードを入力してください。',
      title: '入力：パスワード',
      inputType: 'password',
      callback: function (password) { return password; }
    });

    await this.existAuth(userID, password);
  }

  async existAuth(userID, password, retries = 3) {
    let isExistAuth = await ncmb.User.login(userID, password)
      .then(function (user) {
        console.log("成功");
        /* throw new Error(); *//* debug*/
        let currentUser = ncmb.User.getCurrentUser();
        return currentUser.isMailAddressConfirmed();
      })
      .catch(function (error) {
        console.log('catch' + JSON.stringify(error));
        return error;
      });

    if (typeof isExistAuth === 'boolean') {
      /* ID/パスワードは存在している。*/
      if (isExistAuth) {
        /* メールアドレス確認済み ！！！終わり！！！*/
        await ons.notification.toast('そのメールアドレスは既に認証が完了しています。', { timeout: 1000 });
      } else {
        /* メールアドレス未確認*/
        await this.authInputMailAddress(userID, password);
      }

    } else {
      /* 例外処理*/            
      console.log(isExistAuth);
      let msg = errCodeToMsg(isExistAuth);
      console.log(msg);
      /* その他エラー：「通信に失敗しました。エラー　：　エラー内容」*/
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.existAuth(userID, password, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        }
      }
    }
  }

  async authInputMailAddress(userID, password) {
    /* メールアドレス未確認*/
    let mail = await ons.notification.prompt({
      message: '認証のためメールアドレスを入力してください。',
      title: '入力：メールアドレス',
      callback: function (mail) { return mail; }
    });
    await this.authSendMailAddress(userID, password, mail);
  }

  async authSendMailAddress(userID, password, mail, retries = 3) {
    let currentUser = await ncmb.User.getCurrentUser();
    console.log(mail);
    let updateResult = await currentUser.set("mailAddress", mail).update()
      .then(function (test) {
        console.log("更新しました。メール確認。");
        ons.notification.toast('確認用のメールを送信しました。', { timeout: 2000 });
        ncmb.User.logout();
        return true;
      })
      .catch(function (error) {
        console.log("エラーです。" + error);
        ncmb.User.logout();
        return error;
      });


    if (updateResult === true) { return; }

    /* 例外処理*/            
    let msg = errCodeToMsg(updateResult);

    /* その他エラー：「通信に失敗しました。エラー　：　エラー内容」*/
    if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
      console.log("NWエラーではない");
      await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
    } else {
      console.log("NWエラー");
      if (retries > 0) {
        console.log("残り: " + retries + "回リトライ。")
        await this.authSendMailAddress(userID, password, mail, --retries);
      } else {
        console.log(msg);
        await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      }
    }
  }




  async changePassword(retries = 3) {
    let answer = await ons.notification.confirm({
      message: 'パスワードの変更を行いますか？',
      title: '確認',
      callback: function (answer) { return answer == 1; }
    });

    if (!answer) { return; }

    let mail = await ons.notification.prompt({
      message: 'メールアドレスを入力してください。',
      title: '確認',
      callback: function (mail) { return mail; }
    });

    await this.sendMail(mail);
  }

  async sendMail(mail, retries = 3) {
    let user = new ncmb.User();
    user.set("mailAddress", mail);

    let result = await user.requestPasswordReset()
      .then(function (data) {
        /* 送信後処理*/
        /* throw new Error();*/
        console.log("成功");
        ons.notification.toast('パスワード変更用メールを送信しました。', { timeout: 2000 });
        return true;
      })
      .catch(function (err) {
        /* エラー処理*/
        console.log("失敗");
        return err;
      });

    if (result !== true) {
      console.log(result)
      let msg = errCodeToMsg(result);


      /* その他エラー：「通信に失敗しました。エラー　：　エラー内容」*/
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 2000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.sendMail(mail, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 2000 });;
        }
      }
    }
  }




}