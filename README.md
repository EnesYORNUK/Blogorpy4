# Blogorpy - Minimalist Blog Website

A sophisticated, minimalist blog website built with modern HTML5, CSS3, and vanilla JavaScript. Features a warm brown color scheme, smooth animations, and a clean, professional design.

## 🌟 Features

### Design & Aesthetics
- **Minimalist UI**: Clean, uncluttered design with sharp edges and ample white space
- **Brown Color Scheme**: Warm, elegant color palette with various brown tones
- **Smooth Animations**: Subtle transitions and scroll-triggered animations
- **Typography**: Modern font hierarchy using Inter and Playfair Display

### Pages
1. **Homepage**
   - Hero section with animated elements
   - Featured blog posts grid
   - About section with animated statistics
   - Smooth parallax effects

2. **Blogs Page**
   - Advanced search functionality
   - Category filtering (Design, Technology, Business, Lifestyle)
   - Load more pagination
   - Newsletter subscription form

3. **Login Page**
   - Clean login form with validation
   - Remember me functionality
   - Social authentication options (Google, GitHub)
   - Password visibility toggle

4. **Signup Page**
   - Multi-field registration form
   - Real-time password strength indicator
   - Password requirements validation
   - Terms of service agreement

### Technical Features
- **Mobile-First Responsive Design**: Fully responsive across all devices
- **Performance Optimized**: Lazy loading images, optimized assets
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Cross-Browser Compatible**: Works on Chrome, Firefox, Safari, Edge
- **Form Validation**: Client-side validation with helpful error messages
- **Smooth Scrolling**: Enhanced user experience with smooth scroll behavior

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- A local web server (optional, but recommended)

### Installation

1. Clone or download the repository:
```bash
git clone https://github.com/yourusername/blogorpy.git
cd blogorpy
```

2. Open with a local server:
   - Using Python: `python -m http.server 8000`
   - Using Node.js: `npx http-server`
   - Or use VS Code's Live Server extension

3. Navigate to `http://localhost:8000` in your browser

### Direct Opening
You can also open `index.html` directly in your browser, though some features may work better with a local server.

## 📁 Project Structure

```
blogorpy/
├── index.html          # Homepage
├── blogs.html          # Blog listing page
├── login.html          # Login page
├── signup.html         # Registration page
├── styles/
│   ├── main.css       # Main stylesheet with CSS variables
│   ├── blogs.css      # Blogs page specific styles
│   └── auth.css       # Authentication pages styles
├── scripts/
│   ├── main.js        # Core functionality and utilities
│   ├── home.js        # Homepage specific JavaScript
│   ├── blogs.js       # Blogs page functionality
│   └── auth.js        # Authentication logic
└── README.md          # This file
```

## 🎨 Color Palette

The website uses a carefully selected brown color scheme:

- **Primary**: `#6B4423` (Dark Brown)
- **Primary Dark**: `#4A2F18` (Darker Brown)
- **Primary Light**: `#8B5A3C` (Light Brown)
- **Accent**: `#CD853F` (Peru)
- **Background**: `#FAF7F3` (Off-white)
- **Text Primary**: `#3C2414` (Very Dark Brown)

## 🛠️ Customization

### Changing Colors
Edit the CSS variables in `styles/main.css`:
```css
:root {
    --color-primary: #6B4423;
    --color-accent: #CD853F;
    /* ... other colors */
}
```

### Adding Blog Posts
Edit the blog data in `scripts/home.js` and `scripts/blogs.js`:
```javascript
const blogPosts = [
    {
        id: 1,
        title: "Your Blog Title",
        excerpt: "Blog excerpt...",
        category: "design",
        // ... other fields
    }
];
```

### Modifying Animations
Adjust animation timings in the CSS files:
```css
--transition-fast: 200ms ease;
--transition-normal: 300ms ease;
--transition-slow: 500ms ease;
```

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ⚡ Performance Tips

1. **Optimize Images**: Use appropriate image formats and sizes
2. **Minify Assets**: Minify CSS and JavaScript files for production
3. **Enable Caching**: Configure server-side caching headers
4. **Use CDN**: Host static assets on a CDN for better performance

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Fonts: [Google Fonts](https://fonts.google.com/) - Inter & Playfair Display
- Images: [Unsplash](https://unsplash.com/) - Stock photography
- Icons: Custom SVG icons

---

Built with ❤️ by a passionate web developer 