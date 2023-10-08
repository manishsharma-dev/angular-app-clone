export const AnimalHealthConfig = {
  userId: 'System',
  // campaignUserID: 'UTT08463',
  campaignUserID: 'RAJ06290',
  sourceOriginCd: {
    diseaseTesting: 5,
    treatment: 6,
    postMortem: 7,
    intimation: 2,
  },
  treatmentCampaignCd: 4,
  commonMasterKeys: {
    caseStatus: 'case_status',
    medicineForm: 'medicine_form',
    radiologyReportType: 'radiology_report_type',
    onSpotTestCd: 'test_type',
    samplingStatus: 'sampling_status',
    sampleResult: 'sample_result',
    historyType: 'animal_health_history',
    sampleIdStatus: 'sample_id_status',
  },
  treatmentMinDate: 6,
  rumenMotilityEnabledSpecies: [
    'Cattle',
    'Buffalo',
    'Sheep',
    'Goat',
    'Mithun',
    'Yak',
    'Camel',
  ],

  clinicalParameters: [
    'temperatureCelcius',
    'temperatureFarenheit',
    'heartRate',
    'rumenMotility',
    'medicineFrequency'
  ],
};
