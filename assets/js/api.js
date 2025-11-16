async function fetchLatestReleases() {
  try {
    
    
    const response = await axios.get(`${base_url}/api/admin/getLatestUpdate`);

    // Check if the response is an array
    if (!Array.isArray(response.data.latestReleases)) {
      throw new Error("Expected an array of releases");
    }

    const latestReleases = response.data.latestReleases; // Adjust this based on the actual structure of your API response
    console.log(latestReleases);

    // Group the releases by series titles
    const groupedReleases = latestReleases.reduce((acc, release) => {
      if (!acc[release.title]) {
        acc[release.title] = [];
      }
      acc[release.title].push(release);
      return acc;
    }, {});

    // Render the latest releases for mobile and desktop
    renderMobile(groupedReleases);
    renderDesktop(groupedReleases);
  } catch (error) {
    console.error("Error fetching latest releases:", error);
    // Optionally, display an error message to the user
    const releasesContainerMobile = document.getElementById('latest-release-mobile');
    const releasesContainerDesktop = document.getElementById('latest-release-desktop');
    if (releasesContainerMobile) {
      releasesContainerMobile.innerHTML = "<p>Error loading latest releases. Please try again later.</p>";
    }
    if (releasesContainerDesktop) {
      releasesContainerDesktop.innerHTML = "<p>Error loading latest releases. Please try again later.</p>";
    }
  }
}

function renderMobile(groupedData) {
  const chaptersRead = localStorage.getItem('chaptersRead') ? JSON.parse(localStorage.getItem('chaptersRead')) : [];
  const container = document.getElementById('latest-release-mobile');
  
  container.innerHTML = '<h2 class="section-title-mobile">LATEST RELEASES</h2>';
  
  Object.keys(groupedData).forEach(seriesTitle => {
    const series = groupedData[seriesTitle];
    series.sort((a, b) => b.chapterNo - a.chapterNo); // Sort chapters by chapter number in descending order
    const el = document.createElement('div');
    el.className = 'series-container';
    el.dataset.id = series[0]._id;
    el.innerHTML = `
      <div class="left">
        <img src="${series[0].seriesThumbnail}" alt="Thumbnail" class="thumbnail">
        <div class="series-info">
          <div class="series-title">${formatTitle(seriesTitle)}</div>
          <div class="rating">
            <span data-value="1">&#9733;</span>
            <span data-value="2">&#9733;</span>
            <span data-value="3">&#9733;</span>
            <span data-value="4">&#9733;</span>
            <span data-value="5">&#9733;</span>
          </div>
        </div>
      </div>
      <div class="chapters">
      <button class="chapter newest hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].chapterNo})" data-chapter="${series[0].chapterNo}">READ CHAPTER ${series[0].chapterNo}</button>
      ${
        series[0].previousChapter > 0 ? `<button class="chapter hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].previousChapter})" data-chapter="${series[0].previousChapter}">READ CHAPTER ${series[0].previousChapter}</button>` : ''
      }
      <button class="chapter hvr-grow" data-chapter="${series[0].previousChapter -1}" onClick="readChapter(${series[series.length - 1].manga}, '${series[series.length - 1].nick}', ${series[0].previousChapter - 1})">READ CHAPTER ${series[0].previousChapter - 1}</button>
      </div>
    `;
    container.appendChild(el);
    
    const thumbnail = el.querySelector('.thumbnail');
    const title = el.querySelector('.series-title');
    thumbnail.addEventListener('click', () => {
      openSeries(series[0].manga, series[0].nick);
    });
    title.addEventListener('click', () => {
      openSeries(series[0].manga, series[0].nick);
    });
    
  });
}

// Function to render the latest releases for desktop view
function renderDesktop(groupedData) {
  const container = document.getElementById('latest-release-desktop');
  container.innerHTML = `
    <div class="latest-releases-container">
      <h2 class="section-title-desktop">LATEST RELEASES</h2>
      <div class="desktop-grid" id="desktopGrid"></div>
    </div>
  `;
  const grid = document.getElementById('desktopGrid');
  Object.keys(groupedData).forEach(seriesTitle => {
    const series = groupedData[seriesTitle];
    series.sort((a, b) => b.chapterNo - a.chapterNo); // Sort chapters by chapter number in descending order
    const item = document.createElement('div');
    item.className = 'release-item';
    item.dataset.id = series[0]._id;
    item.innerHTML = `
      <div class="series-thumbnail">
        <img src="${series[0].seriesThumbnail}" alt="${formatTitle(seriesTitle)} thumbnail">
        <button class="heart-button">
          <svg class="heart-icon empty" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4
              15.36 2 12.28 2 8.5 2 5.42
              4.42 3 7.5 3c1.74 0 3.41.81
              4.5 2.09C13.09 3.81 14.76 3
              16.5 3 19.58 3 22 5.42
              22 8.5c0 3.78-3.4 6.86-8.55
              11.54L12 21.35z" fill="none"
              stroke="white" stroke-width="2"/>
          </svg>
          <svg class="heart-icon filled" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4
              15.36 2 12.28 2 8.5 2 5.42
              4.42 3 7.5 3c1.74 0 3.41.81
              4.5 2.09C13.09 3.81 14.76 3
              16.5 3 19.58 3 22 5.42
              22 8.5c0 3.78-3.4 6.86-8.55
              11.54L12 21.35z" fill="white"/>
          </svg>
        </button>
      </div>
      <div class="series-info">
        <div class="series-title">${formatTitle(seriesTitle)}</div>
        <div class="rating-container" data-rating="0">
          <div class="stars">
            ${[5, 4, 3, 2, 1].map(star => `
              <input type="radio"
                id="star${star}-series${series[0]._id}"
                name="rating-series${series[0]._id}"
                value="${star}"
                class="star-input"/>
              <label for="star${star}-series${series[0]._id}" class="star-label">
                <svg viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03
                    L22 9.24l-7.19-.61L12 2
                    9.19 8.63 2 9.24l5.46 4.73
                    L5.82 21z"/>
                </svg>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
      <button class="chapter newest hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].chapterNo})" data-chapter="${series[0].chapterNo}">READ CHAPTER ${series[0].chapterNo}</button>
      ${
        series[0].previousChapter > 0 ? `<button class="chapter hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].previousChapter})" data-chapter="${series[0].previousChapter}">READ CHAPTER ${series[0].previousChapter}</button>` : ''
      }
      <button class="chapter hvr-grow" data-chapter="${series[0].previousChapter - 1}" onClick="readChapter(${series[series.length - 1].manga}, '${series[series.length - 1].nick}', ${series[0].previousChapter - 1 })">READ CHAPTER ${series[0].previousChapter - 1}</button>
    `;

    grid.appendChild(item);
    
    const thumbnail = item.querySelector('.series-thumbnail img');
    const title = item.querySelector('.series-title');
    thumbnail.addEventListener('click', () => {
      openSeries(series[0].manga, series[0].nick);
    });
    title.addEventListener('click', () => {
      openSeries(series[0].manga, series[0].nick);
    });
    
  });
}

// Call the function to fetch and display the latest releases after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", fetchLatestReleases);