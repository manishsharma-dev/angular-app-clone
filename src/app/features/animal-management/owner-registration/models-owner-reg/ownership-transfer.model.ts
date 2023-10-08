export interface OwnerTransferInitiation {
  oldOwnerId?: number;
  ownershipTransferDate?: string;
  reasonForTransfer?: string;
  newOwnerName?: string;
  newOwnerMobileNo?: string;
  newOwnerAddress?: string;
  newOwnerId?: number;
  animalIds: string[];
  resendOtp?: boolean;
  isInactiveAadhaarUser?: boolean;
}
