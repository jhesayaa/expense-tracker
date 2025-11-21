package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/joho/godotenv"
    
    "expense-tracker/internal/database"   
    "expense-tracker/internal/handlers"   
    "expense-tracker/internal/middleware"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }
    database.InitDB()

    r := gin.Default()

    config := cors.DefaultConfig()
    config.AllowOrigins = []string{"http://localhost:3000"}
    config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
    config.AllowCredentials = true
    
    r.Use(cors.New(config))

    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status": "OK",
            "message": "Server is running",
            "database": "Connected",
        })
    })

    api := r.Group("/api/v1")
    {
        auth := api.Group("/auth")
        {
            auth.POST("/register", handlers.Register)
            auth.POST("/login", handlers.Login)
        }
        protected := api.Group("/")
        protected.Use(middleware.AuthMiddleware())
        {
            protected.GET("/user/profile", handlers.GetProfile)
            
            protected.GET("/transactions", func(c *gin.Context) {
                c.JSON(200, gin.H{"message": "Get transactions - TODO"})
            })
            protected.POST("/transactions", func(c *gin.Context) {
                c.JSON(200, gin.H{"message": "Create transaction - TODO"})
            })
            
            protected.GET("/categories", func(c *gin.Context) {
                c.JSON(200, gin.H{"message": "Get categories - TODO"})
            })
        }
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("🚀 Server starting on port %s", port)
    log.Println("📝 Available endpoints:")
    log.Println("   POST /api/v1/auth/register")
    log.Println("   POST /api/v1/auth/login")
    log.Println("   GET  /api/v1/user/profile (protected)")
    
    if err := r.Run(":" + port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}