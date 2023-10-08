import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { SharedModule } from "../shared/shared.module";

import { AuthInterceptor } from "./auth-interceptor";
import { ErrorInterceptor } from "./error-interceptor";
import { ErrorComponent } from "./error/error.component";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';




@NgModule({
  declarations: [
    PageNotFoundComponent,
    ErrorComponent
  ],
  imports: [
    SharedModule
  ],
  
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    
    
  ],
  entryComponents: [ErrorComponent]

})


export class CoreModule {}
