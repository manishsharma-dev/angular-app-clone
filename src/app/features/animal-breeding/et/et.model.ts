export class HeatHistory {

    animalResponse: AnimalResponse;
    heatDetailsResponseList: HeatDetails[]
}

export class HeatDetails {
    currentLactationNo: number
    eligibleForEtFlag: string
    heatDate: string
    heatType: string
    remarks: string
    timeSlot: string
}
export class AnimalResponse {
    age: string;
    breed: string;
    species: string;
    tagId: number;
}

export class EmbryoMasterList {
    allocatedTo: string
    allocatedToId: String
    donorId: string
    embryoAge: number
    embryoGrade: string
    embryoId: string
    embryoStage: string
    embryoStatus: string
    labCd: string
    opuDate: string
    sireId: string
}
