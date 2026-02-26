package com.employees.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.employees.api.exception.DuplicateEmailException;
import com.employees.api.exception.EmployeeNotFoundException;
import com.employees.api.model.Employee;
import com.employees.api.repository.EmployeeRepository;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return Optional.of(employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id)));
    }

    public Employee createEmployee(Employee employee) {
        if (employeeRepository.findByEmail(employee.getEmail()).isPresent()) {
            throw new DuplicateEmailException(employee.getEmail());
        }
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        existing.setFirstName(updatedEmployee.getFirstName());
        existing.setLastName(updatedEmployee.getLastName());
        existing.setEmail(updatedEmployee.getEmail());
        existing.setPhone(updatedEmployee.getPhone());
        existing.setAddress(updatedEmployee.getAddress());
        existing.setContractType(updatedEmployee.getContractType());
        existing.setStartDate(updatedEmployee.getStartDate());
        existing.setEndDate(updatedEmployee.getEndDate());
        existing.setBasis(updatedEmployee.getBasis());
        existing.setHoursPerWeek(updatedEmployee.getHoursPerWeek());

        // middleName is optional — only update if provided
        if (updatedEmployee.getMiddleName() != null) {
            existing.setMiddleName(updatedEmployee.getMiddleName());
        }

        return employeeRepository.save(existing);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}