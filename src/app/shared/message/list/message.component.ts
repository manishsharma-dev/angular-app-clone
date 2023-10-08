import { Component, Inject } from "@angular/core";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
// import { Subscription } from "rxjs";

// import { ErrorService } from "./error.service";

@Component({
  templateUrl: "./message.component.html",
  selector: "message-error",
  styleUrls: ["./message.component.css"]
})
export class MessageComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }, private translate: TranslateService) {

    console.log('****',data)
  }
  // constructor(private errorService: ErrorService) {}


}