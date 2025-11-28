package handlers

import (
	"net/http"
	"time"

	"expense-tracker/internal/database"
	"expense-tracker/internal/models"

	"github.com/gin-gonic/gin"
)

func GetTransactions(c *gin.Context) {
	userID, _ := c.Get("userID")

	var filter models.TransactionFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = 10
	}

	query := database.DB.Model(&models.Transaction{}).
		Where("user_id = ?", userID).
		Preload("Category")

	if filter.StartDate != nil {
		query = query.Where("date >= ?", filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("date <= ?", filter.EndDate)
	}
	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}
	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", filter.CategoryID)
	}

	var total int64
	query.Count(&total)

	var transactions []models.Transaction
	offset := (filter.Page - 1) * filter.Limit
	if err := query.Order("date DESC, created_at DESC").
		Limit(filter.Limit).
		Offset(offset).
		Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	var response []models.TransactionResponse
	for _, transaction := range transactions {
		response = append(response, transaction.ToResponse())
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
		"pagination": gin.H{
			"page":       filter.Page,
			"limit":      filter.Limit,
			"total":      total,
			"totalPages": (total + int64(filter.Limit) - 1) / int64(filter.Limit),
		},
	})
}

func GetTransaction(c *gin.Context) {
	userID, _ := c.Get("userID")
	transactionID := c.Param("id")

	var transaction models.Transaction

	if err := database.DB.Where("id = ? AND user_id = ?", transactionID, userID).
		Preload("Category").
		First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, transaction.ToResponse())
}

func CreateTransaction(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input models.TransactionInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var category models.Category
	if err := database.DB.Where("id = ? AND (user_id IS NULL OR user_id = ?)", input.CategoryID, userID).
		First(&category).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		return
	}

	transaction := models.Transaction{
		Amount:      input.Amount,
		Description: input.Description,
		Date:        input.Date,
		Type:        input.Type,
		CategoryID:  input.CategoryID,
		UserID:      userID.(uint),
	}

	if err := database.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	database.DB.Preload("Category").First(&transaction, transaction.ID)

	c.JSON(http.StatusCreated, transaction.ToResponse())
}

func UpdateTransaction(c *gin.Context) {
	userID, _ := c.Get("userID")
	transactionID := c.Param("id")

	var transaction models.Transaction

	if err := database.DB.Where("id = ? AND user_id = ?", transactionID, userID).
		First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	var input models.TransactionInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var category models.Category
	if err := database.DB.Where("id = ? AND (user_id IS NULL OR user_id = ?)", input.CategoryID, userID).
		First(&category).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		return
	}

	transaction.Amount = input.Amount
	transaction.Description = input.Description
	transaction.Date = input.Date
	transaction.Type = input.Type
	transaction.CategoryID = input.CategoryID

	if err := database.DB.Save(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction"})
		return
	}

	database.DB.Preload("Category").First(&transaction, transaction.ID)

	c.JSON(http.StatusOK, transaction.ToResponse())
}

func DeleteTransaction(c *gin.Context) {
	userID, _ := c.Get("userID")
	transactionID := c.Param("id")

	var transaction models.Transaction

	if err := database.DB.Where("id = ? AND user_id = ?", transactionID, userID).
		First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	if err := database.DB.Delete(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

func GetMonthlyReport(c *gin.Context) {
	userID, _ := c.Get("userID")

	yearStr := c.DefaultQuery("year", time.Now().Format("2006"))
	monthStr := c.DefaultQuery("month", time.Now().Format("01"))

	year := yearStr
	month := monthStr

	startDate, _ := time.Parse("2006-01", year+"-"+month)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	var totalIncome float64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND date >= ? AND date <= ?", userID, "income", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalIncome)

	var totalExpense float64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND date >= ? AND date <= ?", userID, "expense", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalExpense)

	var transactionCount int64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND date >= ? AND date <= ?", userID, startDate, endDate).
		Count(&transactionCount)

	type CategoryBreakdown struct {
		CategoryID   uint
		CategoryName string
		CategoryIcon string
		TotalAmount  float64
		Count        int
	}

	var categoryBreakdown []CategoryBreakdown
	database.DB.Model(&models.Transaction{}).
		Select("category_id, categories.name as category_name, categories.icon as category_icon, SUM(amount) as total_amount, COUNT(*) as count").
		Joins("JOIN categories ON categories.id = transactions.category_id").
		Where("transactions.user_id = ? AND transactions.date >= ? AND transactions.date <= ?", userID, startDate, endDate).
		Group("category_id, categories.name, categories.icon").
		Order("total_amount DESC").
		Scan(&categoryBreakdown)

	var categorySum []models.CategorySummary
	for _, cb := range categoryBreakdown {
		percentage := (cb.TotalAmount / (totalIncome + totalExpense)) * 100
		categorySum = append(categorySum, models.CategorySummary{
			CategoryID:   cb.CategoryID,
			CategoryName: cb.CategoryName,
			CategoryIcon: cb.CategoryIcon,
			TotalAmount:  cb.TotalAmount,
			Count:        cb.Count,
			Percentage:   percentage,
		})
	}

	report := models.MonthlyReport{
		Month:            startDate.Format("January 2006"),
		TotalIncome:      totalIncome,
		TotalExpense:     totalExpense,
		Balance:          totalIncome - totalExpense,
		TransactionCount: int(transactionCount),
	}

	c.JSON(http.StatusOK, gin.H{
		"report":             report,
		"categoryBreakdown":  categorySum,
	})
}

func GetDashboardStats(c *gin.Context) {
	userID, _ := c.Get("userID")

	var totalIncome float64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ?", userID, "income").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalIncome)

	var totalExpense float64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ?", userID, "expense").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalExpense)

	var transactionCount int64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ?", userID).
		Count(&transactionCount)

	var recentTransactions []models.Transaction
	database.DB.Where("user_id = ?", userID).
		Preload("Category").
		Order("date DESC, created_at DESC").
		Limit(5).
		Find(&recentTransactions)

	var recentTxResponse []models.TransactionResponse
	for _, tx := range recentTransactions {
		recentTxResponse = append(recentTxResponse, tx.ToResponse())
	}

	type CategoryBreakdown struct {
		CategoryID   uint
		CategoryName string
		CategoryIcon string
		TotalAmount  float64
		Count        int
	}

	var categoryBreakdown []CategoryBreakdown
	database.DB.Model(&models.Transaction{}).
		Select("category_id, categories.name as category_name, categories.icon as category_icon, SUM(amount) as total_amount, COUNT(*) as count").
		Joins("JOIN categories ON categories.id = transactions.category_id").
		Where("transactions.user_id = ?", userID).
		Group("category_id, categories.name, categories.icon").
		Order("total_amount DESC").
		Limit(10).
		Scan(&categoryBreakdown)

	var categorySum []models.CategorySummary
	totalAmount := totalIncome + totalExpense
	for _, cb := range categoryBreakdown {
		percentage := float64(0)
		if totalAmount > 0 {
			percentage = (cb.TotalAmount / totalAmount) * 100
		}
		categorySum = append(categorySum, models.CategorySummary{
			CategoryID:   cb.CategoryID,
			CategoryName: cb.CategoryName,
			CategoryIcon: cb.CategoryIcon,
			TotalAmount:  cb.TotalAmount,
			Count:        cb.Count,
			Percentage:   percentage,
		})
	}

	stats := models.DashboardStats{
		TotalIncome:        totalIncome,
		TotalExpense:       totalExpense,
		Balance:            totalIncome - totalExpense,
		TransactionCount:   int(transactionCount),
		CategoryBreakdown:  categorySum,
		RecentTransactions: recentTxResponse,
	}

	c.JSON(http.StatusOK, stats)
}