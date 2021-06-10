import { Component, OnInit } from '@angular/core';
import { OnsNavigator } from 'ngx-onsenui';
import { Top } from './top';
import * as ons from 'onsenui';
import { errCodeToMsg } from './common';

import { OnlineCheckService } from './onlineCheckService';
import { LoginService } from './loginService';

import { Auth } from 'aws-amplify';


@Component({
  selector: 'ons-page[login]',
  template: `
    <ons-page>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: ms-appdata: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">

    <ons-toolbar>
      <div class="left">
        <ons-back-button>Back</ons-back-button>
      </div>
      <div class="center">貸与物管理アプリ</div>
    </ons-toolbar>


    <div class="content">
      <form #myForm="ngForm">
        <div style="padding: 10px">
          <div><ons-input placeholder="社員番号" [(value)]="localUsername"  id="userName" name="userName" required minlength="4" maxlength="6" ></ons-input></div>
        </div>
        <div style="padding: 10px">
          <div><ons-input type='password' placeholder="パスワード" [(value)]="localPassword"  id="password" name="password" required minlength="9" maxlength="16" ></ons-input></div>
        </div>

    </form>
     

      <p>
        <ons-button (click)="login()">ログイン</ons-button>
      </p>
      
      <p>
        <ons-button (click)="loginService.changePassword()">パスワード変更</ons-button>
      </p>

      <p>
        <ons-button (click)="loginService.authMailAddress()">メールアドレス認証</ons-button>
      </p>

      <p>
          <!-- カメラ機能 -->
          <!-- <input type="file" capture="camera" accept="image/*" id="cameraInput" name="cameraInput" (change)="onFileSelected($event)"> -->
          <!-- <button type="button" (click)="onFileSelected($event)">写真を撮る</button>
          <button type="button" (click)="onUpload()">Upload File</button> -->
          <ons-button (click)="aws()">awsサインイン</ons-button>
      </p>
      <p>
        <ons-button (click)="awsConf()">awsConf</ons-button>
      </p>

      <!-- <img id="imageFile" alt="test"> -->

    </div>


    </ons-page>
`
})
export class Login implements OnInit {
  constructor(
    private navi: OnsNavigator,
    private onlineCheckService: OnlineCheckService,
    private loginService: LoginService,
  ) { }
  isOnline: boolean;

  localUsername = '';
  localPassword = '';

  async aws() {
    //Sign in
    let username = 'loan_manage_access';
    let password = 'Miura@00'
    try {
      const user = await Auth.signIn(username, password);
    } catch (error) {
      console.log('error signing in', error);
    }

  }

  async awsConf() {
    //Sign in確認
    // try {
    //   let username = 'loan_manage_access';

    //   await Auth.confirmSignUp(username, code);
    // } catch (error) {
    //     console.log('error confirming sign up', error);
    // }

  }


  /* camera*/
  selectedFile: string = 'test';

  onFileSelected(event) {
    /*
     navigator.getUserMedia
     this.selectedFile = event.target.files[0];
    console.log(event.target);
    navigator.mediaDevices.getUserMedia({video: true})
        .then(function (stream) {
          */
    /* use the stream */
    /*
    console.log(stream)
    console.log(JSON.stringify(stream))
    this.selectedFile = JSON.stringify(stream);
     console.log(stream);
})
.catch(function (err) {
  */
    /* handle the error */
    /*
    console.log(JSON.stringify(err));
});
*/


    /* https://docs.monaca.io/ja/reference/cordova_10.0/camera/#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%B3%E3%83%BC%E3%83%89
    /*
    /* サンプルコード*/
    let srcType = Camera.PictureSourceType.CAMERA;
    let options = this.setOptions(srcType);
    /* let func = createNewFileEntry;*/

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
      /*
            this.displayImage(imageUri);
            You may choose to copy the picture, save it somewhere, or upload.
            func(imageUri);
            */
      console.log(imageUri);

    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");

    }, options);
  }

  setOptions(srcType) {
    var options = {
      /* Some common settings are 20, 50, and 100*/
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      /* In this app, dynamically set the picture source, Camera or photo gallery*/
      sourceType: srcType,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true  /*Corrects Android orientation quirks*/
    }
    return options;
  }

  displayImage(imgUri) {
    let elem = document.getElementById('imageFile');
    elem.src = imgUri;
  }

  onUpload() {
    console.log(this.selectedFile); /* You can use FormData upload to backend server*/
  }

  ngOnInit() {
    /*localStorage.clear();*/
    this.localUsername = localStorage.getItem('userName');
    this.localPassword = localStorage.getItem('password');
  }





  async login() {

    this.isOnline = await this.onlineCheckService.onlineCheck();

    if (this.isOnline) {

      let test = await this.loginService.login();

      if (test) {
        ons.notification.toast('ログインに成功しました。', { timeout: 1000 });
        await this.navi.element.resetToPage(Top, { animation: "fade" });
      }
      else if (test === 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        await ons.notification.toast('ログインに失敗しました。エラー：' + test, { timeout: 1000 });
        /*オフライン時処理：ログイン処理は行わず、ローカルストレージに保存されたデータを基に貸与物一覧画面（オフライン用）へ遷移*/
        this.navi.element.resetToPage(Top, { animation: "fade" })
        ons.notification.toast('オフライン状態です。ローカルストレージのデータを出力します。', { timeout: 1000 });
      }

    } else {
      /*オフライン時処理：ログイン処理は行わず、ローカルストレージに保存されたデータを基に貸与物一覧画面（オフライン用）へ遷移*/
      this.navi.element.resetToPage(Top, { animation: "fade" })
      ons.notification.toast('オフライン状態です。ローカルストレージのデータを出力します。', { timeout: 1000 });
    }
  }
}