package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name     string `gorm:"not null" json:"name" binding:"required,min=2,max=100"`
	Email    string `gorm:"uniqueIndex;not null" json:"email" binding:"required,email"`
	Password string `gorm:"not null" json:"-" binding:"required,min=6"`

	Categories   []Category    `gorm:"foreignKey:UserID" json:"categories,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:UserID" json:"transactions,omitempty"`
}

func (User) TableName() string {
	return "users"
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
	}
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}