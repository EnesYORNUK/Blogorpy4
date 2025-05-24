# Blogorpy - Minimalist Blog Platform 📝

A sophisticated, minimalist blog website built with vanilla HTML, CSS, and JavaScript, featuring real-time authentication and modern design principles.

## ✨ Features

- **🎨 Minimalist Design** - Clean brown color palette with smooth animations
- **🔐 Real Authentication** - Powered by Supabase for secure user management
- **📱 Fully Responsive** - Works seamlessly on all devices
- **🔍 Search & Filter** - Advanced post filtering and search functionality  
- **✍️ Rich Text Editor** - Create and edit blog posts with formatting
- **🚀 Fast Performance** - Optimized for speed and accessibility
- **⚡ Live Deployment** - Deployed on Vercel for optimal performance

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel
- **Fonts**: Google Fonts (Inter, Playfair Display)

## 📄 Pages

1. **Homepage** (`index.html`) - Hero section, featured posts, about section
2. **Blogs** (`blogs.html`) - All blog posts with search and filtering
3. **Login** (`login.html`) - User authentication with social login options
4. **Signup** (`signup.html`) - User registration with password strength indicator
5. **Profile** (`profile.html`) - User dashboard and account management
6. **Create Blog** (`create-blog.html`) - Rich text editor for creating posts

## 🎨 Design System

### Color Palette
- **Primary**: `#6B4423` (Rich Brown)
- **Accent**: `#CD853F` (Peru)
- **Secondary**: `#8B4513` (Saddle Brown)
- **Background**: `#FAF7F0` (Warm White)
- **Text**: `#2C1810` (Dark Brown)

### Typography
- **Headings**: Playfair Display (Elegant serif)
- **Body**: Inter (Modern sans-serif)

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- Supabase account (for authentication)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blogorpy
   ```

2. **Serve locally**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Vercel Deployment

1. **Connect to Vercel**
   - Push code to GitHub/GitLab
   - Connect repository to Vercel
   - Auto-deploy on every push

2. **Configure Supabase**
   - Add your domain to Supabase Auth settings
   - Update redirect URLs in Supabase dashboard

## 🔧 Configuration

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get project URL and anon key

2. **Update Configuration**
   ```javascript
   // In scripts/config.js
   supabase: {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   }
   ```

3. **Authentication Settings**
   - Enable email confirmations
   - Add your domain to allowed URLs
   - Configure redirect URLs

## 📁 Project Structure

```
blogorpy/
├── index.html                 # Homepage
├── login.html                 # Login page
├── signup.html                # Registration page
├── blogs.html                 # Blog listing page
├── profile.html               # User profile
├── create-blog.html           # Blog editor
├── styles/
│   ├── main.css              # Global styles
│   └── auth.css              # Authentication styles
├── scripts/
│   ├── config.js             # App configuration
│   ├── supabase.js           # Supabase client
│   ├── auth.js               # Authentication logic
│   ├── main.js               # Global JavaScript
│   ├── home.js               # Homepage logic
│   ├── blogs.js              # Blog listing logic
│   ├── profile.js            # Profile management
│   └── create-blog.js        # Blog editor logic
└── README.md                 # This file
```

## 🔐 Authentication Features

- ✅ Email/Password registration and login
- ✅ Social authentication (Google, GitHub)
- ✅ Email verification
- ✅ Password strength validation
- ✅ Session management
- ✅ Protected routes
- ✅ User profile management

## 📱 Responsive Design

- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Optimized layout with collapsible menus
- **Mobile**: Touch-friendly interface with hamburger menu

## 🎯 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend and authentication
- **Vercel** - Hosting and deployment
- **Google Fonts** - Typography
- **Inspiration** - Modern minimalist design principles

---

**Live Demo**: [Your Vercel URL]

For questions or support, please open an issue on GitHub. 