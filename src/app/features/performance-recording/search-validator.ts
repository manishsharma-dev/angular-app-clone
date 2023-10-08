import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { OwnerType } from 'src/app/shared/common-search-box/common-search-box.component';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';

export function SearchValidation(
  onlyTagId: boolean = false,
  validateSampleId: boolean = false
): ValidatorFn {
  return (group: FormGroup): { invalidSearchValue: string } => {
    const control = group?.get('searchValue');
    const ownerType: OwnerType = group?.get('ownerType')?.value;
    const value = `${control.value}`;
    const regex = new RegExp(
      `(${'^[2-9]{1}[0-9]{9}$'})|(${'^[a-zA-Z ]{3,}$'})|(${'^[0-9]{15}$'})`
    );
    const alphabetRegex = /^[a-zA-Z ]{0,}$/;

    // Blank Value
    if (value === null || value === '' || typeof value === 'undefined') {
      return {
        invalidSearchValue: 'errorMsg.enter_value',
      };
    }

    // Only Validate tag id
    if (
      onlyTagId &&
      (isNaN(+value) ||
        !(value.length === 8 || value.length === 11 || value.length === 12))
    ) {
      return {
        invalidSearchValue: 'performanceRecording.please_enter_valid_tag_id',
      };
    } else {
      const searchErrors = TagIdSearchValidation(control);
      if (!searchErrors && value?.length !== 15) {
        return null;
      }
      // if search value is number
      if (!isNaN(+value)) {
        if (value?.length === 15) {
          // if (ownerType === OwnerType.individual && !value?.startsWith('1')) {
          //   return { invalidSearchValue: 'common.indvOwnerId' };
          // } else if (
          //   ownerType === OwnerType.nonIndividual &&
          //   !value?.startsWith('3')
          // ) {
          //   return { invalidSearchValue: 'common.nonIndvOwnerId' };
          // }

          return null;
        }

        return {
          invalidSearchValue: 'errorMsg.all_number_error',
        };
      }
      // Sample id validation
      else if (validateSampleId && regex.test(value)) {
        if (value.length !== 12) {
          return {
            invalidSearchValue: 'errorMsg.invalid_sampleId',
          };
        }
        return null;
      } else if (alphabetRegex.test(value)) {
        return { invalidSearchValue: 'errorMsg.owner_name_err' };
      } else {
        return { invalidSearchValue: 'errorMsg.invalid_input' };
      }
    }
  };
}
