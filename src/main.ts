// Onsen UI Styling and Icons
// require('onsenui/css/onsen-css-components.css');
// require('onsenui/css/onsenui.css');

// @import '../node_modules/onsenui/css/onsenui.css';
// @import '../node_modules/onsenui/css/onsen-css-components.css';

import * as ons from 'onsenui';

// Application code starts here
import {enableProdMode, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {HttpModule} from '@angular/http';
// import {OnsenModule} from 'ngx-onsenui';
import {FormsModule} from '@angular/forms';
import { CategoryPipe } from './app/category.pipe';
import { OnlineCheckService } from './app/onlineCheckService';
import { ValidationCheckService } from './app/validationCheckService';
import { SearchService } from './app/searchService';
import { RegisterService } from './app/registerService';
import { UpdateService } from './app/updateService';
import { ViewService } from './app/viewService';
import { LoginService } from './app/loginService';

import {MyApp} from './app/app';
import {View} from './app/view';
import {Register} from './app/register';
import {Search} from './app/search';
import {Login} from './app/login';
import {Update} from './app/update';
import {Top} from './app/top';
import {SearchView} from './app/searchView';

import { BrowserModule } from '@angular/platform-browser';

/* import AmplifyUIAngularModule  */
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

import Amplify from "aws-amplify";
// import aws_exports from "./awsmobile";
// Amplify.configure(aws_exports);

// Enable production mode when in production mode.
if (process.env.NODE_ENV === 'production') {
  enableProdMode();
}

if (ons.platform.isIPhoneX()) {
  document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
  document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}

@NgModule({
    imports: [
        // OnsenModule, // has BrowserModule internally
        HttpModule,
        FormsModule,
        BrowserModule,
        AmplifyUIAngularModule,
        AppRoutingModule
    ],
    declarations: [
        // MyApp,
        AppComponent,
        View,
        Register,
        Search,
        Login,
        Top,
        Update,
        SearchView,
        CategoryPipe,//mizuno
    ],
    entryComponents: [
        View,
        Register,
        Search,
        Login,
        Top,
        Update,
        SearchView,
    ],
    bootstrap: [
        // MyApp,
        AppComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
    providers:[
        OnlineCheckService,
        ValidationCheckService,
        SearchService,
        RegisterService,
        UpdateService,
        ViewService,
        LoginService,
    ],
})
class AppModule {}

if (module['hot']) module['hot'].accept();

platformBrowserDynamic().bootstrapModule(AppModule)
.catch(err => console.error(err));
