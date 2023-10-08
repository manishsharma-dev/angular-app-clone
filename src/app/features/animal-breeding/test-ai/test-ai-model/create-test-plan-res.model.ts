export interface CreateTestPlanRes {
  testPlanId: number;
  testAiLocationMapDto: TestAILocationMapDto[];
  testAiAnimalDetailsDto: TestAIAnimalDetailsDto[];
  testPlanName: string;
  projectId: string;
  startDate: string;
  endDate: string;
  stateCd: number;
}

export interface TestAIAnimalDetailsDto {
  bullId: string;
  animalId: number;
  tagId: number;
}

export interface TestAILocationMapDto {
  districtCd: number;
  tehsilDto: TehsilDto[];
}

export interface TehsilDto {
  tehsilCd: number;
  villageCd: number[];
}
