export interface SavePostMortemResponse {
  postmortemId: number;
  sampleDetails: SampleDetail[];
}

export interface SampleDetail {
  sampleId: string;
  sampleType: number;
  sampleTypeDesc: string;
  testingLocation: number;
  testingLocationDesc: string;
}
