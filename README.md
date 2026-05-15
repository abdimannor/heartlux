# Heartlux

A modern, responsive dating and social discovery app. Built on the original design concept but modernized with clean HTML5, contemporary CSS (Flexbox/Grid), and vanilla JavaScript. Heartlux maintains the signature two-column layout and romantic aesthetic while bringing it to 2026 web standards.

## Features

- **Responsive Design** – Works seamlessly on all devices (desktop, tablet, mobile)
- **User Registration** – Create account with email, password, and gender preference
- **Preference Setup** – Configure interests, age range, and connection preferences
- **Smooth Navigation** – Page transitions without full reloads
- **Local Data Storage** – Preferences and profiles stored locally (localStorage)
- **Modern Aesthetic** – Heart-themed color scheme (signature magenta/pink), smooth animations
- **Two-Column Layout** – Inspired by the original design, modernized with CSS Grid
- **Swedish Interface** – Full Swedish localization for user-facing text

## Tech Stack

- **HTML5** – Semantic markup, proper form structure
- **CSS3** – Flexbox, CSS Grid, responsive design, CSS variables for theming
- **JavaScript (Vanilla)** – No frameworks, lightweight and performant
- **Local Storage** – Client-side data persistence

## Project Structure

```
heartlux/
├── index.html              # Main application
├── css/
│   └── style.css          # Modern CSS with heart theme
├── js/
│   └── main.js            # Navigation, form handling, preferences
├── images/                # (Optional) for future avatars/logos
├── README.md              # This file
└── .gitignore             # Git configuration
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/heartlux.git
   cd heartlux
   ```

2. Open in your browser:
   ```bash
   # Direct open
   open index.html

   # Or use a local server (recommended)
   python -m http.server 8000
   npx serve
   ```

3. Visit `http://localhost:8000`

## Usage

### Navigation
- **Home** – Landing page with app introduction
- **Discover** – Setup preferences (interests, age, who to meet)
- **Join** – Create account

### Creating an Account
1. Click "Create Account"
2. Enter username, email, password
3. Select gender identity
4. Submit

### Setting Up Your Profile
1. Go to "Discover"
2. Choose who you'd like to meet (Men, Women, Everyone)
3. Set your age range
4. Select interests (Travel, Music, Fitness, Cooking, Books, Art)
5. Complete profile

## Design Evolution

This project represents an evolution of an earlier dating app concept:
- **Original**: Grid-based layout with two columns, magenta accent color
- **Modern**: Streamlined two-column hero layout, improved responsiveness, modern CSS techniques
- **Result**: A polished, professional app that maintains the original aesthetic while adhering to 2026 web standards

## Color Scheme

- **Primary Heart Color**: `#cc328c` (Magenta/Pink)
- **Dark Heart**: `#a91f6a`
- **Light Heart**: `#e84b9a`
- **Background**: Off-white (`#fff9fb`)
- **Text Dark**: `#2d1b2e`

## Responsive Breakpoints

- **Desktop**: 1200px+ (full grid layout)
- **Tablet**: 768px-1199px (adjusted spacing)
- **Mobile**: < 480px (single column, optimized touch)

## JavaScript Functionality

- Page switching without page reload (SPA-like)
- Form validation (password length, confirmation match)
- Real-time age range display
- LocalStorage integration for user data
- Interactive card selection with visual feedback
- Success animations

## Learning Highlights

This project demonstrates:
- Building on an existing design concept
- Modernizing legacy code patterns (float layouts → CSS Grid)
- Clean, maintainable CSS architecture
- Vanilla JavaScript state management
- Responsive mobile-first design
- Form handling and validation
- Semantic HTML5

## Future Enhancements

- **Backend Integration** – Real user authentication and database
- **Matching Algorithm** – Suggest compatible users
- **Messaging** – Direct messaging between matched users
- **Profiles** – Detailed user profiles with bio and photos
- **Notifications** – Real-time match and message alerts
- **Dark Mode** – Theme toggle
- **PWA** – Installable as mobile app
- **Internationalization** – Multi-language support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

Heartlux demonstrates professional frontend development practices:
- Clear separation of concerns (HTML, CSS, JS)
- Responsive mobile-first approach
- Accessibility-first semantic markup
- Performance optimization (no external dependencies)
- User experience best practices

The app is intentionally simple (no build tools, no frameworks) to showcase core web technologies and clean code principles.

## License

MIT License – Use freely for learning and personal projects.

---

**Built with ❤️ using modern web standards**
