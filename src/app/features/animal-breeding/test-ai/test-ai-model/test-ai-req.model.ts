export interface CreateReq {
  testPlanName: string;
  projectId: string;
  startDate: string;
  endDate: string;
  stateCd: string;
  testAiLocationMapDto: TestAILocationMapDto[];
  testAiAnimalDetailsDto: TestAIAnimalDetailsDto[];
}

export interface TestAIAnimalDetailsDto {
  bullId: string;
  animalId: string;
  tagId: string;
}

export interface TestAILocationMapDto {
  districtCd: number;
  tehsilCd:number,
  villageCd: number,
  testPlanId:number
}

export interface TehsilDto {
  tehsilCd: number;
  villageCd: number[];
}
