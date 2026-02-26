
export interface Employee{
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    contractType: string;
    startDate: string;
    endDate?: string;
    basis: string;
    hoursPerWeek?: number;
}   