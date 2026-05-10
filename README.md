# CpddBlog - Full-Stack Blog Platform

A modern, feature-rich blogging platform built with Node.js and Express, allowing users to create, manage, and discover blog posts. This application implements the MVC architecture with a secure authentication system and cloud-based image storage.

## 🌟 Features

### User Management
- **User Authentication**: Secure registration and login with password hashing (bcrypt)
- **User Profiles**: Customizable user profiles with avatar and cover photos
- **User Ranks**: Display user reputation/experience level
- **Bio Management**: Users can update their profile bio

### Blog Management
- **Create Blogs**: Rich blog creation with title, content, and featured image
- **Edit Blogs**: Users can update their own blog posts
- **Delete Blogs**: Remove unwanted blog posts
- **Blog Categories**: Organize blogs by categories (Technology, Travel, Food & Drink, Health & Wellness, Lifestyle, Business & Finance, Entertainment, Education)
- **Like System**: Users can like/unlike blog posts
- **Search & Filter**: Browse blogs by categories

### General Features
- **Responsive Design**: Mobile-friendly interface
- **Session Management**: Persistent user sessions with MongoDB store
- **Cloud Image Storage**: Cloudinary integration for reliable image hosting
- **Logging**: Morgan HTTP request logger for development

## 🛠️ Tech Stack

**Backend:**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

**Frontend:**
- **EJS** - Templating engine for dynamic views
- **HTML/CSS** - Markup and styling
- **JavaScript** - Client-side scripting

**Additional Technologies:**
- **Bcrypt** - Password encryption
- **JWT** - JSON Web Tokens (for secure communication)
- **Multer** - File upload middleware
- **Cloudinary** - Cloud image storage
- **Express Session** - Session management
- **Connect-Mongo** - MongoDB session store
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variables management
- **Lodash** - Utility library

## 📁 Project Structure

```
CpddBlog/
├── app.js                    # Main application entry point
├── package.json             # Project dependencies
├── index.html              # Static HTML file
├── README.md               # Project documentation
│
├── controllers/            # Application logic
│   ├── blogController.js   # Blog CRUD operations & likes
│   └── userController.js   # User authentication & profile management
│
├── models/                 # Database schemas
│   ├── blog.js            # Blog schema definition
│   └── user.js            # User schema definition
│
├── routes/                 # API route definitions
│   ├── blogRoutes.js      # Blog endpoints
│   └── userRoutes.js      # User endpoints
│
├── views/                  # EJS templates
│   ├── authentication/    # Login/Signup pages
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── blogs/             # Blog-related pages
│   │   ├── create.ejs
│   │   ├── details.ejs
│   │   ├── edit.ejs
│   │   └── index.ejs
│   ├── pages/             # General pages
│   │   ├── 404.ejs
│   │   ├── 500.ejs
│   │   ├── about.ejs
│   │   ├── category.ejs
│   │   └── profile.ejs
│   ├── extras/            # Additional components
│   │   └── corousal.ejs
│   └── partials/          # Reusable components
│       ├── banner.ejs
│       ├── blogListing.ejs
│       ├── categoriesWidget.ejs
│       ├── footer.ejs
│       ├── head.ejs
│       └── nav.ejs
│
└── public/                 # Static assets
    ├── style.css          # Main stylesheet
    ├── assets/            # Images and resources
    └── js/                # Client-side scripts
        ├── login.js       # Login validation
        └── validation.js  # Form validation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image storage)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CpddBlog
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the root directory:**
   ```env
   DATABASE_URL=mongodb://your-mongodb-connection-string
   SESSION_SECRET=your-session-secret-key
   NODE_ENV=development
   
   # Cloudinary configuration
   CLOUDINARY_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Run the application:**

   **Development mode (with auto-reload):**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

The application will start on `http://localhost:3000`

## 🌐 API Routes

### User Routes (`/user`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | User login |
| GET | `/logout` | User logout |
| GET | `/profile/:id` | Get user profile |
| PATCH | `/:id/bio` | Update user bio |
| POST | `/:id/upload-avatar` | Upload user avatar |
| POST | `/:id/upload-cover-image` | Upload cover photo |

### Blog Routes (`/blogs`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Get all blogs |
| GET | `/create` | Display blog creation form |
| POST | `/createpost` | Create a new blog |
| GET | `/:id` | Get blog details |
| GET | `/edit/:id` | Display blog edit form |
| POST | `/edit/:id` | Update a blog |
| DELETE | `/:id` | Delete a blog |
| POST | `/:id/toggle-like` | Like/unlike a blog |
| GET | `/category/:categoryName` | Get blogs by category |

## 🔐 Authentication

The application uses:
- **Session-based authentication** for user state management
- **Password hashing** with bcrypt for secure password storage
- **MongoDB session store** to maintain sessions across server restarts
- **Secure cookies** with HttpOnly and SameSite attributes

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Session
SESSION_SECRET=your-secret-key-here

# Environment
NODE_ENV=development

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📦 Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (not configured yet)
npm test
```

## 🎯 Architecture - MVC Pattern

This project follows the **Model-View-Controller (MVC)** architecture:

- **Models** (`/models`): Define database schemas and structure
- **Views** (`/views`): EJS templates for rendering HTML
- **Controllers** (`/controllers`): Handle business logic and request processing

## 🔄 User Flow

1. User registers or logs in
2. Session is created and stored in MongoDB
3. User can create, edit, and delete blog posts
4. User can like/unlike blogs
5. User can browse blogs by category
6. User can update profile with avatar and bio

## 💾 Database Models

### User Model
- username (unique)
- email (unique)
- password (hashed)
- gender
- avatar
- bio
- rank
- coverPhoto
- createdAt

### Blog Model
- title
- snippet
- body
- author (references User)
- category
- likes (array of user IDs)
- createdAt
- updatedAt

## 📱 Frontend Features

- Responsive navigation bar
- Blog carousel/carousel display
- Category widget for filtering
- User profile pages
- Blog detail views
- Create/Edit forms
- Error pages (404, 500)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the `package.json` file for details.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using Node.js and Express**
