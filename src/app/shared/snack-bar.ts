import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';



export class SnackBarMessage {
    constructor(private _snackBar: MatSnackBar) { }

    onSucessMessage(data: string, action: string, horizontalPosition: MatSnackBarHorizontalPosition, verticalPosition: MatSnackBarVerticalPosition, className: string) {
        this._snackBar.open(data, action, {
            duration: 5000,
            panelClass: [className],
            horizontalPosition: horizontalPosition,
            verticalPosition: verticalPosition,
        });

    }
}