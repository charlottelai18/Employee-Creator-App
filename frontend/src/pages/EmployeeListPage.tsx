import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEmployees, deleteEmployee } from '../api/employeeApi'
import type { Employee } from '../types'

const EmployeeListPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchEmployees = async() => {
            try {
                setLoading(true)
                const data = await getAllEmployees();
                setEmployees(data);
            } catch (err){
                setError("Failed to Fetch Employees");
            } finally {
                setLoading(false);
            }
        }
        fetchEmployees();
    }, [])

    // handle delete
    const handleDelete = async (id: number) => {
        try {
            setLoading(true)
            await deleteEmployee(id);
            setEmployees(employees.filter(emp => emp.id !== id))
        } catch (err){
            setError("Failed to delete Employee");
        } finally{
            setLoading(false);
        }
    
    }

    const getContractSummary = (employee: Employee): string => {
        const start = new Date(employee.startDate)
        const end = employee.endDate ? new Date(employee.endDate) : new Date()
        const years = Math.floor((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const type = employee.contractType === 'PERMANENT' ? 'Permanent' : 'Contract'
        return `${type} - ${years}yrs`
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
            <div key={employee.id}>
                <p>{employee.firstName} {employee.lastName}</p>
                <p>{getContractSummary(employee)}</p>
                <p>{employee.email}</p>

                <button onClick={() => navigate(`/employees/${employee.id}/edit`)}>
                    Edit
                </button>
                <button onClick={() => handleDelete(employee.id)}>
                    Remove
                </button>
            </div>
        ))}

        {employees.length === 0 && !loading && (
            <p>No employees found. Add one!</p>
        )}
    </div>
)
}

export default EmployeeListPage