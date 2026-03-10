import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EmployeeCard from './EmployeeCard'
import '@testing-library/jest-dom'
import type { Employee } from '../types'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const mockEmployee: Employee = {
    id: 1,
    firstName: 'John',
    middleName: undefined,
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '0412345678',
    address: '123 Example St, Sydney NSW 2000',
    contractType: 'PERMANENT',
    startDate: '2022-01-01',
    endDate: undefined,
    basis: 'FULL_TIME',
    hoursPerWeek: undefined,
}

const renderCard = (onDelete = vi.fn()) => {
    render(
        <MemoryRouter>
            <EmployeeCard employee={mockEmployee} onDelete={onDelete} />
        </MemoryRouter>
    )
}

describe('EmployeeCard', () => {

    it('renders employee name', () => {
        renderCard()
        expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    it('renders employee email', () => {
        renderCard()
        expect(screen.getByText('john.smith@email.com')).toBeInTheDocument()
    })

    it('renders contract type as Permanent', () => {
        renderCard()
        expect(screen.getByText(/Permanent/i)).toBeInTheDocument()
    })

    it('calls onDelete with employee id when delete button is clicked', () => {
        const onDelete = vi.fn()
        renderCard(onDelete)

        const deleteBtn = screen.getByRole('button', { name: /delete|trash/i })
            ?? screen.getAllByRole('button')[1]

        fireEvent.click(deleteBtn)
        expect(onDelete).toHaveBeenCalledWith(1)
    })

    it('navigates to edit page when edit button is clicked', () => {
        renderCard()

        const editBtn = screen.getAllByRole('button')[0]
        fireEvent.click(editBtn)

        expect(mockNavigate).toHaveBeenCalledWith('/employees/1/edit')
    })

    it('renders Contract type correctly', () => {
        const contractEmployee = { ...mockEmployee, contractType: 'CONTRACT' }
        render(
            <MemoryRouter>
                <EmployeeCard employee={contractEmployee} onDelete={vi.fn()} />
            </MemoryRouter>
        )
        expect(screen.getByText(/Contract/i)).toBeInTheDocument()
    })
})
