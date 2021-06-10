/** 共通定義 
 * エラーコード
 * 参照元：https://mbaas.nifcloud.com/doc/current/rest/common/error.html
 */
const errorCode: any = {
  E400000: "不正なリクエストです。",
  E400001: "JSONの形式が不正です。",
  E400002: "型が不正です。",
  E400003: "必須項目で未入力の値が存在します。",
  E400004: "フォーマットが不正です。",
  E400005: "無効な値です。",
  E400006: "存在しない値です。",
  E400007: "インポートエラーが発生しました。",
  E400008: "相関関係でエラーが発生しました。",
  E400009: "指定桁数を超えています。",
  E401000: "認証エラーです。",
  E401001: "Header不正による認証エラーです。",
  E401002: "ID又はパスワードが誤っております。ご確認ください。",
  E401003: "OAuth認証エラーです。",
  E401004: "決済情報なしでの有料プラン申込みによるエラーです。",
  E403000: "アクセス権がありません。",
  E403001: "フォルダ制御によるアクセス権がありません。",
  E403002: "コラボレータ/管理者権限がありません。又は、シグネチャなどの不正な操作によるエラーです。",
  E403003: "禁止されているオペレーションを実行しました。",
  E403004: "ワンタイムキーの有効期限が切れています。",
  E403005: "設定不可の項目です。",
  E403006: "GeoPoint型フィールドに対してGeoPoint型以外の値を登録／更新しようとしました。GeoPoint型以外のフィールドに対してGeoPoint型の値を登録／更新しようとしました。不正な位置検索の実施が検知されました。",
  E404001: "該当データがありません。",
  E404002: "該当サービスがありません。",
  E404003: "該当フィールドがありません。",
  E404004: "該当デバイストークンがありません。",
  E404005: "該当アプリケーションがありません。",
  E404006: "該当ユーザが存在しません。",
  E405001: "リクエストURI/メソッドが不許可となっています。",
  E409001: "重複したデータが存在しています。",
  E413001: "1ファイルあたりのサイズ上限エラーです。",
  E413002: "1ドキュメントあたりのサイズ上限エラーです。（16MB）",
  E413003: "複数オブジェクト一括操作の上限エラーです。",
  E414000: "リクエストURI長の上限エラーです。",
  E415001: "サポート対象外のContent-Typeを指定しました。",
  E429001: "使用制限（APIコール数/PUSH通知数/ストレージ容量）を超過しています。",
  E429002: "過度な同時接続が行われました。",
  E500001: "システムエラー ・DBエラーが発生しました。",
  E502001: "ストレージでエラーが発生しました。",
  E502002: "メール送信エラーです。",
  E503001: "サービス利用不可となっております。"
};

export function errCodeToMsg(error) {
  let errMsg = 'エラーが発生しました。';
  const networkError = 'ネットワークエラーが発生しました。接続状況を確認してください。';

  /* let pattern: RegExp = /cannot PUT https://mbaas\.api\.nifcloud\.com:443\/2013-09-01\/users\/[0-9][a-z][A-Z]{1,16} \(400\)/;
  */

  if (error.code) {
    let result = errorCode[error.code];
    errMsg = result;

  } else if (error.crossDomain === true) {
    errMsg = networkError;

  } else if (error.message === "Save the object before updating") {
    errMsg = "データが存在しません。";

  } else if (error.message === "To login by account, userName and password are necessary.") {
    errMsg = "社員番号、またはパスワードが違います。";

  } else if (error.message === "MailAddress must be set.") {
    errMsg = "メールアドレスを入力してください。";
    /*
 } else if (error.message.lastIndexOF('(400)') !== -1) {
     errMsg = "不正なリクエストです。(400)";
     */
    /*
 } else if (error.message.lastIndexOF('(401)') !== -1) {
     errMsg = "アクセス権限がありません。(401)";
     */




  } else {
    if (error === "ERROR: Request has been terminated Possible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.") {
      errMsg = networkError;
    }
  }

  /* errMsg = networkError;*//* debug*/
  console.log('common:' + JSON.stringify(error.message));
  console.log('common:' + errMsg)
  return errMsg;
}
