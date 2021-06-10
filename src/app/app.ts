import { Component, OnInit } from '@angular/core';
// import * as ons from 'onsenui';

import { Login } from './login';

import css from './page.css';

import Amplify, { Auth } from 'aws-amplify';
// import awsconfig from 'awsmobile';

// Amplify.configure(awsconfig);

// let conf = 	{
//   {
//   identityPoolId: 'ap-northeast-1:254d821d-3a62-4171-92ae-ba930b1d4a89',
//   region: 'ap-northeast-1',
//   mandatorySignIn: false
// },
// aws_appsync_region: 'ap-northeast-1',
// aws_appsync_graphqlEndpoint: 'https://73uyrlv4jnbm5g62zktfak2wju.appsync-api.ap-northeast-1.amazonaws.com/graphql',
// aws_appsync_authenticationType: 'AWS_IAM'
// }

let awsconfig = {
  "aws_project_region": "ap-northeast-1",
  "aws_appsync_graphqlEndpoint": "https://73uyrlv4jnbm5g62zktfak2wju.appsync-api.ap-northeast-1.amazonaws.com/graphql",
  "aws_appsync_region": "ap-northeast-1",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-mrazpnjvwbholndsrs5hdjcrnu"
};

Amplify.configure(awsconfig);
Auth.configure(awsconfig);

// Amplify.configure(
//   {
//   Auth: {

// Amplify.configure(
//   {
//   Auth: {

//       // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
//       // amplify_backend_manager_d2l09de7iqouy7
//       identityPoolId: 'ap-northeast-1:254d821d-3a62-4171-92ae-ba930b1d4a89',

//       // REQUIRED - Amazon Cognito Region
//       region: 'ap-northeast-1',

//       // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
//       // Required only if it's different from Amazon Cognito Region
//       // identityPoolRegion: 'ap-northeast-1',

//       // OPTIONAL - Amazon Cognito User Pool ID
//       // userPoolId: 'XX-XXXX-X_abcd1234',

//       // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
//       // userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',

//       // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
//       // mandatorySignIn: false,

//       // OPTIONAL - Configuration for cookie storage
//       // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
//       // cookieStorage: {
//       // // REQUIRED - Cookie domain (only required if cookieStorage is provided)
//       //     domain: '.yourdomain.com',
//       // // OPTIONAL - Cookie path
//       //     path: '/',
//       // // OPTIONAL - Cookie expiration in days
//       //     expires: 365,
//       // // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
//       //     sameSite: "strict" | "lax",
//       // // OPTIONAL - Cookie secure flag
//       // // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
//       //     secure: true
//       // },

//       // OPTIONAL - customized storage object
//       // storage: MyStorage,

//       // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
//       // authenticationFlowType: 'USER_PASSWORD_AUTH',

//       // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
//       // clientMetadata: { myCustomKey: 'myCustomValue' },

//        // OPTIONAL - Hosted UI configuration
//       // oauth: {
//       //     domain: 'your_cognito_domain',
//       //     scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
//       //     redirectSignIn: 'http://localhost:3000/',
//       //     redirectSignOut: 'http://localhost:3000/',
//       //     responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
//       // }
//   }
// });

// // You can get the current config object
const currentConfig = Auth.configure();



@Component({
  selector: 'app',
  template: `<ons-navigator [page]="login" id="nav" var="myNavigator"></ons-navigator>`,
  style: [css]
})
export class MyApp implements OnInit {
  login = Login;
  /*
    animation = ons.platform.isAndroid() ? 'slide' : 'none';
    modifier = ons.platform.isAndroid() ? 'material noshadow' : '';
  */
  constructor() { }


  async ngOnInit() {
    //Sign in
    let username = 'loan_manage_access';
    let password = 'Miura@00'
    try {
      const user = await Auth.signIn(username, password);
      console.log(user)
    } catch (error) {
      console.log('error signing in', error);
    }
  }
}
