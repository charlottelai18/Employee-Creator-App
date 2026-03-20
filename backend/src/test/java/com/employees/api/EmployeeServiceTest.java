package com.employees.api;

import com.employees.api.exception.DuplicateEmailException;
import com.employees.api.exception.EmployeeNotFoundException;
import com.employees.api.model.Employee;
import com.employees.api.repository.EmployeeRepository;
import com.employees.api.service.EmployeeService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee(
                1L,
                "John",
                null,
                "Smith",
                "john.smith@email.com",
                "0412345678",
                "123 Example St, Sydney NSW 2000",
                "PERMANENT",
                LocalDate.of(2023, 1, 1),
                null,
                "FULL_TIME",
                null);
    }

    // ─── getAllEmployees ───────────────────────────────────────────────────────

    @Test
    void getAllEmployees_returnsListOfEmployees() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee));

        List<Employee> result = employeeService.getAllEmployees();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("john.smith@email.com");
    }

    @Test
    void getAllEmployees_returnsEmptyList_whenNoEmployees() {
        when(employeeRepository.findAll()).thenReturn(List.of());

        List<Employee> result = employeeService.getAllEmployees();

        assertThat(result).isEmpty();
    }

    // ─── getEmployeeById ──────────────────────────────────────────────────────

    @Test
    void getEmployeeById_returnsEmployee_whenFound() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        Optional<Employee> result = employeeService.getEmployeeById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getFirstName()).isEqualTo("John");
    }

    @Test
    void getEmployeeById_throwsEmployeeNotFoundException_whenNotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getEmployeeById(99L))
                .isInstanceOf(EmployeeNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ─── createEmployee ───────────────────────────────────────────────────────

    @Test
    void createEmployee_savesAndReturnsEmployee_whenEmailIsUnique() {
        when(employeeRepository.findByEmail("john.smith@email.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        Employee result = employeeService.createEmployee(employee);

        assertThat(result.getEmail()).isEqualTo("john.smith@email.com");
        verify(employeeRepository, times(1)).save(employee);
    }

    @Test
    void createEmployee_throwsDuplicateEmailException_whenEmailAlreadyExists() {
        when(employeeRepository.findByEmail("john.smith@email.com")).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> employeeService.createEmployee(employee))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("john.smith@email.com");

        verify(employeeRepository, never()).save(any());
    }

    // ─── updateEmployee ───────────────────────────────────────────────────────

    @Test
    void updateEmployee_updatesAndReturnsEmployee_whenFound() {
        Employee updated = new Employee(
                1L,
                "Jane",
                null,
                "Doe",
                "jane.doe@email.com",
                "0498765432",
                "456 New St, Melbourne VIC 3000",
                "CONTRACT",
                LocalDate.of(2024, 6, 1),
                LocalDate.of(2025, 6, 1),
                "PART_TIME",
                20);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(updated);

        Employee result = employeeService.updateEmployee(1L, updated);

        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getEmail()).isEqualTo("jane.doe@email.com");
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void updateEmployee_throwsEmployeeNotFoundException_whenNotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.updateEmployee(99L, employee))
                .isInstanceOf(EmployeeNotFoundException.class)
                .hasMessageContaining("99");

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void updateEmployee_doesNotOverwriteMiddleName_whenUpdatedMiddleNameIsNull() {
        employee.setMiddleName("Michael");

        Employee updatedWithoutMiddleName = new Employee(
                1L, "John", null, "Smith", "john.smith@email.com",
                "0412345678", "123 Example St", "PERMANENT",
                LocalDate.of(2023, 1, 1), null, "FULL_TIME", null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(i -> i.getArgument(0));

        Employee result = employeeService.updateEmployee(1L, updatedWithoutMiddleName);

        assertThat(result.getMiddleName()).isEqualTo("Michael");
    }

    // ─── deleteEmployee ───────────────────────────────────────────────────────

    @Test
    void deleteEmployee_callsDeleteById() {
        doNothing().when(employeeRepository).deleteById(1L);

        employeeService.deleteEmployee(1L);

        verify(employeeRepository, times(1)).deleteById(1L);
    }
}