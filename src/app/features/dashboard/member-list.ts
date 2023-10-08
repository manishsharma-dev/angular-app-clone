export interface MemberList {
        address_id:string,
        full_name:string,
        user_email:string,
        password:string,
        user_mobile:string,
        is_active:boolean,
        lab_name:string
        role: string
}

export interface Employee {
        company: string;
        frequency: number;
        name: string;
    }
    export const StatsBarChart: Employee[] = [
        {company: 'JAN', frequency: 100000, name: 'abc'},
        {company: 'FEB', frequency: 80000, name: 'abc'},
        {company: 'MAR', frequency: 20000 ,name: 'abc'},
        {company: 'APR', frequency: 70000 ,name: 'abc'},
        {company: 'MAY', frequency: 12000 ,name: 'abc'},
        {company: 'JUN', frequency: 110000 ,name: 'abc'},
        {company: 'JUL', frequency: 5000 ,name: 'abc'},
        {company: 'AUG', frequency: 4000 ,name: 'abc'},


    ];