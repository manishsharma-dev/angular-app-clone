import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { CoreModule } from "./core/core.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
import { AppRoutingModule } from "./app-routing.module";
import { LangTranslateModule } from "src/lang-translate.module";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";


import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup

@NgModule({
  declarations: [
    AppComponent,
    
    
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    LangTranslateModule,
    NgSelectModule,
    NgIdleKeepaliveModule.forRoot(),

  ],
  providers: [
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeKeycloak,
    //   multi: true,
    //   deps: [KeycloakService]
    // }
    

  ],

  bootstrap: [AppComponent],

})
export class AppModule { }
