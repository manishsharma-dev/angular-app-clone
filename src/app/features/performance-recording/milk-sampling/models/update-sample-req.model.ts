interface Sample {
  animalId: number;
  sampleId: string;
}

interface MilkSample {
  fatPercentage: number;
  proteinPercentage: number;
  snfPercentage: number;
  lactosePercentage: number;
  milkUreaNitrogen: number;
  somaticCellCount: number;
}

interface GeneticSample {
  sampleResult: 1 | 2;
}

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

type Either<T, U> = Only<T, U> | Only<U, T>;

export type UpdateSampleReq = Array<Sample & Either<MilkSample, GeneticSample>>;
