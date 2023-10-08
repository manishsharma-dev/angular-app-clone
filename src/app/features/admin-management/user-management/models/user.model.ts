export interface User {
  id: number;
  name: string;
  userType: string;
  orgName: string;
  baseLocation: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'inactive';
}