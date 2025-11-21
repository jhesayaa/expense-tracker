package main

import (
	"log"

	"expense-tracker/internal/database"
	"expense-tracker/internal/models"

	"gorm.io/gorm"
)

func main() {
	// Connect to database
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("🔄 Starting database migration...")

	// Auto migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Transaction{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("✅ Database migration completed successfully!")

	// Seed default categories
	seedDefaultCategories(db)

	log.Println("🎉 All done!")
}

func seedDefaultCategories(db *gorm.DB) {
	log.Println("🌱 Seeding default categories...")

	defaultCategories := []models.Category{
		{Name: "Food & Dining", Type: "expense", Icon: "🍔", UserID: nil},
		{Name: "Transportation", Type: "expense", Icon: "🚗", UserID: nil},
		{Name: "Shopping", Type: "expense", Icon: "🛍️", UserID: nil},
		{Name: "Entertainment", Type: "expense", Icon: "🎬", UserID: nil},
		{Name: "Bills & Utilities", Type: "expense", Icon: "💡", UserID: nil},
		{Name: "Healthcare", Type: "expense", Icon: "🏥", UserID: nil},
		{Name: "Education", Type: "expense", Icon: "📚", UserID: nil},
		{Name: "Salary", Type: "income", Icon: "💰", UserID: nil},
		{Name: "Freelance", Type: "income", Icon: "💼", UserID: nil},
		{Name: "Investment", Type: "income", Icon: "📈", UserID: nil},
		{Name: "Gift", Type: "income", Icon: "🎁", UserID: nil},
		{Name: "Other Income", Type: "income", Icon: "💵", UserID: nil},
		{Name: "Other Expense", Type: "expense", Icon: "📦", UserID: nil},
	}

	for _, category := range defaultCategories {
		var exists models.Category
		result := db.Where("name = ? AND user_id IS NULL", category.Name).First(&exists)

		if result.Error != nil {
			// Category doesn't exist, create it
			if err := db.Create(&category).Error; err != nil {
				log.Printf("❌ Failed to seed category %s: %v", category.Name, err)
			} else {
				log.Printf("✅ Seeded category: %s %s", category.Icon, category.Name)
			}
		} else {
			log.Printf("⏭️  Category already exists: %s", category.Name)
		}
	}

	log.Println("✅ Default categories seeded successfully!")
}