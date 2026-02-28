import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEmployees, deleteEmployee } from '../api/employeeApi'
import type { Employee } from '../types'
import EmployeeCard from '../components/EmployeeCard'

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
                setError("Failed to fetch employees")
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
        <div>
            <h1>Employees List</h1>

            <button onClick={() => navigate('/employees/new')}>
                Add Employee
            </button>

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
        </div>
    )
}

export default EmployeeListPage