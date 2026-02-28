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
}

export default EmployeeListPage