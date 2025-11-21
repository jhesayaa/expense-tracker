# 💰 Expense Tracker

Personal finance tracking application with categories, monthly reports, and expense charts. Built with modern tech stack for learning and portfolio purposes.

## 🚀 Features

- ✅ **Transaction Management** - Add, edit, delete income and expenses
- 📊 **Category System** - Organize transactions by custom categories
- 📈 **Monthly Reports** - View spending patterns and statistics
- 📉 **Interactive Charts** - Visualize expenses with charts
- 📥 **Export Data** - Export to CSV and PDF formats
- 🔐 **User Authentication** - Secure login and registration
- 📱 **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js / Recharts** - Data visualization

### Backend
- **Go (Golang)** - Backend language
- **Gin** - Web framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Database
- **JWT** - Authentication

## 📁 Project Structure

```
expense-tracker/
├── frontend/           # Next.js frontend application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/           # Utils and API calls
├── backend/           # Go backend API
│   ├── cmd/           # Application entry points
│   ├── internal/      # Private application code
│   │   ├── handlers/  # HTTP handlers
│   │   ├── models/    # Data models
│   │   ├── middleware/# Middleware functions
│   │   └── database/  # Database connection
│   └── pkg/           # Public libraries
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend

# Install dependencies
go mod download

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
go run cmd/server/main.go migrate

# Start server
go run cmd/server/main.go
```

Backend will run on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add backend API URL

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/report` - Get monthly report

### Export
- `GET /api/export/csv` - Export to CSV
- `GET /api/export/pdf` - Export to PDF

## 🎯 Development Roadmap

- [x] Project setup and structure
- [ ] Database schema and models
- [ ] Authentication system
- [ ] Category management
- [ ] Transaction CRUD
- [ ] Monthly reports
- [ ] Charts and visualization
- [ ] Export functionality
- [ ] Responsive UI
- [ ] Deployment

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

## 📝 License

MIT License - feel free to use this project for learning purposes.

## 👤 Author

**Jeje**
- GitHub: [@jhesayaa](https://github.com/jhesayaa)
- Location: Semarang, Indonesia

---

⭐ **Star this repo** if you find it helpful for learning!