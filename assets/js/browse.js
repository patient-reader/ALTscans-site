document.addEventListener('DOMContentLoaded', async () => {
  const seriesBoxes = document.querySelectorAll('.series-box');
  const nothingFound = document.querySelector('.error-msg');
  
  nothingFound.style.display = 'none';
  
  if(seriesBoxes.forEach(box => box.style.display = 'none')) {
    nothingFound.style.display = 'flex';
  }
  
  // Get search query from URL if it exists
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  
  // Update page title and header if this is a search
  if (searchQuery) {
    document.title = `Search: ${searchQuery} - ALTscans`;
    const pageHeader = document.querySelector('main h2');
    if (pageHeader) {
      pageHeader.textContent = `Search Results: "${searchQuery}"`;
    }
    
    // If we have a search input in the header, populate it with the search query
    setTimeout(() => {
      const searchInput = document.querySelector('.search-bar input') || document.querySelector('.search-input');
      if (searchInput) {
        searchInput.value = searchQuery;
      }
    }, 500); // Small delay to ensure the header has loaded
  }
  
  const dialogOverlay = document.getElementById('description-dialog');
  const dialogFullDesc = document.getElementById('full-description');
  const closeDialogBtn = document.getElementById('close-dialog');
  const seriesContainer = document.querySelector('.series-container');
  
  try {
    let getSeriesRes = await getSeries();    
    // If search query exists, filter the series
    if (searchQuery) {
      console.log('Searching for:', searchQuery);
      
      // More comprehensive search that checks multiple fields
      getSeriesRes = getSeriesRes.filter(series => {
        const title = series.title.toLowerCase();
        const description = series.desc ? series.desc.toLowerCase() : '';
        const genres = Array.isArray(series.genre) ? series.genre.join(' ').toLowerCase() : '';
        const authorInfo = series.author ? series.author.toLowerCase() : '';
        
        const query = searchQuery.toLowerCase();
        
        return (
          title.includes(query) || 
          description.includes(query) || 
          genres.includes(query) ||
          authorInfo.includes(query)
        );
      });
      
      if (getSeriesRes.length === 0) {
        nothingFound.style.display = 'flex';
        
        // Update error message to show search term
        const errorMsg = document.querySelector('.error-msg');
        if (errorMsg) {
          const img = errorMsg.querySelector('img');
          errorMsg.innerHTML = '';
          if (img) errorMsg.appendChild(img);
          
          const message = document.createElement('p');
          message.style.textAlign = 'center';
          message.style.marginTop = '20px';
          message.innerHTML = `No results found for <strong>"${searchQuery}"</strong>.<br>Try different keywords or browse our catalog.`;
          errorMsg.appendChild(message);
        }
      }
    }
    
    getSeriesRes.forEach((series, index) => {
      
      const seriesBox = document.createElement('div');
      seriesBox.classList.add('series-box');
      seriesBox.setAttribute('data-index', index);
      
      const bowContainer = series.manga_status === 'dropped' ? `
        <div class="bow-container">
          <p class="bow">Dropped</p>
        </div>
      ` : '';
      
      seriesBox.innerHTML += `
          ${bowContainer}
          <div class="series-thumbnail">
            <img src="${series.thumbnail}" alt="${formatTitle(series.title)}">
          </div>
          
          <h3><strong>${formatTitle(series.title)}</strong></h3>
          <br/>
          <p class="series-description">
            ${truncateDescription(series.desc, 5)}
            <span class="read-more" data-full="${escapeHtml(series.desc).replace(/\n/g, '<br>')}">
              Read more
            </span>
          </p>
          <span class="bookmark">
            <svg class="bookmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
      `;
      
      seriesContainer.appendChild(seriesBox);
    });

    // Attach event listeners after elements are added to the DOM
    document.querySelectorAll('.series-box').forEach(box => {
      box.addEventListener('click', (event) => {
        const index = box.getAttribute('data-index');
        const series = getSeriesRes[index];
        openSeries(series.manga, series.nick);
      });
    });

    document.querySelectorAll('.read-more').forEach(el => {
      el.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the click from propagating to the series box
        dialogFullDesc.innerHTML = this.getAttribute('data-full');
        dialogOverlay.classList.add('active');
      });
    });

    document.querySelectorAll('.bookmark').forEach(async (bookmarkEl, index) => {
      const series = getSeriesRes[index];
      const bookmarkBtn = bookmarkEl.querySelector('.bookmark-icon');

      // Check if the series is already bookmarked
      if (await checkIfBookmarked(series)) {
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.classList.add('active');
        bookmarkBtn.setAttribute('aria-label', 'Unbookmark this series');
      }

      bookmarkEl.addEventListener('click', async (e) => {
        e.stopPropagation();
        await handleBookmarkClick(bookmarkBtn, series);
      });
    });

    let genreSelection = [];
    
    // Add genre selection functionality
    document.querySelectorAll('.genre-option').forEach(genre => {
        genre.addEventListener('click', function() {
            const genreValue = this.getAttribute('data-genre');
            
            // Toggle selected class
            this.classList.toggle('selected');
            
            if (this.classList.contains('selected')) {
                // Add genre to selection if not already present
                if (!genreSelection.includes(genreValue)) {
                    genreSelection.push(genreValue);
                }
            } else {
                // Remove genre from selection
                genreSelection = genreSelection.filter(genre => genre !== genreValue);
            }
            
            console.log('Selected genres:', genreSelection);
            // You can call a function here to filter series based on selected genres
            filterSeriesByGenres();
        });
    });

    // Function to filter series based on selected genres
    function filterSeriesByGenres() {
        const seriesBoxes = document.querySelectorAll('.series-box');
        let visibleCount = 0;
        
        if (genreSelection.length === 0 && !searchQuery) {
            // Show all series if no genres are selected and no search query
            seriesBoxes.forEach(box => {
                box.style.display = 'block';
            });
            nothingFound.style.display = 'none';
            return;
        }
    
        seriesBoxes.forEach((box, index) => {
            const series = getSeriesRes[index];
            
            // If series.genre is not an array, handle it gracefully
            const seriesGenres = Array.isArray(series.genre) ? series.genre : 
                                (typeof series.genre === 'string' ? [series.genre] : []);
            
            const hasSelectedGenres = genreSelection.length === 0 || 
                                     genreSelection.every(genre => seriesGenres.includes(genre));
            
            // If we have a search query, only show if it matches the search AND genre filters
            const matchesSearch = !searchQuery || 
                                 (series.title.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const shouldDisplay = hasSelectedGenres && matchesSearch;
            
            box.style.display = shouldDisplay ? 'block' : 'none';
            if (shouldDisplay) {
                visibleCount++;
            }
        });
        
        // Show/hide nothing found message based on visible count
        nothingFound.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
    
    
    
    let yearFilter = "";
    
    // Add year selection functionality
    document.querySelectorAll('.year-option').forEach(year => {
        year.addEventListener('click', function() {
            const yearValue = this.getAttribute('data-year');
            
            // Remove 'selected' class from all year options
            document.querySelectorAll('.year-option').forEach(y => {
                y.classList.remove('selected');
            });
            
            // If clicking the same year that's already selected, clear the filter
            if (yearFilter === yearValue) {
                yearFilter = "";
            } else {
                // Add selected class to clicked year and update yearFilter
                this.classList.add('selected');
                yearFilter = yearValue;
            }
            
            console.log('Selected year:', yearFilter);
            filterSeriesByYear();
        });
    });
    
    // Function to filter series based on selected year
    function filterSeriesByYear() {
        const seriesBoxes = document.querySelectorAll('.series-box');
        let visibleCount = 0;
        
        if (yearFilter === "" && !searchQuery) {
            // Show all series if no year is selected and no search query
            seriesBoxes.forEach(box => {
                box.style.display = 'block';
            });
            nothingFound.style.display = 'none';
            return;
        }
    
        seriesBoxes.forEach((box, index) => {
            const series = getSeriesRes[index];
            
            // Handle potential invalid dates
            let releaseYear;
            try {
                releaseYear = series.releaseDate ? new Date(series.releaseDate).getFullYear().toString() : "";
            } catch (e) {
                releaseYear = "";
            }
            
            // If we have a search query, only show if it matches the search AND year filters
            const matchesSearch = !searchQuery || 
                                 (series.title.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesYear = (yearFilter === "") || (releaseYear === yearFilter);
            
            const isVisible = matchesYear && matchesSearch;
            box.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                visibleCount++;
            }
        });
        
        // Show/hide nothing found message based on visible count
        if (visibleCount === 0) {
            nothingFound.style.display = 'flex';
            
            // Update error message if this is a search with no results
            if (searchQuery) {
                const errorMsg = document.querySelector('.error-msg');
                if (errorMsg) {
                    const img = errorMsg.querySelector('img');
                    errorMsg.innerHTML = '';
                    if (img) errorMsg.appendChild(img);
                    
                    const message = document.createElement('p');
                    message.style.textAlign = 'center';
                    message.style.marginTop = '20px';
                    message.innerHTML = `No results found for <strong>"${searchQuery}"</strong> with the selected filters.<br>Try different keywords or adjust your filters.`;
                    errorMsg.appendChild(message);
                }
            } else {
                nothingFound.style.display = 'flex';
            }
        } else {
            nothingFound.style.display = 'none';
        }
    }

  } catch (error) {
    console.error(error);
  }

  document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', function () {
      const dropdown = this.querySelector('.dropdown');
      dropdown.classList.toggle('active');
    });
  });

  closeDialogBtn.addEventListener('click', () => {
    dialogOverlay.classList.remove('active');
  });
});

async function getSeries() {
  try {
    const response = await axios.get(`${base_url}/api/admin/getAllSeries`);
    return response.data.series[0].mangas;
  } catch (error) {
    console.error("Error fetching series:", error);
    // Show error message to user
    const errorMsg = document.querySelector('.error-msg');
    if (errorMsg) {
      errorMsg.style.display = 'flex';
      const img = errorMsg.querySelector('img');
      errorMsg.innerHTML = '';
      if (img) errorMsg.appendChild(img);
      
      const message = document.createElement('p');
      message.style.textAlign = 'center';
      message.style.marginTop = '20px';
      message.innerHTML = 'Unable to load series data. Please try again later.';
      errorMsg.appendChild(message);
    }
    return [];
  }
}

// Helper function for search
function seriesMatchesSearch(series, query) {
  if (!query) return true;
  
  query = query.toLowerCase();
  
  const title = (series.title || '').toLowerCase();
  const description = (series.desc || '').toLowerCase();
  const genres = Array.isArray(series.genre) ? series.genre.join(' ').toLowerCase() : 
               (typeof series.genre === 'string' ? series.genre.toLowerCase() : '');
  const author = (series.author || '').toLowerCase();
  
  return (
    title.includes(query) || 
    description.includes(query) || 
    genres.includes(query) ||
    author.includes(query)
  );
}

