if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch((error) => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

let basedbUrl = base_url;

document.addEventListener('DOMContentLoaded', () => {
  const chaptersRead = localStorage.getItem('chaptersRead') ? JSON.parse(localStorage.getItem('chaptersRead')) : [];
  
  const urlParams = new URLSearchParams(window.location.search);
  const chapterSelect = document.querySelector('.chapter-select');
  const prevButtons = document.querySelectorAll('.prev-chapter');
  const nextButtons = document.querySelectorAll('.next-chapter');
  const currentChapterSpan = document.getElementById('current-chapter');
  const currentChapterName = document.getElementById('current-chapter-name');
  const chapterContent = document.querySelector('.chapter-content');
  
  let currentChapter = parseInt(urlParams.get('chapter'));
  const seriesName = urlParams.get('series');
  const seriesId = urlParams.get('id');

  function formatTitle(title) {
    return title
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (!currentChapter || !seriesName || !seriesId) {
    console.log(`Error: Missing URL parameters`);

    let header = document.querySelector('.chapter-title');
    if (header) {
      header.textContent = 'Error: Missing URL parameters';
    }
    return;
  }

  // IndexedDB utility functions
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('chapterCacheDB', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'key' }); // Key format: `${seriesId}-${chapter}`
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async function saveChapterToIndexedDB(key, data) {
    const db = await openDatabase();
    const transaction = db.transaction('chapters', 'readwrite');
    const store = transaction.objectStore('chapters');

    store.put({ key, data });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });
  }

  async function getChapterFromIndexedDB(key) {
    const db = await openDatabase();
    const transaction = db.transaction('chapters', 'readonly');
    const store = transaction.objectStore('chapters');

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = (event) => resolve(event.target.result?.data || null);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async function updateChapterUI(chapterData, chapter) {
    if (!chapterData) return;

    // Update navigation buttons
    const maxChapter = await axios.get(`${basedbUrl}/api/admin/getSeriesDetails/${seriesId}/${seriesName}`).then(response => {
      return response.data.seriesDetails.maxChaptersUploaded
    });
    
    prevButtons.forEach(button => button.disabled = chapter <= 1);
    nextButtons.forEach(button => button.disabled = chapter >= maxChapter);
    
    // Populate chapter select
    const chapters = Array.from({ length: maxChapter + 1 }, (_, i) => `
      <option value="${i + 1}" ${i + 1 == currentChapter ? 'selected' : ''}>
        Chapter ${i + 1}
      </option>
    `).join('');
    
    chapterSelect.innerHTML = chapters;


    // Update chapter images
    const images = chapterData.resources.map((imgUrl, index) => `
      <img 
        src="${imgUrl}" 
        alt="Chapter ${chapter} Page ${index + 1}" 
        class="chapter-image"
        loading="${index === 0 ? 'eager' : 'lazy'}"
      >
    `).join('');
    
    chapterContent.innerHTML = images;

    // Update URL and browser history
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('chapter', chapter);
    history.pushState(
      {chapter}, 
      `Chapter ${chapter} - ${seriesName.toUpperCase()}`,
      newUrl.toString()
    );
    
    document.title = `Chapter ${chapter} - ${seriesName.toUpperCase()}`;
    currentChapterSpan.innerHTML = `${chapter}`;
    currentChapterName.innerHTML = `<a href="/series/?series=${seriesName}&id=${seriesId}">${formatTitle(chapterData.seriesDetails.title)}</a>`;
    chapterSelect.value = chapter;
    
    // Update comments section
    updateCommentsSection(chapter);
  }

  async function loadChapter(seriesId, seriesName, chapter) {
    const cacheKey = `${seriesId}-${chapter}`;
    const cachedChapter = await getChapterFromIndexedDB(cacheKey);

    if (cachedChapter) {
      console.log(`Loaded chapter ${chapter} from cache.`);
      updateChapterUI(cachedChapter, chapter);
    } else {
      console.log(`Fetching chapter ${chapter} from API.`);
      axios.get(`${basedbUrl}/api/admin/getSeries/${seriesId}/${seriesName}/${chapter}`)
        .then(async response => {
          const chapterData = response.data;

          // Cache the chapter data
          await saveChapterToIndexedDB(cacheKey, chapterData);

          // Update the UI
          updateChapterUI(chapterData, chapter);
        })
        .catch(error => console.error('Error fetching chapter:', error));
    }
  }

  function navigateChapter(direction) {
    const newChapter = currentChapter + direction;
    currentChapter = newChapter;
    loadChapter(seriesId, seriesName, newChapter);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function updateCommentsSection(chapter) {
    // Update Disqus configuration
    var disqus_config = function () {
      this.page.url = window.location.href;  // Use current page URL
      this.page.identifier = `${seriesName}-chapter-${chapter}`; // Create unique identifier based on series and chapter
    };

    // Reload Disqus script
    (function() {
      var d = document, s = d.createElement('script');
      s.src = 'https://altscan.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    })();
    
    
    /* - - - CONFIGURATION VARIABLES - - - */
  
    var __semio__params = {
      graphcommentId: "Alternative-Scans", // make sure the id is yours
  
      behaviour: {
        // HIGHLY RECOMMENDED
         uid: `${seriesName} - ${chapter}`, // uniq identifer for the comments thread on your page (ex: your page id)
      },
  
      // configure your variables here
  
    }
  
    /* - - - DON'T EDIT BELOW THIS LINE - - - */
  
    function __semio__onload() {
      __semio__gc_graphlogin(__semio__params)
    }
  
  
    (function() {
      var gc = document.createElement('script'); gc.type = 'text/javascript'; gc.async = true;
      gc.onload = __semio__onload; gc.defer = true; gc.src = 'https://integration.graphcomment.com/gc_graphlogin.js?' + Date.now();
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(gc);
    })();
  }

  // Function to toggle comment options visibility
  function toggleCommentOptions() {
    const commentOptions = document.getElementById('comment-options');
    const isHidden = commentOptions.hidden;
    
    commentOptions.hidden = !isHidden;
    
    // Update the aria-expanded attribute
    const iconButton = document.querySelector('.icon-button');
    iconButton.setAttribute('aria-expanded', !isHidden);
    
    // Hide tooltip when options are visible
    const tooltipContainer = document.querySelector('.tooltip-container');
    tooltipContainer.style.display = isHidden ? 'none' : 'flex';
  }
  
  // Function to switch between comment tabs
  function switchTab(commentSystem) {
    // Get all tab panels
    const panels = [
      document.getElementById('disqus-panel'),
      document.getElementById('facebook-panel'),
      document.getElementById('graphcomment-panel')
    ];
    
    // Get all tab buttons
    const tabs = [
      document.getElementById('disqus-tab'),
      document.getElementById('facebook-tab'),
      document.getElementById('graphcomment-tab')
    ];
    
    // Hide all panels first
    panels.forEach(panel => {
      panel.hidden = true;
    });
    
    // Update aria-selected state for all tabs
    tabs.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
    });
    
    // Show the selected panel and update its tab button
    switch(commentSystem) {
      case 'disqus':
        document.getElementById('disqus-panel').hidden = false;
        document.getElementById('disqus-tab').setAttribute('aria-selected', 'true');
        
        // Reload Disqus if needed
        if (typeof DISQUS !== 'undefined') {
          DISQUS.reset({
            reload: true,
            config: function () {
              this.page.identifier = `${seriesName} - ${chapter}`;
              this.page.url = window.location.href;
            }
          });
        }
        break;
        
      case 'facebook':
        document.getElementById('facebook-panel').hidden = false;
        document.getElementById('facebook-tab').setAttribute('aria-selected', 'true');
        
        // Refresh Facebook comments
        if (typeof FB !== 'undefined') {
          FB.XFBML.parse();
        }
        break;
        
      case 'graphcomment':
        document.getElementById('graphcomment-panel').hidden = false;
        document.getElementById('graphcomment-tab').setAttribute('aria-selected', 'true');
        
        // Refresh GraphComment if needed
        if (window.__semio__gc_graphlogin && window.__semio__params) {
          window.__semio__gc_graphlogin(window.__semio__params);
        }
        break;
    }
  }
  
  // Initial load
  loadChapter(seriesId, seriesName, currentChapter);

  // Set up event listeners
  chapterSelect.addEventListener('change', (e) => {
    currentChapter = parseInt(e.target.value);
    loadChapter(seriesId, seriesName, currentChapter);
    window.scrollTo({top: 0, behavior: 'smooth'});
  });

  prevButtons.forEach(button => {
    button.addEventListener('click', () => navigateChapter(-1));
  });

  nextButtons.forEach(button => {
    button.addEventListener('click', () => navigateChapter(1));
  });

  // Keyboard shortcuts handler
  document.addEventListener('keydown', (e) => {
    // Prevent default behavior for our keyboard shortcuts
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'f', 'F', 'h', 'H', 
         'PageUp', 'PageDown', ' ', '?'].includes(e.key) || 
        (e.key >= '0' && e.key <= '9')) {
      // Don't prevent default if user is typing in a form element
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
        e.preventDefault();
      } else {
        return; // Skip shortcuts when typing
      }
    }

    // Chapter navigation
    if (e.key === 'ArrowLeft') navigateChapter(-1);
    else if (e.key === 'ArrowRight') navigateChapter(1);
    
    // Jump to first or last chapter
    else if (e.key === 'Home') {
      axios.get(`${basedbUrl}/api/admin/getSeriesDetails/${seriesId}/${seriesName}`)
        .then(response => {
          const maxChapter = response.data.seriesDetails.chapters;
          // Sort chapters in ascending order and then get the first chapter
          currentChapter = maxChapter.sort((a, b) => a.chapterNumber - b.chapterNumber)[0];
          loadChapter(seriesId, seriesName, currentChapter);
          window.scrollTo({top: 0, behavior: 'smooth'});
        })
    }
    else if (e.key === 'End') {
      axios.get(`${basedbUrl}/api/admin/getSeriesDetails/${seriesId}/${seriesName}`)
        .then(response => {
          const maxChapter = response.data.seriesDetails.maxChaptersUploaded;
          currentChapter = maxChapter;
          loadChapter(seriesId, seriesName, currentChapter);
          window.scrollTo({top: 0, behavior: 'smooth'});
        })
        .catch(error => console.error('Error fetching max chapter:', error));
    }
    
    // Scrolling controls
    else if (e.key === 'PageDown' || e.key === ' ') {
      window.scrollBy({top: window.innerHeight * 0.9, behavior: 'smooth'});
    }
    else if (e.key === 'PageUp') {
      window.scrollBy({top: -window.innerHeight * 0.9, behavior: 'smooth'});
    }
    
    // Toggle fullscreen
    else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
    
    // Return to home/index
    else if (e.key === 'h' || e.key === 'H') {
      window.location.href = '/';
    }
    
    // Direct chapter selection with number keys (0-9)
    else if (e.key >= '0' && e.key <= '9') {
      const digit = parseInt(e.key);
      axios.get(`${basedbUrl}/api/admin/getSeriesDetails/${seriesId}/${seriesName}`)
        .then(response => {
          const maxChapter = response.data.seriesDetails.maxChaptersUploaded;
          // Calculate chapter based on percentage
          // 0 = 10% of max chapters, 9 = 90% of max chapters, etc.
          // 0 key means 10th segment (100%)
          const segment = digit === 0 ? 10 : digit;
          const targetChapter = Math.max(1, Math.min(maxChapter, Math.ceil((segment / 10) * maxChapter)));
          
          if (targetChapter !== currentChapter) {
            currentChapter = targetChapter;
            loadChapter(seriesId, seriesName, currentChapter);
            window.scrollTo({top: 0, behavior: 'smooth'});
          }
        })
        .catch(error => console.error('Error fetching max chapter:', error));
    }
    
    // Show keyboard shortcuts help
    else if (e.key === '?') {
      showKeyboardShortcutsHelp();
    }
  });
  
  window.addEventListener('popstate', (e) => {
    if (e.state && typeof e.state.chapter === 'number') {
      currentChapter = e.state.chapter;
      loadChapter(seriesId, seriesName, currentChapter);
    }
  });
  
  // Function to toggle fullscreen mode
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
        document.documentElement.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
      }
    }
  }
  
  
  // Function to show keyboard shortcuts help
  function showKeyboardShortcutsHelp() {
    let modal = document.getElementById('keyboard-shortcuts-modal');

    // Create modal if not there cause why is it not there?
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'keyboard-shortcuts-modal';
      
      // Modal content
      modal.innerHTML = `
        <h2>Keyboard Shortcuts</h2>
        <table>
          <tr>
            <th>Key</th>
            <th>Action</th>
          </tr>
          <tr>
            <td>← (Left Arrow)</td>
            <td>Previous chapter</td>
          </tr>
          <tr>
            <td>→ (Right Arrow)</td>
            <td>Next chapter</td>
          </tr>
          <tr>
            <td>Home</td>
            <td>Go to first chapter</td>
          </tr>
          <tr>
            <td>End</td>
            <td>Go to last chapter</td>
          </tr>
          <tr>
            <td>Space / Page Down</td>
            <td>Scroll down</td>
          </tr>
          <tr>
            <td>Page Up</td>
            <td>Scroll up</td>
          </tr>
          <tr>
            <td>F</td>
            <td>Toggle fullscreen</td>
          </tr>
          <tr>
            <td>H</td>
            <td>Return to home page</td>
          </tr>
          <tr>
            <td>0-9</td>
            <td>Jump to chapter (1=10%, 5=50%, 0=100%)</td>
          </tr>
          <tr>
            <td>?</td>
            <td>Show this help menu</td>
          </tr>
        </table>
        <div style="text-align: center;">
          <button id="close-shortcuts-modal">Close</button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close button event listener
      document.getElementById('close-shortcuts-modal').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      // Close modal when clicking outside
      document.addEventListener('click', (e) => {
        if (e.target !== modal && !modal.contains(e.target)) {
          modal.style.display = 'none';
        }
      });
      
      // Close modal when pressing Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') {
          modal.style.display = 'none';
        }
      });
    } else {
      // Toggle visibility if modal already exists
      modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    }
  }
});
