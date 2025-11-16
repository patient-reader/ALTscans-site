// search-browse.js - Search functionality for ALTscans using browse.html

/**
 * Handles the search form submission and redirects to the browse page with search parameter
 * @param {Event} event - The form submission event
 */
function handleSearchSubmit(event) {
    // With the form now using proper action and method, we only need to:
    // 1. Block empty searches
    // 2. Let the form submit naturally for non-empty searches
    
    const searchInput = document.querySelector('.search-bar input') || document.querySelector('.search-input');
    if (!searchInput) return true;

    const searchQuery = searchInput.value.trim();
    
    if (searchQuery.length === 0) {
        // Block empty searches
        if (event) {
            event.preventDefault();
        }
        searchInput.focus();
        return false;
    }
    
    // Let the form handle the submission naturally
    return true;
}

/**
 * Initialize the search functionality when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-bar') || document.getElementById('search-form');
    const searchInput = document.querySelector('.search-bar input') || document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-bar button') || document.getElementById('search-button');
    
    if (searchForm && searchInput) {
        console.log('Search form found, initializing search functionality');
        
        // Handle form submission (Enter key)
        if (!searchForm.hasSearchListeners) {
            searchForm.addEventListener('submit', function(e) {
                // Only prevent default for empty searches
                return handleSearchSubmit(e);
            });
            
            // We don't need a click handler for the button
            // as it will naturally submit the form
            
            // Mark that we've added listeners to avoid duplicates
            searchForm.hasSearchListeners = true;
        }
        
        // Add keyboard shortcut (Ctrl+K or Cmd+K on Mac)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            
            // ESC key to clear search
            if (e.key === 'Escape') {
                if (document.activeElement === searchInput) {
                    searchInput.value = '';
                    searchInput.blur();
                }
            }
        });
    } else {
        console.warn('Search form not found in the DOM');
    }
    
    // If on the browse page, check for search para in already bullshit URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery && window.location.pathname.includes('/routes/browse')) {
        // Set the search input value to the query
        if (searchInput) {
            searchInput.value = searchQuery;
        }
        
        // Update page title to indicate search
        document.title = `Search: ${searchQuery} - ALTscans`;
        
        // If there's a header on the page, update it
        const pageHeader = document.querySelector('main h2');
        if (pageHeader) {
            pageHeader.textContent = `Search Results: "${searchQuery}"`;
        }
    }
});

// If we're using the header.html inclusion pattern, we need to initialize search
// after the header is loaded
if (document.getElementById('header-content')) {
    console.log('Header content element found, setting up mutation observer');
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if our search elements have been added
                const searchForm = document.querySelector('.search-bar') || document.getElementById('search-form');
                const searchInput = document.querySelector('.search-bar input') || document.querySelector('.search-input');
                const searchButton = document.querySelector('.search-bar button') || document.getElementById('search-button');
                
                if (searchForm && searchInput && !searchForm.hasSearchListeners) {
                    console.log('Search form loaded via header.html, attaching event listeners');
                    
                    // Handle form submission (Enter key)
                    searchForm.addEventListener('submit', function(e) {
                        // Only prevent default for empty searches
                        return handleSearchSubmit(e);
                    });
                    
                    // We don't need a click handler for the button
                    // as it will naturally submit the form
                    
                    // Mark that we've added listeners to avoid duplicates
                    searchForm.hasSearchListeners = true;
                    
                    // If we're on the browse page with a search query, update the input value
                    const urlParams = new URLSearchParams(window.location.search);
                    const searchQuery = urlParams.get('search');
                    
                    if (searchQuery && searchInput) {
                        searchInput.value = searchQuery;
                    }
                }
            }
        });
    });
    
    observer.observe(document.getElementById('header-content'), { childList: true, subtree: true });
    
    // Also check immediately in case the header is already loaded
    setTimeout(() => {
        const searchForm = document.querySelector('.search-bar') || document.getElementById('search-form');
        const searchInput = document.querySelector('.search-bar input') || document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-bar button') || document.getElementById('search-button');
        
        if (searchForm && searchInput && !searchForm.hasSearchListeners) {
            console.log('Delayed check: Search form found, attaching event listeners');
            
            // Handle form submission (Enter key)
            searchForm.addEventListener('submit', function(e) {
                // Only prevent default for empty searches
                return handleSearchSubmit(e);
            });
            
            // We don't need a click handler for the button
            // as it will naturally submit the form
            
            // Mark that we've added listeners to avoid duplicates
            searchForm.hasSearchListeners = true;
        }
    }, 1000); // Check after 1 second
}