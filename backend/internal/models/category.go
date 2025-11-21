package models

import "time"

type Category struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" binding:"required"`
    Icon      string    `json:"icon"`
    Color     string    `json:"color"`
    Type      string    `json:"type" binding:"required,oneof=income expense"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}