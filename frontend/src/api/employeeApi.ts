import axios from "axios";
import type { Employee } from "../types";

const API_URL = "http://13.210.62.139:8080/api/employees";

export const getAllEmployees = async (): Promise<Employee[]> => {
    const response = await axios.get<Employee[]>(API_URL);
    return response.data;
}

export const getEmployeeById = async (id: number): Promise<Employee> => {
    const response = await axios.get<Employee>(`${API_URL}/${id}`);
    return response.data;
}

export const createEmployee = async (employee: any): Promise<Employee> => {
    const response = await axios.post<Employee>(API_URL, employee)
    return response.data
}

export const updateEmployee = async (id: number, employee: any): Promise<Employee> => {
    const response = await axios.put<Employee>(`${API_URL}/${id}`, employee)
    return response.data
}

export const deleteEmployee = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
}