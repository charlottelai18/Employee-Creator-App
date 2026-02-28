import { useNavigate } from 'react-router-dom'
import type { Employee } from '../types'

interface EmployeeCardProps {
    employee: Employee
    onDelete: (id: number) => void
}

const EmployeeCard = ({ employee, onDelete }: EmployeeCardProps) => {
    const navigate = useNavigate()

    const getContractSummary = (employee: Employee): string => {
        const start = new Date(employee.startDate)
        const end = employee.endDate ? new Date(employee.endDate) : new Date()
        const years = Math.floor((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const type = employee.contractType === 'PERMANENT' ? 'Permanent' : 'Contract'
        return `${type} - ${years}yrs`
    }

    return (
        <div>
            <p>{employee.firstName} {employee.lastName}</p>
            <p>{getContractSummary(employee)}</p>
            <p>{employee.email}</p>

            <button onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                Edit
            </button>
            <button onClick={() => onDelete(employee.id)}>
                Remove
            </button>
        </div>
    )
}

export default EmployeeCard