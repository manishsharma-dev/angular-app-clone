import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from 'src/app/features/auth/auth.service';
import { getSessionData } from '../../shareService/storageData';
import { filter, map } from 'rxjs/operators';

@Pipe({
  name: 'moduleTranslation',
})
export class ModuleTranslationPipe implements PipeTransform {
  constructor(private authService: AuthService) {}

  transform(value: any, type?: any, code?: any, moduleCd?: number): any {
    return this.authService.getLanguageLabels().pipe(
      filter((langs) => !!langs?.length),
      map((langs: any) => {
        const defaultLanguage = getSessionData('language');
        if (
          defaultLanguage == '9' ||
          !value ||
          !type ||
          !code ||
          langs?.length === 0
        ) {
          return value;
        } else {
          if (type == 'parent') {
            return (
              langs?.find(
                (item) => item.moduleCd === code && item.subModuleCd == 0
              )?.label ?? value
            );
          } else if (type == 'child') {
            return (
              langs?.find(
                (item) =>
                  item.moduleCd === moduleCd && item.subModuleCd === code
              )?.label ?? value
            );
          }

          return value;
        }
      })
    );
  }
}
