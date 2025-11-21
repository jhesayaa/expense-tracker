package database

import (
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    
    "expense-tracker/internal/models"  
)

var DB *gorm.DB

func InitDB() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
        os.Getenv("DB_PORT"),
    )

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    DB = db
    log.Println("✅ Database connected successfully")

    AutoMigrate()
}

func AutoMigrate() {
    err := DB.AutoMigrate(
        &models.User{},
        &models.Category{},
        &models.Transaction{},
    )
    
    if err != nil {
        log.Fatal("Failed to migrate database:", err)
    }
    
    log.Println("✅ Database migration completed")

    SeedCategories()
}

func SeedCategories() {
    var count int64
    DB.Model(&models.Category{}).Count(&count)
    
    if count == 0 {
        categories := []models.Category{
            {Name: "Food & Dining", Type: "expense", Icon: "🍔", Color: "#FF6B6B"},
            {Name: "Transportation", Type: "expense", Icon: "🚗", Color: "#4ECDC4"},
            {Name: "Shopping", Type: "expense", Icon: "🛍️", Color: "#45B7D1"},
            {Name: "Entertainment", Type: "expense", Icon: "🎮", Color: "#96CEB4"},
            {Name: "Bills & Utilities", Type: "expense", Icon: "📱", Color: "#FFEAA7"},
            {Name: "Healthcare", Type: "expense", Icon: "🏥", Color: "#FD79A8"},
            {Name: "Education", Type: "expense", Icon: "📚", Color: "#A0E7E5"},
            {Name: "Others", Type: "expense", Icon: "📦", Color: "#B2B2B2"},
            {Name: "Salary", Type: "income", Icon: "💰", Color: "#00B894"},
            {Name: "Freelance", Type: "income", Icon: "💼", Color: "#00B894"},
            {Name: "Investment", Type: "income", Icon: "📈", Color: "#00B894"},
            {Name: "Others", Type: "income", Icon: "💵", Color: "#00B894"},
        }
        
        DB.Create(&categories)
        log.Println("✅ Default categories seeded")
    }
}