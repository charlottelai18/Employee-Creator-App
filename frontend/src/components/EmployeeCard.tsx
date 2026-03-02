import { useNavigate } from 'react-router-dom'
import type { Employee } from '../types'
import './EmployeeCard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faUser, faTrash } from '@fortawesome/free-solid-svg-icons'

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
            <div className="card-left">
                <div className="avatar">
                    <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="employee-info">
                    <p className="employee-name">
                        {employee.firstName} {employee.lastName}
                    </p>
                    <p className="employee-details">
                        {getContractSummary(employee)}
                    </p>
                    <p className="employee-details">{employee.email}</p>
                </div>
            </div>

            <div className="card-actions">
                <button
                    className="edit-btn"
                    onClick={() => navigate(`/employees/${employee.id}/edit`)}
                >
                    <FontAwesomeIcon icon={faPencil} />
                </button>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(employee.id)}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
    )
}

export default EmployeeCard