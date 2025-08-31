# Recipe Finder App

A modern, responsive recipe finder application built with vanilla JavaScript, HTML, and CSS. Search for recipes, save favorites, and discover new dishes!

## Features

### 🔍 Search & Discovery
- Search recipes by name
- Browse popular recipes on homepage
- Real-time search results

### 🎨 Modern UI/UX
- Clean, intuitive interface
- Responsive design for all devices
- Smooth animations and transitions
- Loading states and error handling

### 📱 Core Functionality
- **Recipe Search**: Find recipes by keywords
- **Detailed View**: Click any recipe for full details including:
  - Ingredients list
  - Step-by-step instructions
  - Cooking time and servings
  - Nutritional information
- **Favorites**: Save recipes locally for quick access
- **Filters**: Filter by cuisine type (Italian, Asian, Mexican, etc.)
- **Sorting**: Sort results by relevance, cooking time, or calories

### 🛠️ Technical Features
- Uses TheMealDB API (free, no authentication required)
- Local storage for favorites
- No framework dependencies - pure vanilla JavaScript
- Mobile-first responsive design

## API Information

This app uses [TheMealDB API](https://www.themealdb.com/api.php), which is:
- Free to use
- No API key required
- Provides comprehensive recipe data
- Includes recipe images

## File Structure

```
recipe-finder/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── script.js       # JavaScript functionality
└── README.md       # Documentation
```

## Customization Guide

### 1. **Change Color Scheme**
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #ff6b6b;      /* Main brand color */
    --secondary-color: #4ecdc4;     /* Accent color */
    --dark: #2d3436;               /* Text color */
    /* ... other colors */
}
```

### 2. **Add More Recipe APIs**
To use different APIs (like Spoonacular or Edamam):
1. Update the `API_BASE_URL` in `script.js`
2. Modify the `transformMealData()` function to match the new API response format
3. Update the search and filter methods

### 3. **Add New Features**
Ideas for enhancements:
- User accounts and cloud sync
- Meal planning calendar
- Shopping list generator
- Recipe ratings and reviews
- Share recipes on social media
- Print-friendly recipe cards

### 4. **Modify Categories**
To change filter categories, update:
- HTML: Filter buttons in `index.html`
- CSS: Styling for new categories
- JS: Filter logic in `toggleFilterChip()` function

## Deployment

### GitHub Pages
1. Add to your portfolio repository
2. Enable GitHub Pages in repository settings
3. Access at: `https://[username].github.io/recipe-finder/`

### Standalone Deployment
1. Upload all files to any web server
2. No build process required
3. Works with any static hosting service

## Performance Optimization

The app includes several performance features:
- Lazy loading of images
- Debounced search input
- Pagination for large result sets
- Efficient DOM manipulation
- Cached favorites in localStorage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Enhancements

Consider adding:
1. **PWA Support**: Make it installable
2. **Offline Mode**: Cache recipes for offline viewing
3. **Advanced Search**: Search by ingredients, nutrients
4. **User Contributions**: Allow users to submit recipes
5. **Internationalization**: Multi-language support

## Credits

- Icons: [Font Awesome](https://fontawesome.com/)
- Fonts: [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- API: [TheMealDB](https://www.themealdb.com/)

## License

This project is open source and available for use in your portfolio.