export interface TransferDetail {
  transferId: number;
  transferStatus: string;
  animalId?: number;
  newOwnerId?: number;
  newOwnerMobileNo?: string;
  newOwnerName?: string;
  oldOwnerId?: number;
}
