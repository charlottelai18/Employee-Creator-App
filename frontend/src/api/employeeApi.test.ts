import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from './employeeApi'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const mockEmployee = {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '0412345678',
    address: '123 Example St',
    contractType: 'PERMANENT',
    startDate: '2022-01-01',
    basis: 'FULL_TIME',
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('employeeApi', () => {

    describe('getAllEmployees', () => {
        it('returns list of employees', async () => {
            mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockEmployee] })

            const result = await getAllEmployees()

            expect(result).toHaveLength(1)
            expect(result[0].email).toBe('john.smith@email.com')
        })

        it('returns empty array when no employees', async () => {
            mockedAxios.get = vi.fn().mockResolvedValue({ data: [] })

            const result = await getAllEmployees()

            expect(result).toEqual([])
        })
    })

    describe('getEmployeeById', () => {
        it('returns a single employee by id', async () => {
            mockedAxios.get = vi.fn().mockResolvedValue({ data: mockEmployee })

            const result = await getEmployeeById(1)

            expect(result.firstName).toBe('John')
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/1')
            )
        })
    })

    describe('createEmployee', () => {
        it('posts employee and returns created employee', async () => {
            mockedAxios.post = vi.fn().mockResolvedValue({ data: mockEmployee })

            const result = await createEmployee(mockEmployee)

            expect(result.email).toBe('john.smith@email.com')
            expect(mockedAxios.post).toHaveBeenCalledTimes(1)
        })
    })

    describe('updateEmployee', () => {
        it('puts updated employee and returns result', async () => {
            const updated = { ...mockEmployee, firstName: 'Jane' }
            mockedAxios.put = vi.fn().mockResolvedValue({ data: updated })

            const result = await updateEmployee(1, updated)

            expect(result.firstName).toBe('Jane')
            expect(mockedAxios.put).toHaveBeenCalledWith(
                expect.stringContaining('/1'),
                updated
            )
        })
    })

    describe('deleteEmployee', () => {
        it('calls delete with correct url', async () => {
            mockedAxios.delete = vi.fn().mockResolvedValue({})

            await deleteEmployee(1)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/1')
            )
        })
    })
})
