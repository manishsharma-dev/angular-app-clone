import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === 'string') {
    return of(null);
  }

  const file = control.value as File;
  if (!file) return of(null);
  const fileReader = new FileReader();
  const frObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 8);

        let header = "";
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }


        switch (header) {
          case 'ffd8ffe00104a46':
            if (
              control.value.type == 'image/jpeg' ||
              control.value.type == 'image/jpg'
            ) {
              isValid = true;
            } else {
              isValid = false;
            }
            break;

          case '89504e47da1aa':
            if (control.value.type == 'image/png') {
              isValid = true;
            } else {
              isValid = false;
            }
            break;

          default: // Or you can use the blob.type as fallback
            isValid = false;
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return frObs;
};
