import { useNavigate } from 'react-router-dom'
import type { Employee } from '../types'
import './EmployeeCard.scss';

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
        <div className="employee-card">
            <div className="employee-info">
                <p className="employee-name">{employee.firstName} {employee.lastName}</p>
                <p className="employee-details">{getContractSummary(employee)}</p>
                <p className="employee-details">{employee.email}</p>
            </div>
            <div className="action-buttons">
                <button className="edit-btn" onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                    Edit
                </button>
                <button className="remove-btn" onClick={() => onDelete(employee.id)}>
                    Remove
                </button>
            </div>
        </div>
    )
}

export default EmployeeCard