import { DistrictList } from 'src/app/shared/shareService/model/district.model';
import { StateList } from 'src/app/shared/shareService/model/state.model';
import { TehsilList } from 'src/app/shared/shareService/model/tehsil.model';
import { VillageList } from 'src/app/shared/shareService/model/village.model';

export interface CountryDetail {
  getVillages?: VillageList[];
  getDistrict?: DistrictList[];
  getTehsil?: TehsilList[];
  getStates?: StateList[];
}

export interface District {
  districtCd: number;
  districtName: string;
  stateCd: number;
}

export interface Tehsil {
  districtCd: number;
  tehsilCd: number;
  tehsilName: string;
}

export interface Village {
  tehsilCd: number;
  villageName: string;
  villageCd: number;
}
