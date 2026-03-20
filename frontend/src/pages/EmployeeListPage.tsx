import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEmployees, deleteEmployee } from '../api/employeeApi'
import type { Employee } from '../types'
import EmployeeCard from '../components/EmployeeCard/EmployeeCard'
import './EmployeeListPage.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGroup, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'

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
            toast.success("Employee deleted successfully!")
        } catch (err) {
            toast.error("Failed to delete employee")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="list-page">

            {/* title header */}
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

            {/* main content */}
            <div className="main-container">

                {/* add employee button */}
                <button
                    className="add-button"
                    onClick={() => navigate('/employees/new')}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Add New Employee
                </button>

                {/* employee list section */}
                <div className="employees-section">
                    <div className="employees-section-header">
                        <h2>All Employees</h2>
                        <span className="employee-count">{employees.length}</span>
                    </div>

                    {loading && <p className="loading">Loading...</p>}
                    {error && <p className="error">{error}</p>}

                    <div className="employees-list">
                        {employees.map(employee => (
                            <EmployeeCard
                                key={employee.id}
                                employee={employee}
                                onDelete={handleDelete}
                            />
                        ))}

                        {employees.length === 0 && !loading && (
                            <p className="no-employees">No employees found. Add one!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeListPage