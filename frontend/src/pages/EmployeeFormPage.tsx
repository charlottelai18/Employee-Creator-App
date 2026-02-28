import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { getEmployeeById, createEmployee, updateEmployee } from '../api/employeeApi'

// 1. zod schema with validation rules
const schema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "Must be less than 50 characters"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required").max(50, "Must be less than 50 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    phone: z.string().min(1, "Phone is required").regex(/^(\+61|0)[0-9]{9}$/, "Please enter a valid Australian phone number"),
    address: z.string().min(1, "Address is required"),
    contractType: z.string().min(1, "Please select a contract type"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    basis: z.string().min(1, "Please select a basis"),
    hoursPerWeek: z.number().min(1).max(40).optional()
}).refine(data => {
    if (data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate)
    }
    return true
}, {
    message: "End date must be after start date",
    path: ["endDate"]
})

type EmployeeFormData = z.infer<typeof schema>

const EmployeeFormPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = Boolean(id)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(schema) as any
    })

    // watch basis field to conditionally show hoursPerWeek
    const basis = watch('basis')

    // if edit mode, fetch employee and pre-fill form
    useEffect(() => {
        if (isEditMode && id) {
            const fetchEmployee = async () => {
                try {
                    const employee = await getEmployeeById(Number(id))
                    reset(employee)
                } catch (err) {
                    console.error("Failed to fetch employee")
                }
            }
            fetchEmployee()
        }
    }, [id])

    const onSubmit = async (data: EmployeeFormData) => {
        try {
            if (isEditMode && id) {
                await updateEmployee(Number(id), data as any)
            } else {
                await createEmployee(data as any)
            }
            navigate('/')
        } catch (err) {
            console.error("Failed to save employee")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h1>{isEditMode ? 'Edit Employee' : 'Add Employee'}</h1>

            {/* personal information */}
            <h2>Personal Information</h2>

            <div>
                <label>First Name *</label>
                <input {...register('firstName')} placeholder="John" />
                {errors.firstName && <p>{errors.firstName.message}</p>}
            </div>

            <div>
                <label>Middle Name (optional)</label>
                <input {...register('middleName')} placeholder="Michael" />
            </div>

            <div>
                <label>Last Name *</label>
                <input {...register('lastName')} placeholder="Smith" />
                {errors.lastName && <p>{errors.lastName.message}</p>}
            </div>

            {/* contact details */}
            <h2>Contact Details</h2>

            <div>
                <label>Email Address *</label>
                <input {...register('email')} type="email" placeholder="john.smith@email.com" />
                {errors.email && <p>{errors.email.message}</p>}
            </div>

            <div>
                <label>Phone Number *</label>
                <p>Must be an Australian number</p>
                <input {...register('phone')} placeholder="0412345678" />
                {errors.phone && <p>{errors.phone.message}</p>}
            </div>

            <div>
                <label>Residential Address *</label>
                <input {...register('address')} placeholder="123 Example St, Sydney NSW 2000" />
                {errors.address && <p>{errors.address.message}</p>}
            </div>

            {/* employee status */}
            <h2>Employee Status</h2>

            <div>
                <label>Contract Type *</label>
                <select {...register('contractType')}>
                    <option value="">Select contract type</option>
                    <option value="PERMANENT">Permanent</option>
                    <option value="CONTRACT">Contract</option>
                </select>
                {errors.contractType && <p>{errors.contractType.message}</p>}
            </div>

            <div>
                <label>Start Date *</label>
                <input {...register('startDate')} type="date" />
                {errors.startDate && <p>{errors.startDate.message}</p>}
            </div>

            <div>
                <label>End Date (optional)</label>
                <input {...register('endDate')} type="date" />
                {errors.endDate && <p>{errors.endDate.message}</p>}
            </div>

            <div>
                <label>Basis *</label>
                <select {...register('basis')}>
                    <option value="">Select basis</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                </select>
                {errors.basis && <p>{errors.basis.message}</p>}
            </div>

            {/* only show hours per week if part time */}
            {basis === 'PART_TIME' && (
                <div>
                    <label>Hours Per Week *</label>
                    <input 
                        {...register('hoursPerWeek')} 
                        type="number" 
                        placeholder="20"
                        min="1"
                        max="40"
                    />
                    {errors.hoursPerWeek && <p>{errors.hoursPerWeek.message}</p>}
                </div>
            )}

            {/* buttons */}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
            </button>
            <button type="button" onClick={() => navigate('/')}>
                Cancel
            </button>
        </form>
    )
}

export default EmployeeFormPage