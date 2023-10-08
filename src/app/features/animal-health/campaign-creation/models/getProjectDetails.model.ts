
export interface GetProjectDetails {
    orgId:                     number;
    orgDesc:                   string;
    projectMissionCd:          number;
    projectMissionDesc:        string;
    projectName:               string;
    projectDesc:               string;
    projectStartDate:          string;
    projectEndDate:            string;
    projectDeEndDate:          string;
    contactPersonName:         string;
    designation:               string;
    emailId:                   string;
    mobileNo:                  number;
    alternateNo:               number;
    programCd:                 ProgramCD[];
    schemeCd:                  SchemeCD[];
    activityCd:                ActivityCD[];
    activityCode:              number[];
    projectValuesDetails:      ProjectValuesDetails;
    projectLocationMap:        ProjectLocationMap[];
    userAllocationprocessFlag: string;
    status:                    number;
    statusDesc:                string;
}

export interface ActivityCD {
    activityCd:            number;
    activityName:          string;
    activityParameterList: ActivityParameterList[];
}

export interface ActivityParameterList {
    parameterCd:    number;
    parameterName:  string;
    parameterValue: string;
    isActive:       string;
}

export interface ProgramCD {
    programCd:   number;
    programName: string;
}

export interface ProjectLocationMap {
    runSeqNo:             null;
    orgSuborgId:          number;
    projectId:            null;
    orgSuborgName:        string;
    stateCd:              number;
    stateName:            string;
    orgType:              number;
    orgTypeDesc:          string;
    orgMappingStartDate:  string;
    orgMappingEndDate:    string;
    deEndDate:            string;
    districtsCd:          number[];
    districtsCdWithNames: string[];
}

export interface ProjectValuesDetails {
    defaultAgeMax:          number;
    defaultAgeMin:          null;
    defaultBreedCd:         any[];
    restrictedBreedCd:      number[];
    defaultBreedCdNames:    any[];
    restrictedBreedCdNames: string[];
    defaultSex:             string;
    defaultSpeciesCd:       null;
    restrictedAgeMax:       null;
    restrictedAgeMin:       number;
    restrictedSex:          null;
    restrictedSpeciesCd:    number;
}

export interface SchemeCD {
    schemeCd:   number;
    schemeName: string;
}
