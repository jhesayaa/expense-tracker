package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name string `gorm:"not null" json:"name" binding:"required,min=2,max=50"`
	Type string `gorm:"not null;check:type IN ('income', 'expense')" json:"type" binding:"required,oneof=income expense"`
	Icon string `gorm:"default:'📦'" json:"icon"`

	// Foreign key - NULL means default/system category
	UserID *uint `gorm:"index" json:"user_id,omitempty"`

	// Relations
	User         *User         `gorm:"foreignKey:UserID" json:"-"`
	Transactions []Transaction `gorm:"foreignKey:CategoryID" json:"transactions,omitempty"`
}

// TableName specifies the table name for Category model
func (Category) TableName() string {
	return "categories"
}

// CategoryInput is the input struct for creating/updating category
type CategoryInput struct {
	Name string `json:"name" binding:"required,min=2,max=50"`
	Type string `json:"type" binding:"required,oneof=income expense"`
	Icon string `json:"icon"`
}

// CategoryResponse is the response struct for category
type CategoryResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Icon      string    `json:"icon"`
	UserID    *uint     `json:"user_id,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// ToResponse converts Category to CategoryResponse
func (c *Category) ToResponse() CategoryResponse {
	return CategoryResponse{
		ID:        c.ID,
		Name:      c.Name,
		Type:      c.Type,
		Icon:      c.Icon,
		UserID:    c.UserID,
		CreatedAt: c.CreatedAt,
	}
}

// CategoryWithStats includes transaction statistics
type CategoryWithStats struct {
	CategoryResponse
	TransactionCount int     `json:"transaction_count"`
	TotalAmount      float64 `json:"total_amount"`
}