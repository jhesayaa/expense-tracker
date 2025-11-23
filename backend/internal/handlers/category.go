package handlers

import (
	"net/http"

	"expense-tracker/internal/database"
	"expense-tracker/internal/models"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	userID, _ := c.Get("userID")

	var categories []models.Category

	if err := database.DB.Where("user_id IS NULL OR user_id = ?", userID).
		Order("type, name").
		Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	var response []models.CategoryResponse
	for _, category := range categories {
		response = append(response, category.ToResponse())
	}

	c.JSON(http.StatusOK, response)
}

func GetCategory(c *gin.Context) {
	userID, _ := c.Get("userID")
	categoryID := c.Param("id")

	var category models.Category

	if err := database.DB.Where("id = ? AND (user_id IS NULL OR user_id = ?)", categoryID, userID).
		First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, category.ToResponse())
}

func CreateCategory(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input models.CategoryInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDUint := userID.(uint)

	category := models.Category{
		Name:   input.Name,
		Type:   input.Type,
		Icon:   input.Icon,
		UserID: &userIDUint,
	}

	if category.Icon == "" {
		category.Icon = "📦"
	}

	if err := database.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category.ToResponse())
}

func UpdateCategory(c *gin.Context) {
	userID, _ := c.Get("userID")
	categoryID := c.Param("id")

	var category models.Category

	if err := database.DB.Where("id = ? AND user_id = ?", categoryID, userID).
		First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or cannot be updated"})
		return
	}

	var input models.CategoryInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category.Name = input.Name
	category.Type = input.Type
	if input.Icon != "" {
		category.Icon = input.Icon
	}

	if err := database.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, category.ToResponse())
}

func DeleteCategory(c *gin.Context) {
	userID, _ := c.Get("userID")
	categoryID := c.Param("id")

	var category models.Category

	if err := database.DB.Where("id = ? AND user_id = ?", categoryID, userID).
		First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or cannot be deleted"})
		return
	}

	var transactionCount int64
	database.DB.Model(&models.Transaction{}).Where("category_id = ?", categoryID).Count(&transactionCount)

	if transactionCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Cannot delete category that is being used in transactions",
			"message": "Please reassign or delete the transactions first",
		})
		return
	}

	if err := database.DB.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

func GetCategoriesByType(c *gin.Context) {
	userID, _ := c.Get("userID")
	categoryType := c.Query("type")

	if categoryType != "income" && categoryType != "expense" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type. Must be 'income' or 'expense'"})
		return
	}

	var categories []models.Category

	if err := database.DB.Where("(user_id IS NULL OR user_id = ?) AND type = ?", userID, categoryType).
		Order("name").
		Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	var response []models.CategoryResponse
	for _, category := range categories {
		response = append(response, category.ToResponse())
	}

	c.JSON(http.StatusOK, response)
}