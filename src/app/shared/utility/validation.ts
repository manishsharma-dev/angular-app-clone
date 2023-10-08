import { Validators } from '@angular/forms';

export const LandlineValidation = Validators.pattern(
  '^((\\+91-?)|0)?[0-9]{10}$'
);
export const AadhaarValidation = Validators.pattern(
  '^[1-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$'
);

export const MobileValidation = Validators.pattern('^[2-9]{1}[0-9]{9}$');
export const PinCodeValidation = Validators.pattern(
  '^[1-9][0-9]{2}\\s?[0-9]{3}$'
);
export const EartagValidation = Validators.pattern('^[0-9]{12}$');
export const LatestEartagServiceValidation = Validators.pattern(
  `(${'^[0-9]{12}$'})|(${'^[0-9]{11}$'})|(${'^[0-9]{8}$'})`
);
export const TagIdSearchValidation = Validators.pattern(
  `(${'^[2-9]{1}[0-9]{9}$'})|(${'^([a-zA-Z]+(([. ][a-zA-Z ]{0,})*[a-zA-Z ]*)){2,}$'})|(${'^[0-9]{15}$'})|(${'^[0-9]{12}$'})|(${'^[0-9]{4}$'})|(${'^[0-9]{11}$'})|(${'^[0-9]{8}$'})`
);
export const NameValidation = Validators.pattern(
  '^([A-Za-z0-9()]+ )+[A-Za-z0-9()]+$|^[A-Za-z0-9]+$'
);
export const SpecialNameValidation = Validators.pattern(
  /^[a-zA-Z]+((['. ][a-zA-Z ])?[a-zA-Z ]*)*$/
);
export const EmailValidation = Validators.pattern(
  '^[a-z0-9A-Z._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
);
export const SearchValidation = Validators.pattern(
  `(${'^[2-9]{1}[0-9]{9}$'})|(${'^[a-zA-Z ]{3,}$'})|(${'^[0-9]{15}$'})`
);

export const GetAllOwnersValidation = Validators.pattern(
  `(${'^[2-9]{1}[0-9]{9}$'})|(${'^([a-zA-Z]+(([. ][a-zA-Z ]{0,})*[a-zA-Z ]*)){2,}$'})|(${'^[0-9]{15}$'})`
);

export const onlyNumberValidation = Validators.pattern('^[0-9]+$');
export const NumericValidation = Validators.pattern('^[0-9]+$');
export const NaturalNumberValidation = Validators.pattern('^[1-9]+$');
export const decimalNumberValidation = Validators.pattern(
  '^[+-]?([0-9]+\\.?[0-9]*|\\.[0-9]+)$'
);
export const MembershipNumberValidation = Validators.pattern('^[a-zA-Z0-9]+$');
export const AlphaNumericValidation = Validators.pattern('^[a-zA-Z0-9]+$');
export const PanCardValidation = Validators.pattern(
  '^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$'
);

export const BullIdValidation = Validators.pattern('^[\\a-zA-Z0-9/\\\\-]+$');
export const AddressValidation = Validators.pattern(
  // '^[#.0-9a-zA-Z/()^\\s+,-]+$',
  '^([A-Za-z0-9/(),-.#]+ )+[A-Za-z0-9/(),-.#]+$|^[A-Za-z0-9/(),-.#]+$'
);
export const NamespecialValidation = Validators.pattern(
  '^([A-Za-z0-9(),-.]+ )+[A-Za-z0-9(),-./]+$|^[A-Za-z0-9(),-./]+$'
);

export const loginIdSearchValidation = Validators.pattern(
  '^([A-Za-z0-9()_-]+ )+[A-Za-z0-9()_-]+$|^[A-Za-z0-9()_-]+$'
);

export const UserNamespecialValidation = Validators.pattern(
  '^([A-Za-z().]+ )+[A-Za-z().]+$|^[A-Za-z().]+$'
);

export const AlphaNumericSpecialValidation =
  Validators.pattern(/^[-@,.\/&+\w\s]*$/);

export const AddressValidationFormat = Validators.pattern(
  '^[A-Za-z0-9\\. \\-\\,\\s]+$'
);

export const decimalNumberWeightValidation = Validators.pattern(
  /^\d{0,5}(\.\d{1,2})?$/
);
export const amountValidation = Validators.pattern(/^[1-9]\d*(\.\d+)?$/);

export const PasswordValidation = Validators.pattern(
  /^(?=.*\d)(?=.*[A-Z])(?!.*[^a-zA-Z0-9!@#$^+=&])(?=.*\W)(.{8,15})$/
);
export const SiretagValidation = Validators.pattern('^[a-zA-Z0-9\\-\\,\\s]*$');

/* =========== file size check before uploading ========== */
export function getFileSize(data: { size: number; type: string }) {
  let fileSize = Math.round(data?.size / 1024);
  if (fileSize <= 10 * 1024) {
    return true;
  }
  return false;
}
