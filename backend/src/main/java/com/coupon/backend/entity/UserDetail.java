package com.coupon.backend.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "userdetail")
public class UserDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fullName")
    private String fullName;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "points")
    private Integer points;

    @Column(name = "totalPointsEarned", columnDefinition = "INTEGER DEFAULT 0")
    private Integer totalPointsEarned = 0;

    @Column(name = "totalPointsSpent", columnDefinition = "INTEGER DEFAULT 0")
    private Integer totalPointsSpent = 0;

    @Column(name = "referalCode")
    private String referalCode;

    @Column(name = "role", columnDefinition = "VARCHAR(255) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'))", nullable = false)
    private String role = "USER";

    @Column(name = "createdAt")
    private Instant createdAt;

    @Column(name = "updatedAt")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (role == null) {
            role = "USER";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Constructors
    public UserDetail() {
    }

    public UserDetail(String fullName, String email, String password) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getPoints(){ return points; }

    public void setPoints(Integer num) { this.points = num; }

    public Integer getTotalPointsEarned() { return totalPointsEarned; }

    public void setTotalPointsEarned(Integer totalPointsEarned) { this.totalPointsEarned = totalPointsEarned; }

    public Integer getTotalPointsSpent() { return totalPointsSpent; }

    public void setTotalPointsSpent(Integer totalPointsSpent) { this.totalPointsSpent = totalPointsSpent; }

    public String getReferalCode() {
        return referalCode;
    }

    public void setReferalCode(String referalCode) {
        this.referalCode = referalCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
