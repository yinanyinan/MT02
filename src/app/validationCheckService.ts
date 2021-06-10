import { Injectable } from '@angular/core';
import * as ons from 'onsenui';


@Injectable()
export class ValidationCheckService {

    /**
     * 入力チェック
     * ・アラート表示内容
     * 入力エラー　：　「〇〇（※必須項目）が入力されていません。」
     */
     async inputBlankCheck(prefix) {
        let blankErrArray = [];
        if ((<HTMLInputElement>document.getElementById(`${prefix}FirstName`)).value === '' || (<HTMLInputElement>document.getElementById(`${prefix}LastName`)).value === '') { blankErrArray.push("氏名"); }
        if ((<HTMLInputElement>document.getElementById(`${prefix}ManagementNum`)).value === '') { blankErrArray.push("管理番号"); }
        if (Number((<HTMLInputElement>document.getElementById(`${prefix}Category`)).value) === -1) { blankErrArray.push("カテゴリ"); }
        if ((<HTMLInputElement>document.getElementById(`${prefix}BorrowedSource`)).value === '') { blankErrArray.push("貸与元名称"); }
        if ((<HTMLInputElement>document.getElementById(`${prefix}StartDate`)).value === '') { blankErrArray.push("貸与開始日"); }
        if ((<HTMLInputElement>document.getElementById(`${prefix}ExpectedReturnDate`)).value === '') { blankErrArray.push("返却予定日"); }
        if (Number((<HTMLInputElement>document.getElementById(`${prefix}StorageLocation`)).value) === -1) { blankErrArray.push("保管場所"); }

        let isError: boolean = blankErrArray.length !== 0;

        if (isError) {
            let errMsg = '';

            for (let i = 0; i < blankErrArray.length - 1; i++) {
                errMsg += blankErrArray[i] + '、';
            }
            errMsg += blankErrArray[blankErrArray.length - 1] + '（※必須項目）が入力されていません';
            await ons.notification.alert({
                title: '入力エラー',
                message: errMsg
            });
        }

        return !isError;
    }

    /**
     * カタカナ入力チェック
     */
    async isPhoneticCheck(prefix) {
        let isError: boolean = !(<HTMLInputElement>document.getElementById(`${prefix}FirstName`)).value.match(/^[ァ-ンー]+$/) ||
            !(<HTMLInputElement>document.getElementById(`${prefix}LastName`)).value.match(/^[ァ-ンー]+$/);
        if (isError) {
            await ons.notification.alert({
                title: '入力エラー',
                message: '氏名はカタカナで入力してください。'
            });
        }
        return !isError;
    }

    /**
     * 実行確認メッセージ
     */
    async executeConfirm(from) {
        console.log(from);
        let answer = await ons.notification.confirm({ title: '確認', message: `${from}を実行しますか？` }).then(
            function (answer) { return answer; }
        )
        return answer === 1;
    }

    /**
     * 人がいるかの判定
     */
    async isExistUserCheck(user) {
        let kanaArr = JSON.parse(sessionStorage.getItem('kanaArray'));

        let userFoundFlg = false;
        kanaArr.forEach((row, i) => {
            let colIndex = row.indexOf(user);
            if (colIndex >= 0) {
                userFoundFlg = true;
            }
        });
        if (!userFoundFlg) {
            ons.notification.alert({ title: '警告', message: 'その人物は存在しません。' });
        }
        return userFoundFlg;
    }

}