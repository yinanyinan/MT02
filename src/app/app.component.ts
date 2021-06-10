// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { APIService } from './API.service';
// import { Restaurant } from '../types/restaurant';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })

// export class AppComponent implements OnInit {
//   title = 'amplify-angular-app';
//   public createForm: FormGroup;

//   /* declare restaurants variable */
//   restaurants: Array<Restaurant>;

//   constructor(private api: APIService, private fb: FormBuilder) { }

//   async ngOnInit() {
//     this.createForm = this.fb.group({
//       'name': ['', Validators.required],
//       'description': ['', Validators.required],
//       'city': ['', Validators.required]
//     });
//     this.api.ListRestaurants().then(event => {
//       this.restaurants = event.items;
//     });
  
//     /* subscribe to new restaurants being created */
//     this.api.OnCreateRestaurantListener.subscribe( (event: any) => {
//       const newRestaurant = event.value.data.onCreateRestaurant;
//       this.restaurants = [newRestaurant, ...this.restaurants];
//     });
//   }

//   public onCreate(restaurant: Restaurant) {
//     this.api.CreateRestaurant(restaurant).then(event => {
//       console.log('item created!');
//       this.createForm.reset();
//     })
//     .catch(e => {
//       console.log('error creating restaurant...', e);
//     });
//   }
// }

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';

import { FormFieldTypes } from '@aws-amplify/ui-components';
// import css from './page.css';

@Component({
  selector: 'app',
  template: `
    <!-- パスワードマネージャーの有効化 -->
    <amplify-auth-container>
    <amplify-authenticator *ngIf="authState !== 'signedin'"></amplify-authenticator>
    </amplify-auth-container>
    <div *ngIf="authState === 'signedin' && user" class="App">
        <amplify-sign-out></amplify-sign-out>
        <div>Hello, {{user.username}}</div>
        <!-- This is where you application template code goes -->  
    </div>
            `
})

export class AppComponent implements OnInit {
  title = 'amplify-angular-auth';
  user: CognitoUserInterface | undefined;
  authState: AuthState;

  formFields: FormFieldTypes;

  constructor(private ref: ChangeDetectorRef) {
    this.formFields = [
      {
        type: "email",
        label: "Custom Email Label",
        placeholder: "Custom email placeholder",
        inputProps: { required: true, autocomplete: "username" },
      },
      {
        type: "password",
        label: "Custom Password Label",
        placeholder: "Custom password placeholder",
        inputProps: { required: true, autocomplete: "new-password" },
      },
      {
        type: "phone_number",
        label: "Custom Phone Label",
        placeholder: "Custom phone placeholder",
      },
    ];

  }

  ngOnInit() {
    onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData as CognitoUserInterface;
      this.ref.detectChanges();
    })
  }

  ngOnDestroy() {
    return onAuthUIStateChange;
  }
}