import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEmployees, deleteEmployee } from '../api/employeeApi'
import type { Employee } from '../types'
import EmployeeCard from '../components/EmployeeCard'
import './EmployeeListPage.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';


const EmployeeListPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true)
                const data = await getAllEmployees()
                setEmployees(data)
            } catch (err) {
                setError("")
            } finally {
                setLoading(false)
            }
        }
        fetchEmployees()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            setLoading(true)
            await deleteEmployee(id)
            setEmployees(employees.filter(emp => emp.id !== id))
        } catch (err) {
            setError("Failed to delete employee")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="list-page">
            <div className="title-header">
                <div className="title-container">
                    <div className="title-icon">
                        <FontAwesomeIcon icon={faUserGroup} />
                    </div>
                    <div className="title-text">
                        <h1>Employee Manager</h1>
                        <p>Manage your team members</p>
                    </div>
                </div>
            </div>

            <div className="list-header">
                <div className="list-container">
                    <h1>Employees List</h1>
                </div>
            </div>

            <div className="list-container">
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}

                {employees.map(employee => (
                    <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onDelete={handleDelete}
                    />
                ))}

                {employees.length === 0 && !loading && (
                    <p>No employees found. Add one!</p>
                )}

                <div className="list-controls">
                    <button className="add-button" onClick={() => navigate('/employees/new')}>
                        Add Employee
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmployeeListPage