// Recipe Finder App
const app = {
    // API Configuration
    // Using TheMealDB API (free, no key required)
    API_BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
    
    // App State
    state: {
        currentView: 'search',
        searchQuery: '',
        recipes: [],
        favorites: JSON.parse(localStorage.getItem('favoriteRecipes')) || [],
        currentPage: 1,
        loading: false,
        filters: {
            diet: null,
            cuisine: null,
            time: null,
            meal: null,
            difficulty: null
        }
    },

    // Initialize App
    init() {
        this.cacheDom();
        this.bindEvents();
        this.loadFavorites();
        this.loadPopularRecipes();
        this.updateFavoritesCount();
    },

    // Cache DOM Elements
    cacheDom() {
        // Navigation
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.views = document.querySelectorAll('.view');
        
        // Search Elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        
        // Filter Elements
        this.filterChips = document.querySelectorAll('.filter-chip');
        this.toggleFiltersBtn = document.querySelector('.toggle-filters');
        this.advancedFilters = document.querySelector('.advanced-filters');
        this.clearFiltersBtn = document.querySelector('.clear-filters');
        this.timeFilter = document.getElementById('time-filter');
        this.mealFilter = document.getElementById('meal-filter');
        this.difficultyFilter = document.getElementById('difficulty-filter');
        
        // Results Elements
        this.resultsTitle = document.getElementById('results-title');
        this.recipesGrid = document.getElementById('recipes-grid');
        this.favoritesGrid = document.getElementById('favorites-grid');
        this.loadMoreBtn = document.getElementById('load-more');
        this.loadMoreContainer = document.getElementById('load-more-container');
        
        // State Elements
        this.loadingContainer = document.getElementById('loading');
        this.errorContainer = document.getElementById('error');
        this.emptyContainer = document.getElementById('empty');
        this.emptyFavorites = document.getElementById('empty-favorites');
        
        // Modal Elements
        this.modal = document.getElementById('recipe-modal');
        this.modalBody = document.getElementById('modal-body');
        this.modalClose = document.getElementById('modal-close');
        
        // Other Elements
        this.backToTopBtn = document.getElementById('back-to-top');
        this.favoritesCount = document.querySelector('.favorites-count');
        this.sortSelect = document.getElementById('sort-select');
    },

    // Bind Events
    bindEvents() {
        // Navigation
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });
        
        // Search
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Filters
        this.filterChips.forEach(chip => {
            chip.addEventListener('click', () => this.toggleFilterChip(chip));
        });
        
        this.toggleFiltersBtn.addEventListener('click', () => {
            this.toggleFiltersBtn.classList.toggle('active');
            this.advancedFilters.classList.toggle('show');
        });
        
        this.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        
        // Advanced Filters
        [this.timeFilter, this.mealFilter, this.difficultyFilter].forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });
        
        // Sort
        this.sortSelect.addEventListener('change', () => this.sortRecipes());
        
        // Load More
        this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        
        // Modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Back to Top
        window.addEventListener('scroll', () => {
            this.backToTopBtn.classList.toggle('show', window.scrollY > 300);
        });
        
        this.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    // View Management
    switchView(viewName) {
        this.state.currentView = viewName;
        
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        this.views.forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });
        
        if (viewName === 'favorites') {
            this.displayFavorites();
        }
    },

    // Search Functionality
    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        
        this.state.searchQuery = query;
        this.state.currentPage = 1;
        this.state.recipes = [];
        
        await this.searchRecipes(query);
    },

    async searchRecipes(query) {
        this.showLoading();
        
        try {
            // Search by name
            const response = await fetch(`${this.API_BASE_URL}/search.php?s=${query}`);
            const data = await response.json();
            
            if (data.meals) {
                this.state.recipes = this.transformMealData(data.meals);
                this.resultsTitle.textContent = `Results for "${query}"`;
                this.displayRecipes();
            } else {
                this.showEmpty();
            }
        } catch (error) {
            this.showError('Failed to search recipes. Please try again.');
        }
    },

    async loadPopularRecipes() {
        this.showLoading();
        
        try {
            // Load random recipes for popular section
            const promises = [];
            for (let i = 0; i < 9; i++) {
                promises.push(fetch(`${this.API_BASE_URL}/random.php`).then(r => r.json()));
            }
            
            const results = await Promise.all(promises);
            const meals = results.map(r => r.meals[0]).filter(Boolean);
            
            this.state.recipes = this.transformMealData(meals);
            this.displayRecipes();
        } catch (error) {
            this.showError('Failed to load recipes. Please try again.');
        }
    },

    // Transform API Data
    transformMealData(meals) {
        return meals.map(meal => ({
            id: meal.idMeal,
            title: meal.strMeal,
            image: meal.strMealThumb,
            category: meal.strCategory,
            cuisine: meal.strArea,
            description: this.getShortDescription(meal),
            instructions: meal.strInstructions,
            ingredients: this.extractIngredients(meal),
            tags: this.extractTags(meal),
            video: meal.strYoutube,
            time: this.estimateCookingTime(meal),
            difficulty: this.estimateDifficulty(meal),
            calories: Math.floor(Math.random() * 300) + 200, // Mock data
            servings: Math.floor(Math.random() * 4) + 2 // Mock data
        }));
    },

    extractIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    ingredient: ingredient.trim(),
                    measure: measure ? measure.trim() : ''
                });
            }
        }
        return ingredients;
    },

    extractTags(meal) {
        const tags = [];
        if (meal.strCategory) tags.push(meal.strCategory);
        if (meal.strArea) tags.push(meal.strArea);
        if (meal.strTags) {
            tags.push(...meal.strTags.split(',').map(tag => tag.trim()));
        }
        return tags;
    },

    getShortDescription(meal) {
        const instructions = meal.strInstructions || '';
        return instructions.split('.')[0] + '.';
    },

    estimateCookingTime(meal) {
        const instructionLength = (meal.strInstructions || '').length;
        if (instructionLength < 500) return 15;
        if (instructionLength < 1000) return 30;
        if (instructionLength < 1500) return 45;
        return 60;
    },

    estimateDifficulty(meal) {
        const ingredientCount = this.extractIngredients(meal).length;
        if (ingredientCount < 5) return 'easy';
        if (ingredientCount < 10) return 'medium';
        return 'hard';
    },

    // Display Functions
    displayRecipes() {
        this.hideAllStates();
        
        if (this.state.recipes.length === 0) {
            this.showEmpty();
            return;
        }
        
        this.recipesGrid.innerHTML = '';
        
        const recipesToShow = this.state.recipes.slice(0, this.state.currentPage * 9);
        recipesToShow.forEach(recipe => {
            this.recipesGrid.appendChild(this.createRecipeCard(recipe));
        });
        
        // Show/hide load more button
        if (this.state.recipes.length > recipesToShow.length) {
            this.loadMoreContainer.classList.add('show');
        } else {
            this.loadMoreContainer.classList.remove('show');
        }
    },

    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const isFavorite = this.state.favorites.some(fav => fav.id === recipe.id);
        
        card.innerHTML = `
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <button class="recipe-favorite ${isFavorite ? 'active' : ''}" data-id="${recipe.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.time} min</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                    <span><i class="fas fa-fire"></i> ${recipe.calories} cal</span>
                </div>
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-tags">
                    ${recipe.tags.slice(0, 3).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.recipe-favorite')) {
                this.showRecipeDetail(recipe);
            }
        });
        
        const favoriteBtn = card.querySelector('.recipe-favorite');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(recipe);
            favoriteBtn.classList.toggle('active');
        });
        
        return card;
    },

    // Recipe Detail Modal
    showRecipeDetail(recipe) {
        this.modalBody.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-detail-image">
            <div class="recipe-detail-content">
                <div class="recipe-detail-header">
                    <h2 class="recipe-detail-title">${recipe.title}</h2>
                    <div class="recipe-detail-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.time} minutes</span>
                        <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                        <span><i class="fas fa-fire"></i> ${recipe.calories} calories</span>
                        <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-detail-tags">
                        ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="recipe-detail-section">
                    <h3><i class="fas fa-list"></i> Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li>${ing.measure} ${ing.ingredient}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="recipe-detail-section">
                    <h3><i class="fas fa-tasks"></i> Instructions</h3>
                    <ol class="instructions-list">
                        ${recipe.instructions.split('\r\n').filter(step => step.trim()).map(step => `
                            <li>${step}</li>
                        `).join('')}
                    </ol>
                </div>
                
                <div class="recipe-detail-section">
                    <h3><i class="fas fa-chart-pie"></i> Nutrition</h3>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <span class="nutrition-value">${recipe.calories}</span>
                            <span class="nutrition-label">Calories</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-value">${Math.floor(Math.random() * 30) + 10}g</span>
                            <span class="nutrition-label">Protein</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-value">${Math.floor(Math.random() * 40) + 20}g</span>
                            <span class="nutrition-label">Carbs</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-value">${Math.floor(Math.random() * 20) + 5}g</span>
                            <span class="nutrition-label">Fat</span>
                        </div>
                    </div>
                </div>
                
                ${recipe.video ? `
                <div class="recipe-detail-section">
                    <h3><i class="fas fa-video"></i> Video Tutorial</h3>
                    <a href="${recipe.video}" target="_blank" class="btn btn-primary">
                        <i class="fab fa-youtube"></i> Watch on YouTube
                    </a>
                </div>
                ` : ''}
            </div>
        `;
        
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    },

    // Filter Functions
    toggleFilterChip(chip) {
        chip.classList.toggle('active');
        
        const filterType = chip.dataset.diet ? 'diet' : 'cuisine';
        const filterValue = chip.dataset[filterType];
        
        if (chip.classList.contains('active')) {
            // Deactivate other chips in the same category
            this.filterChips.forEach(otherChip => {
                if (otherChip !== chip && otherChip.dataset[filterType]) {
                    otherChip.classList.remove('active');
                }
            });
            
            this.state.filters[filterType] = filterValue;
        } else {
            this.state.filters[filterType] = null;
        }
        
        this.applyFilters();
    },

    async applyFilters() {
        // Get filter values
        this.state.filters.time = this.timeFilter.value || null;
        this.state.filters.meal = this.mealFilter.value || null;
        this.state.filters.difficulty = this.difficultyFilter.value || null;
        
        // For demonstration, we'll search by category or area if filters are applied
        if (this.state.filters.cuisine) {
            this.showLoading();
            try {
                const response = await fetch(`${this.API_BASE_URL}/filter.php?a=${this.state.filters.cuisine}`);
                const data = await response.json();
                
                if (data.meals) {
                    // Get full details for each meal
                    const detailPromises = data.meals.slice(0, 9).map(meal => 
                        fetch(`${this.API_BASE_URL}/lookup.php?i=${meal.idMeal}`).then(r => r.json())
                    );
                    
                    const details = await Promise.all(detailPromises);
                    const fullMeals = details.map(d => d.meals[0]).filter(Boolean);
                    
                    this.state.recipes = this.transformMealData(fullMeals);
                    this.displayRecipes();
                } else {
                    this.showEmpty();
                }
            } catch (error) {
                this.showError('Failed to apply filters. Please try again.');
            }
        } else if (this.state.searchQuery) {
            this.searchRecipes(this.state.searchQuery);
        } else {
            this.loadPopularRecipes();
        }
    },

    clearAllFilters() {
        // Clear filter chips
        this.filterChips.forEach(chip => chip.classList.remove('active'));
        
        // Clear advanced filters
        this.timeFilter.value = '';
        this.mealFilter.value = '';
        this.difficultyFilter.value = '';
        
        // Reset state
        this.state.filters = {
            diet: null,
            cuisine: null,
            time: null,
            meal: null,
            difficulty: null
        };
        
        // Reload recipes
        if (this.state.searchQuery) {
            this.searchRecipes(this.state.searchQuery);
        } else {
            this.loadPopularRecipes();
        }
    },

    // Sort Recipes
    sortRecipes() {
        const sortBy = this.sortSelect.value;
        
        switch (sortBy) {
            case 'time':
                this.state.recipes.sort((a, b) => a.time - b.time);
                break;
            case 'rating':
                // Mock rating sort
                this.state.recipes.sort(() => Math.random() - 0.5);
                break;
            case 'calories':
                this.state.recipes.sort((a, b) => a.calories - b.calories);
                break;
            default:
                // Relevance - keep original order
                break;
        }
        
        this.displayRecipes();
    },

    // Load More
    loadMore() {
        this.state.currentPage++;
        this.displayRecipes();
    },

    // Favorites Management
    toggleFavorite(recipe) {
        const index = this.state.favorites.findIndex(fav => fav.id === recipe.id);
        
        if (index === -1) {
            this.state.favorites.push(recipe);
            this.showNotification('Recipe added to favorites!');
        } else {
            this.state.favorites.splice(index, 1);
            this.showNotification('Recipe removed from favorites.');
        }
        
        this.saveFavorites();
        this.updateFavoritesCount();
        
        if (this.state.currentView === 'favorites') {
            this.displayFavorites();
        }
    },

    saveFavorites() {
        localStorage.setItem('favoriteRecipes', JSON.stringify(this.state.favorites));
    },

    loadFavorites() {
        this.state.favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    },

    updateFavoritesCount() {
        const count = this.state.favorites.length;
        this.favoritesCount.textContent = count;
        this.favoritesCount.classList.toggle('show', count > 0);
    },

    displayFavorites() {
        this.favoritesGrid.innerHTML = '';
        
        if (this.state.favorites.length === 0) {
            this.emptyFavorites.classList.add('show');
        } else {
            this.emptyFavorites.classList.remove('show');
            this.state.favorites.forEach(recipe => {
                this.favoritesGrid.appendChild(this.createRecipeCard(recipe));
            });
        }
    },

    // UI State Management
    showLoading() {
        this.hideAllStates();
        this.loadingContainer.classList.add('show');
    },

    showError(message) {
        this.hideAllStates();
        document.getElementById('error-message').textContent = message;
        this.errorContainer.classList.add('show');
    },

    showEmpty() {
        this.hideAllStates();
        this.emptyContainer.classList.add('show');
    },

    hideAllStates() {
        this.loadingContainer.classList.remove('show');
        this.errorContainer.classList.remove('show');
        this.emptyContainer.classList.remove('show');
        this.loadMoreContainer.classList.remove('show');
    },

    // Notifications
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: var(--success-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Global function for retry button
function retrySearch() {
    if (app.state.searchQuery) {
        app.searchRecipes(app.state.searchQuery);
    } else {
        app.loadPopularRecipes();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});