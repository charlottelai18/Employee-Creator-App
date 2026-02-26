package com.employees.api.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "employees")
@AllArgsConstructor
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    // optional middle name
    @Column(nullable = true)
    private String middleName;

    private String lastName;

    @Email
    @Column(unique = true)
    private String email;

    private String phone;
    private String address;
    private String contractType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String basis;
    private Integer hoursPerWeek;

}