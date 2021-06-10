import { Injectable } from '@angular/core';
import { errCodeToMsg } from './common';
import * as ons from 'onsenui';

@Injectable()
export class SearchService {


  /*アップデート後を反映*/
  async update(flag: string, lentArticlesArray: RESULT[], retries = 3) {
    /*console.log(JSON.stringify(array));*/
    let Obj = ncmb.DataStore("Object");
    let updateObj = await Obj.equalTo("objectId", flag)
      .fetch()
      .then(function (results) {
        console.log(JSON.stringify(results));
        for (let i = 0; i < lentArticlesArray.length; i++) {
          if (lentArticlesArray[i].objectId === results.objectId) {
            lentArticlesArray.splice(i, 1, results);
            console.log(JSON.stringify(lentArticlesArray));
          }
        }
        return true;
      })
      .catch(function (error) {
        return error;
      });
    if (updateObj === true) {
      return;
    } else {

      let msg = errCodeToMsg(updateObj);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.update(flag, lentArticlesArray, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        }
      }
      return;
    }
  }

  /*階層数の判断*/
  async determine(userRole) {

    const oneHierarchy = new RegExp('(^[0-9]{2}[1-9]$ | ^[7][0]{2}$)');
    const twoHierarchy = new RegExp('(^[1-9]{2}[0]$ | ^[2-6][0]{2}$)');
    const threeHierarchy = new RegExp('^[1][0]{2}$');
    const oneCheck = oneHierarchy.test(userRole);
    const twoCheck = twoHierarchy.test(userRole);
    const threeCheck = threeHierarchy.test(userRole);
    let temp_array = [];
    let tmp_bindArray = [];
    const divisionAll = '900';

    if (oneCheck) {
      return await this.searchOneLevelHierarchy(userRole);
    } else if (twoCheck) {
      return await this.searchTwoLevelHierarchy(userRole);
    } else if (threeCheck) {
      return await this.searchThreeLevelHierarchy(userRole);
    }else if(userRole === divisionAll){
      tmp_bindArray.push(await this.searchThreeLevelHierarchy("100"));
      for(let i = 2; i < 7; i++){
      tmp_bindArray.push(await this.searchTwoLevelHierarchy([i]+"00"));
      }
      tmp_bindArray.push(await this.searchOneLevelHierarchy("700"));
      const list = tmp_bindArray.reduce((pre, current) => { pre.push(...current); return pre }, []);
      return list;
    }
    return;
  }




  /*1階層の場合の貸与物取得処理*/
  async searchOneLevelHierarchy(userRole) {
    let temp_userList;
    temp_userList = await this.oneLevelHierarchy(userRole);
    if (temp_userList !== false) {
      return await this.getItemList(temp_userList);
    }
  }


  /*1階層の検索メソッド*/
  async oneLevelHierarchy(userRole, retries = 3) {
    let dataFlag = false;
    let userPhonetic = [];
    let temp_userList = await ncmb.Role.equalTo("roleName", userRole).fetch()
      .then(function (role) {
        /*throw new Error("わざとエラーをぶん投げるなどする");*/
        console.log(JSON.stringify(role));
        return role.fetchUser();
      })
      .then(function (users) {
        for (let i in users) {
          userPhonetic.push(users[i].phonetic);
        };
        dataFlag = true;
        return userPhonetic;
      })
      .catch(function (error) {
        return error;
      });

    if (dataFlag) {
      console.log("OK2");
      console.log(JSON.stringify(temp_userList));
      return temp_userList;
    } else {

      let msg = errCodeToMsg(temp_userList);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.oneLevelHierarchy(userRole, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        }
      }
      return false;
    }
  }


  /*2階層の場合の貸与物取得処理*/
  async searchTwoLevelHierarchy(userRole) {
    let parent_tmp_userlist;
    let child_temp_userList;
    parent_tmp_userlist = await this.oneLevelHierarchy(userRole);
    child_temp_userList = await this.twoLevelHierarchy(userRole);
    if (child_temp_userList !== false || parent_tmp_userlist !== false) {
      let bindArray = child_temp_userList.concat(parent_tmp_userlist);
      console.log(bindArray + "結合配列");
      console.log(bindArray.length + "数");
      return await this.getItemList(bindArray);
    }
  }


  /*2階層の検索メソッド*/
  async twoLevelHierarchy(userRole, retries = 3) {
    let userPhonetic = [];
    let dataFlag = false;

    let temp_userList = await ncmb.Role.equalTo("roleName", userRole).fetch()
      .then(function (role) {
        console.log(JSON.stringify(role));
        return role.fetchRole();
      })
      .then(async function (role1) {
        /*throw new Error("わざとエラーをぶん投げるなどする");*/
        let userlist;
        console.log(JSON.stringify(role1));
        for (let i = 0; i < role1.length; i++) {
          userlist = await ncmb.User
            .relatedTo(role1[i], "belongUser")
            .fetchAll()
            .then((users) => {
              console.log(JSON.stringify(users));
              for (let j = 0; j < users.length; j++) {
                userPhonetic.push(users[j].phonetic);
                /*console.log(JSON.stringify(userPhonetic));*/
              }
              if (i === (role1.length) - 1) {
                return userPhonetic;
              }
            })
        }
        dataFlag = true;
        return userlist;
      })
      .catch(function (error) {
        /* 検索失敗*/
        console.log("2階層エラーですわよ。");
        return error;
      });

    if (dataFlag) {
      console.log("OK1");
      console.log(JSON.stringify(temp_userList));
      return temp_userList;
    } else {

      let msg = errCodeToMsg(temp_userList);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.twoLevelHierarchy(userRole, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        }
      }
      return false;
    }
  }


  /*3階層の検索メソッド*/
  async threeLevelHierarchy(userRole, retries = 3) {
    let userPhonetic = [];
    let dataFlag = false;
    console.log(userRole);

    let temp_userList = await ncmb.Role.equalTo("roleName", userRole).fetch()
      .then(function (role) {
        console.log(JSON.stringify(role));//100
        return role.fetchRole();
      })
      .then(async function (role1) {
        console.log(JSON.stringify(role1) + "role111111111");
        let roleList;
        let bindArray = [];
        for (let i = 0; i < role1.length; i++) {
          roleList = await ncmb.Role.equalTo("roleName", role1[i].roleName).fetch()
            .then((role2) => {
              console.log(JSON.stringify(role2));
              return role2.fetchRole();
            });
          bindArray.push(roleList);/*配列内配列として格納*/
        }
        console.log(JSON.stringify(roleList));
        console.log(JSON.stringify(bindArray) + "bainddddd");
        const list = bindArray.reduce((pre, current) => { pre.push(...current); return pre }, []);
        return list;
      })
      .then(async function (role3) {
        let userList;
        for (let i = 0; i < role3.length; i++) {
          userList = await ncmb.User
            .relatedTo(role3[i], "belongUser")
            .fetchAll()
            .then((users) => {
              console.log(JSON.stringify(users));
              for (let j = 0; j < users.length; j++) {
                userPhonetic.push(users[j].phonetic);
                /*console.log(JSON.stringify(userPhonetic));*/
              }
              if (i === (role3.length) - 1) {
                return userPhonetic;
              }
            })
        }
        dataFlag = true;
        return userList;
      })
      .catch(function (error) {
        /* 検索失敗 */
        console.log("3階層エラーですわよ。");
        return error;
      });

    if (dataFlag) {
      console.log("OK1");
      console.log(JSON.stringify(temp_userList));
      return temp_userList;
    } else {

      let msg = errCodeToMsg(temp_userList);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.threeLevelHierarchy(userRole, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        }
      }
      return false;
    }
  }

  /*3階層の場合の貸与物取得処理*/
  async searchThreeLevelHierarchy(userRole) {
    let parent_tmp_userlist;
    let child_temp_userList;
    let grandchild_temp_userList;
    parent_tmp_userlist = await this.oneLevelHierarchy(userRole);
    child_temp_userList = await this.twoLevelHierarchy(userRole);
    grandchild_temp_userList = await this.threeLevelHierarchy(userRole);

    if (child_temp_userList !== false || parent_tmp_userlist !== false || grandchild_temp_userList !== false) {

      let bindArray = parent_tmp_userlist.concat(child_temp_userList).concat(grandchild_temp_userList);
      console.log(bindArray + "結合配列");
      console.log(bindArray.length + "数");
      return await this.getItemList(bindArray);
    }
  }


  /*貸与物一覧を取得*/
  async getItemList(userList, retries = 3) {
    let dataFlag = false;
    let Obj = ncmb.DataStore("Object");
    let temp_itemList;

    temp_itemList = await Obj.in("name", userList)
      .fetchAll()
      .then(function (results) {
        /*throw new Error("わざとエラーをぶん投げるなどする");*/
        console.log(JSON.stringify(results));
        dataFlag = true;
        return results;
      })
      .catch(function (error) {
        return error;
      });

    if (dataFlag) {
      return await Array.from(temp_itemList);
    } else {

      let msg = errCodeToMsg(temp_itemList);
      if (msg !== 'ネットワークエラーが発生しました。接続状況を確認してください。') {
        console.log("NWエラーではない");
        ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
      } else {
        console.log("NWエラー");
        if (retries > 0) {
          console.log("残り: " + retries + "回リトライ。")
          await this.getItemList(userList, --retries);
        } else {
          await ons.notification.toast('通信に失敗しました。エラー：' + msg, { timeout: 1000 });
        }
      }
      return;
    }
  }
}