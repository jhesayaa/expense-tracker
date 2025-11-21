package models

import "time"

type Transaction struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    UserID      uint      `json:"user_id"`
    CategoryID  uint      `json:"category_id"`
    Amount      float64   `json:"amount" binding:"required,min=0"`
    Type        string    `json:"type" binding:"required,oneof=income expense"`
    Description string    `json:"description"`
    Date        time.Time `json:"date" binding:"required"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`

    // Relations
    User     User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
    Category Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
}