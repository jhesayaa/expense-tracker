package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Amount      float64   `gorm:"not null;check:amount > 0" json:"amount" binding:"required,gt=0"`
	Description string    `gorm:"not null" json:"description" binding:"required,min=1,max=255"`
	Date        time.Time `gorm:"not null;index" json:"date" binding:"required"`
	Type        string    `gorm:"not null;check:type IN ('income', 'expense')" json:"type" binding:"required,oneof=income expense"`

	UserID     uint `gorm:"index;not null" json:"user_id"`
	CategoryID uint `gorm:"index;not null" json:"category_id" binding:"required"`

	User     *User     `gorm:"foreignKey:UserID" json:"-"`
	Category *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (Transaction) TableName() string {
	return "transactions"
}

type TransactionInput struct {
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Description string    `json:"description" binding:"required,min=1,max=255"`
	Date        time.Time `json:"date" binding:"required"`
	Type        string    `json:"type" binding:"required,oneof=income expense"`
	CategoryID  uint      `json:"category_id" binding:"required"`
}

type TransactionResponse struct {
	ID          uint             `json:"id"`
	Amount      float64          `json:"amount"`
	Description string           `json:"description"`
	Date        time.Time        `json:"date"`
	Type        string           `json:"type"`
	Category    CategoryResponse `json:"category"`
	CreatedAt   time.Time        `json:"created_at"`
}

func (t *Transaction) ToResponse() TransactionResponse {
	categoryResp := CategoryResponse{}
	if t.Category != nil {
		categoryResp = t.Category.ToResponse()
	}

	return TransactionResponse{
		ID:          t.ID,
		Amount:      t.Amount,
		Description: t.Description,
		Date:        t.Date,
		Type:        t.Type,
		Category:    categoryResp,
		CreatedAt:   t.CreatedAt,
	}
}

type TransactionFilter struct {
	StartDate  *time.Time `form:"start_date"`
	EndDate    *time.Time `form:"end_date"`
	Type       string     `form:"type" binding:"omitempty,oneof=income expense"`
	CategoryID *uint      `form:"category_id"`
	Page       int        `form:"page,default=1"`
	Limit      int        `form:"limit,default=10"`
}

type MonthlyReport struct {
	Month            string  `json:"month"`
	TotalIncome      float64 `json:"total_income"`
	TotalExpense     float64 `json:"total_expense"`
	Balance          float64 `json:"balance"`
	TransactionCount int     `json:"transaction_count"`
}

type CategorySummary struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	CategoryIcon string  `json:"category_icon"`
	TotalAmount  float64 `json:"total_amount"`
	Count        int     `json:"count"`
	Percentage   float64 `json:"percentage"`
}

type DashboardStats struct {
	TotalIncome        float64               `json:"total_income"`
	TotalExpense       float64               `json:"total_expense"`
	Balance            float64               `json:"balance"`
	TransactionCount   int                   `json:"transaction_count"`
	CategoryBreakdown  []CategorySummary     `json:"category_breakdown"`
	RecentTransactions []TransactionResponse `json:"recent_transactions"`
}