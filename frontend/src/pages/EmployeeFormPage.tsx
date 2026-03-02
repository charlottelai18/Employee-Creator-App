import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { getEmployeeById, createEmployee, updateEmployee } from '../api/employeeApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import './EmployeeFormPage.scss'
import toast from 'react-hot-toast'

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

    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(schema) as any
    })

    const basis = watch('basis')

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
                toast.success("Employee updated successfully!")
            } else {
                await createEmployee(data as any)
                toast.success("Employee created successfully!")
            }
            navigate('/')
        } catch (err: any) {
            if (err.response?.status === 409) {
                toast.error("An employee with this email already exists")
            } else {
                toast.error("Failed to save employee. Please try again.")
            }
        }
    }   

    return (
        <div className="form-page">

            {/* back button header */}
            <div className="form-header">
                <div className="form-header-container">
                    <button
                        className="back-btn"
                        onClick={() => navigate('/')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back
                    </button>
                </div>
            </div>

            <div className="form-container">
                <h1 className="form-title">
                    {isEditMode ? 'Edit Employee' : 'Add Employee'}
                </h1>

                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* personal information */}
                    <div className="form-section">
                        <h2 className="section-title">Personal Information</h2>

                        <div className="form-field">
                            <label>First Name *</label>
                            <input {...register('firstName')} placeholder="John" />
                            {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
                        </div>

                        <div className="form-field">
                            <label>Middle Name (optional)</label>
                            <input {...register('middleName')} placeholder="Michael" />
                        </div>

                        <div className="form-field">
                            <label>Last Name *</label>
                            <input {...register('lastName')} placeholder="Smith" />
                            {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    {/* contact details */}
                    <div className="form-section">
                        <h2 className="section-title">Contact Details</h2>

                        <div className="form-field">
                            <label>Email Address *</label>
                            <input {...register('email')} type="email" placeholder="john.smith@email.com" />
                            {errors.email && <p className="error-message">{errors.email.message}</p>}
                        </div>

                        <div className="form-field">
                            <label>Phone Number *</label>
                            <p className="field-hint">Must be an Australian number</p>
                            <input {...register('phone')} placeholder="0412345678" />
                            {errors.phone && <p className="error-message">{errors.phone.message}</p>}
                        </div>

                        <div className="form-field">
                            <label>Residential Address *</label>
                            <input {...register('address')} placeholder="123 Example St, Sydney NSW 2000" />
                            {errors.address && <p className="error-message">{errors.address.message}</p>}
                        </div>
                    </div>

                    {/* employee status */}
                    <div className="form-section">
                        <h2 className="section-title">Employee Status</h2>

                        <div className="form-field">
                            <label>Contract Type *</label>
                            <select {...register('contractType')}>
                                <option value="">Select contract type</option>
                                <option value="PERMANENT">Permanent</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                            {errors.contractType && <p className="error-message">{errors.contractType.message}</p>}
                        </div>

                        <div className="form-field">
                            <label>Start Date *</label>
                            <input {...register('startDate')} type="date" />
                            {errors.startDate && <p className="error-message">{errors.startDate.message}</p>}
                        </div>

                        <div className="form-field">
                            <label>End Date (optional)</label>
                            <input {...register('endDate')} type="date" />
                            {errors.endDate && <p className="error-message">{errors.endDate.message}</p>}
                        </div>

                        <div className="form-field">
                            <label>Basis *</label>
                            <select {...register('basis')}>
                                <option value="">Select basis</option>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                            </select>
                            {errors.basis && <p className="error-message">{errors.basis.message}</p>}
                        </div>

                        {basis === 'PART_TIME' && (
                            <div className="form-field">
                                <label>Hours Per Week *</label>
                                <input
                                    {...register('hoursPerWeek', { valueAsNumber: true })}
                                    type="number"
                                    placeholder="20"
                                    min="1"
                                    max="40"
                                />
                                {errors.hoursPerWeek && <p className="error-message">{errors.hoursPerWeek.message}</p>}
                            </div>
                        )}
                    </div>

                    {/* buttons */}
                    {submitError && <p className="error-message">{submitError}</p>}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EmployeeFormPage