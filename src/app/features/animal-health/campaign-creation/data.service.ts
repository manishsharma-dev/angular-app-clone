import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface Person {
    id: string;
    isActive: boolean;
    age: number;
    name: string;
    gender: string;
    company: string;
    email: string;
    phone: string;
    disabled?: boolean;
}



@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient) { }

    getGithubAccounts(term: string = null) {
        if (term) {
            return this.http.get<any>(`https://api.github.com/search/users?q=${term}`).pipe(map(rsp => rsp.items));
        } else {
            return of([]);
        }
    }

    getAlbums() {
        return this.http.get<any[]>('https://jsonplaceholder.typicode.com/albums');
    }

    getPhotos() {
        return this.http.get<any[]>('https://jsonplaceholder.typicode.com/photos');
    }

    getVillages(term: string = null): Observable<Person[]> {
        let items = getMockVillages();
        if (term) {
            items = items.filter(x => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getSpecies(term: string = null): Observable<Person[]> {
        let items = getMockSpecies();
        if (term) {
            items = items.filter(x => x.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getCampaigns(term: string = null): Observable<any> {
        let items = getMockCampaign();
        if (term) {
            items = items.filter(x => x.village_name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getSymptoms(term: string = null): Observable<any> {
        let items = getMockSymptom();
        if (term) {
            items = items.filter(x => x.symptom_name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getDisease(term: string = null): Observable<any> {
        let items = getMockDisease();
        if (term) {
            items = items.filter(x => x.disease_name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    getMedicine(term: string = null): Observable<any> {
        let items = getMockMedicine();
        if (term) {
            items = items.filter(x => x.village_name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }
}

function getMockVillages() {
    return [
        {
            'id': '5a15b13c36e7a7f00cf0d7cb',
            'index': 2,
            'isActive': true,
            'picture': 'http://placehold.it/32x32',
            'age': 23,
            'name': 'Amber',
            'gender': 'female',
            'company': 'ZOLAR',
            'email': 'karynwright@zolar.com',
            'phone': '+1 (851) 583-2547'
        },
        {
            'id': '5a15b13c2340978ec3d2c0ea',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'name': 'Aradka',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c663ea0af9ad0dae8',
            'index': 4,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 25,
            'name': 'DB Kalan',
            'gender': 'male',
            'company': 'ZYTRAX',
            'email': 'mendozaruiz@zytrax.com',
            'phone': '+1 (904) 536-2020'
        }
    ]
}

function getMockSpecies() {
    return [
        {
            'id': '5a15b13c36e7a7f00cf0d7',
            'index': 2,
            'isActive': true,
            'picture': 'http://placehold.it/32x32',
            'age': 23,
            'name': 'Cow',
            'gender': 'female',
            'company': 'ZOLAR',
            'email': 'karynwright@zolar.com',
            'phone': '+1 (851) 583-2547'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'name': 'Buffalo',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        }
    ]
}

function getMockCampaign() {
    return [
        {
            'index': 1,
            'campaign_id': '2000450240',
            'village_name': 'Ajmer',
            'campaign_type': 'Vaccination',
            'campaign_for': 'FMD',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Open'
        },
        {
            'index': 2,
            'campaign_id': '2000450241',
            'village_name': 'Daboli Kalan',
            'campaign_type': 'Vaccination1',
            'campaign_for': 'Brucellosis',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Close'
        },
        {
            'index': 3,
            'campaign_id': '2000450242',
            'village_name': 'Jaipur',
            'campaign_type': 'Vaccination2',
            'campaign_for': 'FMD',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Open'
        },
        {
            'index': 4,
            'campaign_id': '2000450243',
            'village_name': 'Sonipat',
            'campaign_type': 'Vaccination3',
            'campaign_for': 'FMD',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Open'
        },
        {
            'index': 5,
            'campaign_id': '2000450244',
            'village_name': 'Rai',
            'campaign_type': 'Vaccination4',
            'campaign_for': 'Brucellosis',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Close'
        },
        {
            'index': 6,
            'campaign_id': '2000450245',
            'village_name': 'Kundli',
            'campaign_type': 'Vaccination5',
            'campaign_for': 'Brucellosis',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Close'
        },
        {
            'index': 7,
            'campaign_id': '2000450246',
            'village_name': 'Shahbad',
            'campaign_type': 'Vaccination6',
            'campaign_for': 'Brucellosis',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Close'
        },
        {
            'index': 8,
            'campaign_id': '2000450247',
            'village_name': 'Auli',
            'campaign_type': 'Vaccination7',
            'campaign_for': 'FMD',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Open'
        },
        {
            'index': 9,
            'campaign_id': '2000450248',
            'village_name': 'Uttrakhand',
            'campaign_type': 'Vaccination8',
            'campaign_for': 'FMD',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Open'
        },
        {
            'index': 10,
            'campaign_id': '2000450249',
            'village_name': 'Panipat, Panipat, Panipat, Panipat, Panipat, Panipat ',
            'campaign_type': 'Vaccination9',
            'campaign_for': 'Brucellosis',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Close'
        }
    ]
}

function getMockSymptom() {
    return [
        {
            'id': '5a15b13c36e7a7f00cf0d7',
            'index': 2,
            'isActive': true,
            'picture': 'http://placehold.it/32x32',
            'age': 23,
            'symptom_name': 'Atrophy',
            'gender': 'female',
            'company': 'ZOLAR',
            'email': 'karynwright@zolar.com',
            'phone': '+1 (851) 583-2547'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'symptom_name': 'Cold',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'symptom_name': 'Fibroud Udder',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'symptom_name': 'Hypertrophy (Udder)',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'symptom_name': 'Inflammation (Udder)',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        }
    ]
}

function getMockDisease() {
    return [
        {
            'id': '5a15b13c36e7a7f00cf0d7',
            'index': 2,
            'isActive': true,
            'picture': 'http://placehold.it/32x32',
            'age': 23,
            'disease_name': 'Clinical Mastitis',
            'gender': 'female',
            'company': 'ZOLAR',
            'email': 'karynwright@zolar.com',
            'phone': '+1 (851) 583-2547'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'disease_name': 'Udder Abscess',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'disease_name': 'Jaundice',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'disease_name': 'Malaria',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        },
        {
            'id': '5a15b13c2340978ec3d2c0',
            'index': 3,
            'isActive': false,
            'picture': 'http://placehold.it/32x32',
            'age': 35,
            'disease_name': 'Hepatitis B',
            'gender': 'female',
            'company': 'EXTRAWEAR',
            'email': 'rochelleestes@extrawear.com',
            'phone': '+1 (849) 408-2029'
        }
    ]
}

function getMockMedicine() {
    return [
        {
            'index': 1,
            'campaign_id': '2000450240',
            'village_name': 'Ajmer',
            'campaign_type': 'Vaccination',
            'campaign_for': 'FMD',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Open'
        },
        {
            'index': 2,
            'campaign_id': '2000450241',
            'village_name': 'Daboli Kalan',
            'campaign_type': 'Vaccination1',
            'campaign_for': 'Brucellosis',
            'campaign_from_date': '01/01/2022',
            'campaign_to_date': '01/01/2022',
            'status': 'Close'
        }
    ]
}