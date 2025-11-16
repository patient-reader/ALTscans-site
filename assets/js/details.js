document.addEventListener("DOMContentLoaded", async () => {
  // Toggle "Show More" for description
  const desc = document.getElementById("description");
  const toggleBtn = document.getElementById("toggleDescription");
  const chaptersRead = localStorage.getItem('chaptersRead') ? JSON.parse(localStorage.getItem('chaptersRead')) : [];
  
  console.log(chaptersRead);

  
  toggleBtn.addEventListener("click", () => {
    desc.classList.toggle("expanded");
    toggleBtn.textContent = desc.classList.contains("expanded") ? "SHOW LESS" : "SHOW MORE";
  });

  // Five-Star Rating
  document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", () => {
      let value = star.getAttribute("data-value");
      document.querySelectorAll(".star").forEach(s => {
        s.classList.toggle("active", s.getAttribute("data-value") <= value);
      });
    });
  });

  // Toggle Heart Icons (Manga Info)
  document.querySelectorAll(".heart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  // Toggle "like" for each chapter in the list
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  // Get current URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const nick = urlParams.get("series");
  const seriesId = urlParams.get("id");
  console.log(nick, seriesId);

  // Update URL to clean format without page reload
  if (nick && seriesId) {
    const newUrl = `/series/?series=${nick}&id=${seriesId}`;
    history.pushState({}, "", newUrl);
  }

  if (!nick || !seriesId) {
    console.log(`Error: Missing URL parameters`);
    const bodyTitle = document.querySelector(".series-title");
    if (bodyTitle) {
      bodyTitle.textContent =
        "Error: Incorrect URL Format. Please check the URL and try again.";
    }
    return;
  }

  async function handleDetails() {
    try {
      const seriesThumbnail = document.querySelector(".cover-column");
      const bodyTitle = document.querySelector(".series-title");
      const status = document.querySelector(".status-badge");
      const tagList = document.querySelector(".genre-row");
      const description = document.querySelector(".description");
      const chapterHeader = document.querySelector(".chapters-header");
      const chapterListContainer = document.querySelector(".chapters-list-container");
      const firstChapterBtn = document.querySelector(".chapter-button.first-chapter");
      const newChapterBtn = document.querySelector(".chapter-button.new-chapter");
      const chapterTitle = document.querySelector(".chapter-title");
      const chapterSearch = document.querySelector(".chapter-search");
      const details = document.querySelector(".details");
      const links = document.querySelector(".link-icons");
      const bookmarkBtn = document.querySelector('.bookmark-btn');

      // Debugging: Check if links container is selected
      console.log("Links container:", links);

      const { series, releases } = await getSeriesInfo(seriesId, nick);

      // Set Series title
      if (series && series.title) {
        let formattedTitle = formatTitle(series.title);
        // Update both titles
        if (bodyTitle) bodyTitle.textContent = formattedTitle;
        document.title = formattedTitle; // Update page title
      }

      // Attach thumbnail
      if (seriesThumbnail && series.thumbnail) {
        seriesThumbnail.innerHTML = `
          <img 
            src="${series.thumbnail}" 
            alt="Manga Cover" 
            class="cover-image" 
          />
        `;
      }

      // Set status badge
      if (status && series.manga_status) {
        status.textContent = formatTitle(series.manga_status);
      }

      // Set genres
      if (tagList && series.genre) {
        const genre = series.genre.split(',').map(tag => tag.trim());
        tagList.innerHTML = genre.map(tag => `<div class="genre-badge">${tag}</div>`).join(' ');
      }

      // Set description
      if (description && series.desc) {
        description.innerHTML = series.desc;
      }

      // Set details
      if (details) {
        // Set artist
        if (series.artist) {
          details.innerHTML += `<span><strong>ARTIST:</strong> ${series.artist} </span>`;
        }

        // Set author
        if (series.author) {
          details.innerHTML += `<span><strong>AUTHOR:</strong> ${series.author} </span>`;
        }

        // Set publisher
        if (series.publisher) {
          details.innerHTML += `<span><strong>PUBLISHER:</strong> ${series.publisher} </span>`;
        }

        // Set release year
        if (series.releaseDate) {
          details.innerHTML += `<span><strong>RELEASE:</strong> ${formatDate(series.releaseDate)} </span>`;
        }
      }

      // Set links
      if (series.mal) {
        links.innerHTML += `
          <a href="${series.mal}" target="_blank">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 40px; fill: #2E51A2;">
              <title>MyAnimeList</title>
              <path d="M8.273 7.247v8.423l-2.103-.003v-5.216l-2.03 2.404-1.989-2.458-.02 5.285H.001L0 7.247h2.203l1.865 2.545 2.015-2.546 2.19.001zm8.628 2.069l.025 6.335h-2.365l-.008-2.871h-2.8c.07.499.21 1.266.417 1.779.155.381.298.751.583 1.128l-1.705 1.125c-.349-.636-.622-1.337-.878-2.082a9.296 9.296 0 0 1-.507-2.179c-.085-.75-.097-1.471.107-2.212a3.908 3.908 0 0 1 1.161-1.866c.313-.293.749-.5 1.1-.687.351-.187.743-.264 1.107-.359a7.405 7.405 0 0 1 1.191-.183c.398-.034 1.107-.066 2.39-.028l.545 1.749H14.51c-.593.008-.878.001-1.341.209a2.236 2.236 0 0 0-1.278 1.92l2.663.033.038-1.81h2.309zm3.992-2.099v6.627l3.107.032-.43 1.775h-4.807V7.187l2.13.03z"/>
            </svg>
          </a>
        `;
      }

      if (series.anilist) {
        links.innerHTML += `
          <span class="icon-link">
            <a href="${series.anilist}" target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 40px; fill: #02A9FF;">
                <title>AniList</title>
                <path d="M24 17.53v2.421c0 .71-.391 1.101-1.1 1.101h-5l-.057-.165L11.84 3.736c.106-.502.46-.788 1.053-.788h2.422c.71 0 1.1.391 1.1 1.1v12.38H22.9c.71 0 1.1.392 1.1 1.101zM11.034 2.947l6.337 18.104h-4.918l-1.052-3.131H6.019l-1.077 3.131H0L6.361 2.948h4.673zm-.66 10.96-1.69-5.014-1.541 5.015h3.23z"/>
              </svg>
            </a>
          </span>
        `;
      }

      if (series.naver) {
        links.innerHTML += `
          <span class="icon-link">
            <a href="${series.naver}" target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 40px; fill: #03C75A;">
                <title>Naver</title>
                <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
              </svg>
            </a>
          </span>
        `;
      }

      if (series.webtoon) {
        links.innerHTML += `
          <span class="icon-link">
            <a href="${series.webtoon}" target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 40px; fill: #00D564;">
                <title>WEBTOON</title>
                <path d="M15.023 15.26c.695 0 1.014-.404 1.014-1.051 0-.551-.308-1.01-.984-1.01-.58 0-.912.404-.912 1.016 0 .543.32 1.045.882 1.045zM10.135 15.447c.764 0 1.113-.443 1.113-1.154 0-.604-.338-1.109-1.082-1.109-.637 0-1.002.445-1.002 1.115 0 .597.352 1.148.971 1.148zM24 10.201l-3.15.029.83-9.686L1.958 3.605l1.686 6.248H0l3.734 11.488 8.713-1.283v3.396l10.113-4.641L24 10.201zm-9.104-3.594c0-.049.039-.092.088-.094l1.879-.125.446-.029c.524-.035 1.634.063 1.634 1.236 0 .83-.619 1.184-.619 1.184s.75.189.707 1.092c0 1.602-1.943 1.389-1.943 1.389l-.225-.006-1.908-.053a.089.089 0 0 1-.086-.09l.027-4.504zm-3.675.243c0-.047.039-.09.088-.092l3.064-.203a.08.08 0 0 1 .087.08v.943c0 .049-.039.09-.087.092l-1.9.08a.094.094 0 0 0-.088.09l-.005.394a.083.083 0 0 0 .086.084l1.646-.066a.082.082 0 0 1 .086.084l-.02 1.012a.089.089 0 0 1-.089.086h-1.63a.089.089 0 0 0-.088.088v.416c0 .047.039.088.088.088l1.87.033a.09.09 0 0 1 .087.09v.951a.084.084 0 0 1-.087.084l-3.063-.123a.09.09 0 0 1-.087-.09l.042-4.121zm-6.01.312l.975-.064a.101.101 0 0 1 .105.08l.458 2.205c.01.047.027.047.039 0l.576-2.281a.132.132 0 0 1 .108-.09l.921-.061a.108.108 0 0 1 .109.078l.564 2.342c.012.047.029.047.041 0l.6-2.424a.131.131 0 0 1 .108-.092l.996-.064c.048-.004.077.031.065.078l-1.09 4.104a.113.113 0 0 1-.109.082l-1.121-.031a.12.12 0 0 1-.109-.086l-.535-1.965c-.012-.047-.033-.047-.045 0l-.522 1.934a.12.12 0 0 1-.11.082l-1.109-.031a.123.123 0 0 1-.108-.088l-.873-3.618c-.011-.047.019-.088.066-.09zm-.288 9.623v-3.561a.089.089 0 0 0-.087-.088l-1.252-.029a.095.095 0 0 1-.091-.09l-.046-1.125a.082.082 0 0 1 .083-.086l4.047.096c.048 0 .087.041.085.088l-.022 1.088a.093.093 0 0 1-.089.088l-1.139.004a.09.09 0 0 0-.087.088v3.447c0 .049-.039.09-.087.092l-1.227.07a.08.08 0 0 1-.088-.082zm2.834-2.379c0-1.918 1.321-2.482 2.416-2.482s2.339.73 2.339 2.316c0 1.9-1.383 2.482-2.416 2.482-1.033.001-2.339-.724-2.339-2.316zm5.139-.115c0-1.746 1.166-2.238 2.162-2.238s2.129.664 2.129 2.107c0 1.729-1.259 2.26-2.198 2.26s-2.093-.68-2.093-2.129zm7.259 1.711a.175.175 0 0 1-.139-.064l-1.187-1.631c-.029-.039-.053-.031-.053.018v1.67c0 .047-.039.09-.086.092l-1.052.061a.082.082 0 0 1-.087-.082l.039-3.842c0-.047.039-.086.088-.084l.881.02a.2.2 0 0 1 .137.074l1.293 1.902c.027.041.051.033.051-.014l.032-1.846a.087.087 0 0 1 .089-.086l.963.029c.047 0 .085.041.083.09l-.138 3.555a.097.097 0 0 1-.091.092l-.823.046zM16.258 8.23l.724-.014s.47.018.47-.434c0-.357-.411-.33-.411-.33l-.782.008a.09.09 0 0 0-.088.088v.598a.083.083 0 0 0 .087.084zM16.229 10.191h.99c.024 0 .35-.051.35-.404 0-.293-.229-.402-.441-.398l-.898.029a.089.089 0 0 0-.087.09v.596a.086.086 0 0 0 .086.087z"/>
              </svg>
            </a>
          </span>
        `;
      }

      if (firstChapterBtn && newChapterBtn && series.chapterCount && chapterListContainer) {
        const earliestAvailableChapter = Math.min(...series.chapters.map(chapter => chapter.chapterNo));
        const latestAvailableChapter = Math.max(...series.chapters.map(chapter => chapter.chapterNo));

        firstChapterBtn.addEventListener("click", () => {
          openChapter(seriesId, nick, earliestAvailableChapter);
        });

        newChapterBtn.addEventListener("click", () => {
          openChapter(seriesId, nick, latestAvailableChapter);
        });

        // Function to render chapters
        function renderChapters(chapters) {
          chapterListContainer.innerHTML = ''; // Clear existing chapters
          const sorted = [...chapters].sort((a, b) => Number(b.chapterNo) - Number(a.chapterNo));

          sorted.forEach(release => {
            const chapterItem = document.createElement('div');
            chapterItem.classList.add('chapter-item', 'hover-grow');
            chapterItem.setAttribute('onclick', `openChapter(${seriesId}, '${nick}', ${release.chapterNo})`);

            chapterItem.innerHTML = `
              <div class="chapter-thumbnail">
                <img 
                  src="${release.thumbnail}" 
                  alt="Chapter ${release.chapterNo} thumbnail"
                />
              </div>
              <div class="chapter-info">
                <h3 class="chapter-title-strip">Chapter ${release.chapterNo} ${release.chapterName || " "}</h3>
                <span class="chapter-time">${formatDate(release.uploadDate)}</span>
              </div>
              <div class="chapter-like">
                <button class="like-btn" aria-label="Like this chapter">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                             c0-2.5 2-4.5 4.5-4.5
                             c1.74 0 3.41 1.01 4.22 2.61
                             c0.81-1.6 2.48-2.61 4.22-2.61
                             c2.5 0 4.5 2 4.5 4.5
                             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z">
                    </path>
                  </svg>
                </button>
              </div>
            `;
            
            // if(chaptersRead.seriesId.includes(release.chapterNo)) {
            //   chapterItem.classList.add('read');
            // };
            
            // Add hover event listeners
            chapterItem.addEventListener('mouseenter', () => {
              chapterTitle.textContent = `Chapter ${release.chapterNo} ${release.chapterName || ""}`;
            });
            
            chapterItem.addEventListener('mouseleave', () => {
              chapterTitle.textContent = "";
            });
            
            chapterListContainer.appendChild(chapterItem);
          });
        }
        
        // Initial render of all chapters
        renderChapters(releases);

        // Add event listener for search input
        chapterSearch.addEventListener('input', (e) => {
          const searchValue = e.target.value.toLowerCase();
          const filteredChapters = releases.filter(release => 
            release.chapterNo.toString().includes(searchValue) || 
            (release.chapterName && release.chapterName.toLowerCase().includes(searchValue))
          );
          renderChapters(filteredChapters);
        });
      }

      // Bookmark handler
      bookmarkBtn.addEventListener('click', () => handleBookmarkClick(bookmarkBtn, series));

      // Check if the series is already bookmarked
      if (await checkIfBookmarked(series)) {
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.classList.add('active');
        bookmarkBtn.setAttribute('aria-label', 'Unbookmark this series');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Handle browser back/forward buttons
    window.addEventListener("popstate", handleDetails);
  };
  
  handleDetails();
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

function openChapter(seriesId, nick, chapterNo) {
  window.location.href = `/reader.html?id=${seriesId}&series=${nick}&chapter=${chapterNo}`;
}

async function getSeriesInfo(seriesId, nick) {
  const response = await axios.get(
    `${base_url}/api/admin/getSeriesDetails/${seriesId}/${nick}`,
  );
  
  let series = response.data.seriesDetails;
  let releases = response.data.releases;
  
  console.log(response);
  console.log(series);
  console.log(releases);
  
  return { series, releases };
}