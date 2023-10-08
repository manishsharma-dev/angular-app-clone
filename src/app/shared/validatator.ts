export const animalHealthValidations = {
  treatmentList: {
    required: 'animalHealthValidations.treatmentList.required',
    searchValidation: 'animalHealthValidations.treatmentList.searchValidation',
  },
  newCase: {
    required: 'animalHealthValidations.newCase.required',
    selectRequired: 'animalHealthValidations.newCase.selectRequired',
    temperaturePattern: 'animalHealthValidations.newCase.temperaturePattern',
    heartRateLength: 'animalHealthValidations.newCase.heartRateLength',
    heartRatePattern: 'animalHealthValidations.newCase.heartRatePattern',
    respiratoryRateLength:
      'animalHealthValidations.newCase.respiratoryRateLength',
    respiratoryRatePattern:
      'animalHealthValidations.newCase.respiratoryRatePattern',
    motilityLength: 'animalHealthValidations.newCase.motilityLength',
    motilityPattern: 'animalHealthValidations.newCase.motilityPattern',
    treatmentRemarks: 'animalHealthValidations.newCase.treatmentRemarks',
    treatmentRemarksPattern:
      'animalHealthValidations.newCase.treatmentRemarksPattern',
    invalidChar: 'animalHealthValidations.newCase.invalidChar',
  },
  updateResults: {
    invalidReading: 'animalHealthValidations.updateResults.invalidReading',
    invalidFileType: 'animalHealthValidations.updateResults.invalidFileType',
  },
  outbreakFollowup: {
    required: 'animalHealthValidations.outbreakFollowup.required',
    reportedByLength:
      'animalHealthValidations.outbreakFollowup.reportedByLength',
    affectedSpecies: 'animalHealthValidations.outbreakFollowup.affectedSpecies',
    affectedAnimals: 'animalHealthValidations.outbreakFollowup.affectedAnimals',
    invalidChar: 'animalHealthValidations.outbreakFollowup.invalidChar',
    maxlength: 'animalHealthValidations.outbreakFollowup.maxlength',
    decimalValidation:
      'animalHealthValidations.outbreakFollowup.decimalValidation',
  },
  postMortem: {
    required: 'animalHealthValidations.postMortem.required',
    validTagId: 'animalHealthValidations.postMortem.validTagId',
    decimalValidation: 'animalHealthValidations.postMortem.decimalValidation',
    invalidChar: 'animalHealthValidations.postMortem.invalidChar',
    postMortemCharges: 'animalHealthValidations.postMortem.postMortemCharges',
    receiptNo: 'animalHealthValidations.postMortem.receiptNo',
  },
  intimatonReport: {
    required: 'animalHealthValidations.intimatonReport.required',
    reportedByLength:
      'animalHealthValidations.intimatonReport.reportedByLength',
    affectedSpecies: 'animalHealthValidations.intimatonReport.affectedSpecies',
    affectedAnimals: 'animalHealthValidations.intimatonReport.affectedAnimals',
    invalidChar: 'animalHealthValidations.intimatonReport.invalidChar',
    maxlength: 'animalHealthValidations.intimatonReport.maxlength',
    decimalValidation:
      'animalHealthValidations.intimatonReport.decimalValidation',
  },
  firstAid: {
    required: 'animalHealthValidations.firstAid.required',
    firstAidRemarks: 'animalHealthValidations.firstAid.firstAidRemarks',
    firstAidRemarksPattern:
      'animalHealthValidations.firstAid.firstAidRemarksPattern',
    treatmentGivenRemarks:
      'animalHealthValidations.firstAid.treatmentGivenRemarks',
    treatmentGivenPattern:
      'animalHealthValidations.firstAid.treatmentGivenPattern',
    paymentAmountPattern:
      'animalHealthValidations.firstAid.paymentAmountPattern',
    paymentAmountmaxlength:
      'animalHealthValidations.firstAid.paymentAmountmaxlength',
    receiptNoPattern: 'animalHealthValidations.firstAid.receiptNoPattern',
    receiptNomaxlength: 'animalHealthValidations.firstAid.receiptNomaxlength',
  },
  campaignCreation: {
    required: 'animalHealthValidations.campaignCreation.required',
    campaignName: 'animalHealthValidations.campaignCreation.campaignName',
    campaignNamePattern:
      'animalHealthValidations.campaignCreation.campaignNamePattern',
    batchNumberPattern:
      'animalHealthValidations.campaignCreation.batchNumberPattern',
    batchNumbermaxlength:
      'animalHealthValidations.campaignCreation.batchNumbermaxlength',
    species: 'animalHealthValidations.campaignCreation.species',
    form: 'animalHealthValidations.campaignCreation.form',
    route: 'animalHealthValidations.campaignCreation.route',
    dosePattern: 'animalHealthValidations.campaignCreation.dosePattern',
    dosemaxlength: 'animalHealthValidations.campaignCreation.dosemaxlength',
  },
  untagged: {
    required: 'animalHealthValidations.untaggedModule.required',
    prescriptionfirstAidRemarks: 'animalHealthValidations.untaggedModule.prescriptionfirstAidRemarks',
    prescriptionRemarksPattern:
      'animalHealthValidations.untaggedModule.prescriptionRemarksPattern',
    specifyReasonRemarks: 'animalHealthValidations.untaggedModule.specifyReasonRemarks',
    specifyReasonPattern: 'animalHealthValidations.untaggedModule.specifyReasonPattern',
    requestorNameRemarks: 'animalHealthValidations.untaggedModule.requestorNameRemarks',
    requestorNamePattern: 'animalHealthValidations.untaggedModule.requestorNamePattern'
  },
  round: {
    required: 'animalHealthValidations.round.required',
    roundNumbercharacter: 'animalHealthValidations.round.roundNumbercharacter',
    roundNumberPattern: 'animalHealthValidations.round.roundNumberPattern',
  },
  groupDiseaseTesting: {
    required: 'animalHealthValidations.groupDiseaseTesting.required',
    selectRequired: 'animalHealthValidations.newCase.selectRequired',
    villageRequired:
      'animalHealthValidations.groupDiseaseTesting.villageRequired',
    planRequired: 'animalHealthValidations.groupDiseaseTesting.planRequired',
    suspectedDiseaseRequired:
      'animalHealthValidations.groupDiseaseTesting.suspectedDiseaseRequired',
    initialReadingLength:
      'animalHealthValidations.groupDiseaseTesting.initialReadingLength',
    finalReadingLength:
      'animalHealthValidations.groupDiseaseTesting.finalReadingLength',
    treatmentRemarksPattern: 'animalHealthValidations.newCase.treatmentRemarksPattern',
    treatmentRemarks: 'animalHealthValidations.newCase.treatmentRemarks'
  },
  poolDiseaseTesting: {
    required: 'animalHealthValidations.poolDiseaseTesting.required',
    poolMinCount: 'animalHealthValidations.poolDiseaseTesting.poolMinCount',
    poolMaxCount: 'animalHealthValidations.poolDiseaseTesting.poolMaxCount',
    initialReadingLength:
      'animalHealthValidations.poolDiseaseTesting.initialReadingLength',
    finalReadingLength:
      'animalHealthValidations.poolDiseaseTesting.finalReadingLength',
  },
};

export const animalBreedingValidations = {
  common: {
    required: 'animalBreedingValidations.common.required',
    invalidChar: 'animalBreedingValidations.common.invalidChar',
    decimalValidation: 'animalBreedingValidations.common.decimalValidation',
    minMax: 'animalBreedingValidations.common.minMax',
    number: 'animalBreedingValidations.common.number',
    negativeValue: 'animalBreedingValidations.common.negativeValue',
  },
  testAI: {},
  eliteAnimal: {
    reasonLength: 'animalBreedingValidations.eliteAnimal.reasonLength',
  },
  gm: {
    minWeight: 'animalBreedingValidations.gm.minWeight',
    minLength: 'animalBreedingValidations.gm.minLength',
    minGirth: 'animalBreedingValidations.gm.minGirth',
    girthLessThanLength: 'animalBreedingValidations.gm.girthLessThanLength',
  },
  milkSampling: {
    sampleIdLength: 'animalBreedingValidations.milkSampling.sampleIdLength',
  },
  geneticAnalysis: {
    receiptNoLength:
      'animalBreedingValidations.geneticAnalysis.receiptNoLength',
  },
  typing: {
    value_must_be_greater_than_or_equal_to:
      'animalBreedingValidations.typing.value_must_be_greater_than_or_equal_to',
    value_must_be_less_than_or_equal_to:
      'animalBreedingValidations.typing.value_must_be_less_than_or_equal_to',
  },
};
