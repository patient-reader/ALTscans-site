// assets/js/config.js
var base_url2 = `https://api.alternativescans.icu`;
var frontoken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNlIxVVNhdHEhdE5oZGgkV05OaHAiLCJpYXQiOjE3NDgzNzMyODl9.qtzXR_F-xqq0p_gEr3FPu5I8-oaUQ2kkcVej4EMZ6qI`;
function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/`;
}
function getTokenValue() {
  const cookie = document.cookie;
  const token = cookie.split(";").find((row) => row.trim().startsWith("token=")) || "";
  if (token === null || token.split("=")[1] === null || token.split("=")[1] === "" || token.split("=")[1] === undefined) {
    console.log("No user token found. User not logged in.");
    return null;
  }
  return token ? token.split("=")[1] : null;
}
function getUserIdValue() {
  const cookie = document.cookie;
  const userId = cookie.split(";").find((row) => row.trim().startsWith("userId="));
  if (userId === null) {
    console.log("No user id found. User not logged in.");
    return null;
  }
  return userId ? userId.split("=")[1] : null;
}
document.addEventListener("DOMContentLoaded", async () => {
  const backToTopButton = document.getElementById("backToTopBtn");
  window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      backToTopButton.style.display = "flex";
    } else {
      backToTopButton.style.display = "none";
    }
  });
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
  async function fetchUserProfile() {
    const token = getTokenValue();
    const userId = getUserIdValue();
    if (!token || !userId)
      return null;
    try {
      const response = await axios.get(`${base_url2}/api/user/${userId}`, {
        headers: {
          Authorization: `${frontoken}`,
          "x-user-token": `${token}`
        }
      });
      if (response.status === 200) {
        return response.data;
      } else {
        console.error("Failed to fetch user profile");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
  async function checkAndVerifyAccount() {
    const token = getTokenValue();
    const userId = getUserIdValue();
    const lastVerified = localStorage.getItem("lastVerified");
    console.log("Checking account...");
    if (token && userId) {
      const currentTime = new Date().getTime();
      const lastVerifiedTime = lastVerified ? new Date(lastVerified).getTime() : 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (currentTime - lastVerifiedTime > twentyFourHours) {
        try {
          console.log("Verifying account...");
          const response = await axios.post(`${base_url2}/api/auth/verifySession`, {
            userId,
            token
          }, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`
            }
          });
          if (response.status === 200) {
            setCookie("lastVerified", new Date().toISOString());
            console.log("Account verified successfully");
          } else {
            console.error("Account verification failed");
          }
        } catch (error) {
          console.error("Error verifying account:", error);
        }
      }
    }
  }
  function setupBackgroundVerification() {
    setInterval(checkAndVerifyAccount, 24 * 60 * 60 * 1000);
  }
  async function displayUserProfile() {
    const userProfile = await fetchUserProfile();
    if (userProfile) {
      const profile = document.querySelector(".profile");
      profile.innerHTML = `
              <img class="hvr-grow" src="${userProfile.profilePicture}" alt="${userProfile.username}" style="height: 30px; border-radius: 50%;">
          `;
      profile.addEventListener("click", () => {
        window.location.href = "/routes/profile";
      });
    }
  }
  await checkAndVerifyAccount();
  setupBackgroundVerification();
  await displayUserProfile();
});
document.addEventListener("DOMContentLoaded", function() {
  const hamburger = document.querySelector(".hamburger");
  hamburger.addEventListener("click", function() {
    document.querySelector(".mobilePopNav").setAttribute("style", "display: flex;");
  });
});

// assets/js/mobile-index.js
class LatestReleases {
  constructor() {
    this.initializeComponents(), this.attachEventListeners();
  }
  initializeComponents() {
    this.starRatings = document.querySelectorAll(".star-rating"), this.likeButtons = document.querySelectorAll(".like-button"), this.coverUploads = document.querySelectorAll(".cover-upload"), this.chapterButtons = document.querySelectorAll(".chapter-btn, .chapter-btn-highlight");
  }
  attachEventListeners() {
    this.initializeStarRatings(), this.initializeLikeButtons(), this.initializeCoverUploads(), this.initializeChapterButtons();
  }
  initializeStarRatings() {
    this.starRatings.forEach((t) => {
      const e = t.querySelectorAll(".star");
      e.forEach((t2, s) => {
        t2.addEventListener("click", () => this.updateStarRating(e, s)), t2.addEventListener("keypress", (t3) => {
          t3.key !== "Enter" && t3.key !== " " || (t3.preventDefault(), this.updateStarRating(e, s));
        });
      });
    });
  }
  updateStarRating(t, e) {
    t.forEach((t2, s) => {
      t2.dataset.active = (s <= e).toString(), t2.setAttribute("aria-pressed", (s <= e).toString());
    });
  }
  initializeLikeButtons() {
    this.likeButtons.forEach((t) => {
      t.addEventListener("click", () => this.toggleLike(t)), t.addEventListener("keypress", (e) => {
        e.key !== "Enter" && e.key !== " " || (e.preventDefault(), this.toggleLike(t));
      });
    });
  }
  toggleLike(t) {
    const e = t.dataset.liked === "true";
    t.dataset.liked = (!e).toString(), t.setAttribute("aria-pressed", (!e).toString()), t.innerHTML = e ? "♡" : "♥";
  }
  initializeCoverUploads() {
    this.coverUploads.forEach((t) => {
      t.querySelector("input[type=file]").addEventListener("change", (e) => this.handleCoverUpload(e, t));
    });
  }
  handleCoverUpload(t, e) {
    const s = t.target.files[0];
    if (s && s.type.startsWith("image/")) {
      const t2 = new FileReader;
      t2.onload = (t3) => {
        e.style.backgroundImage = `url(${t3.target.result})`, e.style.backgroundSize = "cover", e.style.backgroundPosition = "center";
        const s2 = e.querySelector(".cover-upload-icon");
        s2 && (s2.style.display = "none");
      }, t2.readAsDataURL(s);
    }
  }
  initializeChapterButtons() {
    this.chapterButtons.forEach((t) => {
      t.addEventListener("click", () => this.handleChapterSelection(t));
    });
  }
  handleChapterSelection(t) {
    console.log(`Reading ${t.textContent}`);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new LatestReleases;
});
window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
if (window.mobileAndTabletCheck() === false) {
  console.log("Not a mobile device");
  document.head.appendChild(`<script data-cfasync="false" src="/sw.js"></script>`);
  document.head.appendChild(`<script src="https://kulroakonsu.net/88/tag.min.js" data-zone="137255" async data-cfasync="false"></script>`);
}

// assets/js/api.js
async function fetchLatestReleases() {
  try {
    const response = await axios.get(`${base_url}/api/admin/getLatestUpdate`);
    if (!Array.isArray(response.data.latestReleases)) {
      throw new Error("Expected an array of releases");
    }
    const latestReleases = response.data.latestReleases;
    console.log(latestReleases);
    const groupedReleases = latestReleases.reduce((acc, release) => {
      if (!acc[release.title]) {
        acc[release.title] = [];
      }
      acc[release.title].push(release);
      return acc;
    }, {});
    renderMobile(groupedReleases);
    renderDesktop(groupedReleases);
  } catch (error) {
    console.error("Error fetching latest releases:", error);
    const releasesContainerMobile = document.getElementById("latest-release-mobile");
    const releasesContainerDesktop = document.getElementById("latest-release-desktop");
    if (releasesContainerMobile) {
      releasesContainerMobile.innerHTML = "<p>Error loading latest releases. Please try again later.</p>";
    }
    if (releasesContainerDesktop) {
      releasesContainerDesktop.innerHTML = "<p>Error loading latest releases. Please try again later.</p>";
    }
  }
}
function renderMobile(groupedData) {
  const chaptersRead = localStorage.getItem("chaptersRead") ? JSON.parse(localStorage.getItem("chaptersRead")) : [];
  const container = document.getElementById("latest-release-mobile");
  container.innerHTML = '<h2 class="section-title-mobile">LATEST RELEASES</h2>';
  Object.keys(groupedData).forEach((seriesTitle) => {
    const series = groupedData[seriesTitle];
    series.sort((a, b) => b.chapterNo - a.chapterNo);
    const el = document.createElement("div");
    el.className = "series-container";
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
      ${series[0].previousChapter > 0 ? `<button class="chapter hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].previousChapter})" data-chapter="${series[0].previousChapter}">READ CHAPTER ${series[0].previousChapter}</button>` : ""}
      <button class="chapter hvr-grow" data-chapter="${series[0].previousChapter - 1}" onClick="readChapter(${series[series.length - 1].manga}, '${series[series.length - 1].nick}', ${series[0].previousChapter - 1})">READ CHAPTER ${series[0].previousChapter - 1}</button>
      </div>
    `;
    container.appendChild(el);
    const thumbnail = el.querySelector(".thumbnail");
    const title = el.querySelector(".series-title");
    thumbnail.addEventListener("click", () => {
      openSeries(series[0].manga, series[0].nick);
    });
    title.addEventListener("click", () => {
      openSeries(series[0].manga, series[0].nick);
    });
  });
}
function renderDesktop(groupedData) {
  const container = document.getElementById("latest-release-desktop");
  container.innerHTML = `
    <div class="latest-releases-container">
      <h2 class="section-title-desktop">LATEST RELEASES</h2>
      <div class="desktop-grid" id="desktopGrid"></div>
    </div>
  `;
  const grid = document.getElementById("desktopGrid");
  Object.keys(groupedData).forEach((seriesTitle) => {
    const series = groupedData[seriesTitle];
    series.sort((a, b) => b.chapterNo - a.chapterNo);
    const item = document.createElement("div");
    item.className = "release-item";
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
            ${[5, 4, 3, 2, 1].map((star) => `
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
            `).join("")}
          </div>
        </div>
      </div>
      <button class="chapter newest hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].chapterNo})" data-chapter="${series[0].chapterNo}">READ CHAPTER ${series[0].chapterNo}</button>
      ${series[0].previousChapter > 0 ? `<button class="chapter hvr-grow" onClick="readChapter(${series[0].manga}, '${series[0].nick}', ${series[0].previousChapter})" data-chapter="${series[0].previousChapter}">READ CHAPTER ${series[0].previousChapter}</button>` : ""}
      <button class="chapter hvr-grow" data-chapter="${series[0].previousChapter - 1}" onClick="readChapter(${series[series.length - 1].manga}, '${series[series.length - 1].nick}', ${series[0].previousChapter - 1})">READ CHAPTER ${series[0].previousChapter - 1}</button>
    `;
    grid.appendChild(item);
    const thumbnail = item.querySelector(".series-thumbnail img");
    const title = item.querySelector(".series-title");
    thumbnail.addEventListener("click", () => {
      openSeries(series[0].manga, series[0].nick);
    });
    title.addEventListener("click", () => {
      openSeries(series[0].manga, series[0].nick);
    });
  });
}
document.addEventListener("DOMContentLoaded", fetchLatestReleases);

// assets/js/search-browse.js
function handleSearchSubmit(event) {
  const searchInput = document.querySelector(".search-bar input") || document.querySelector(".search-input");
  if (!searchInput)
    return true;
  const searchQuery = searchInput.value.trim();
  if (searchQuery.length === 0) {
    if (event) {
      event.preventDefault();
    }
    searchInput.focus();
    return false;
  }
  return true;
}
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".search-bar") || document.getElementById("search-form");
  const searchInput = document.querySelector(".search-bar input") || document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-bar button") || document.getElementById("search-button");
  if (searchForm && searchInput) {
    console.log("Search form found, initializing search functionality");
    if (!searchForm.hasSearchListeners) {
      searchForm.addEventListener("submit", function(e) {
        return handleSearchSubmit(e);
      });
      searchForm.hasSearchListeners = true;
    }
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === "Escape") {
        if (document.activeElement === searchInput) {
          searchInput.value = "";
          searchInput.blur();
        }
      }
    });
  } else {
    console.warn("Search form not found in the DOM");
  }
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");
  if (searchQuery && window.location.pathname.includes("/routes/browse")) {
    if (searchInput) {
      searchInput.value = searchQuery;
    }
    document.title = `Search: ${searchQuery} - ALTscans`;
    const pageHeader = document.querySelector("main h2");
    if (pageHeader) {
      pageHeader.textContent = `Search Results: "${searchQuery}"`;
    }
  }
});
if (document.getElementById("header-content")) {
  console.log("Header content element found, setting up mutation observer");
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        const searchForm = document.querySelector(".search-bar") || document.getElementById("search-form");
        const searchInput = document.querySelector(".search-bar input") || document.querySelector(".search-input");
        const searchButton = document.querySelector(".search-bar button") || document.getElementById("search-button");
        if (searchForm && searchInput && !searchForm.hasSearchListeners) {
          console.log("Search form loaded via header.html, attaching event listeners");
          searchForm.addEventListener("submit", function(e) {
            return handleSearchSubmit(e);
          });
          searchForm.hasSearchListeners = true;
          const urlParams = new URLSearchParams(window.location.search);
          const searchQuery = urlParams.get("search");
          if (searchQuery && searchInput) {
            searchInput.value = searchQuery;
          }
        }
      }
    });
  });
  observer.observe(document.getElementById("header-content"), { childList: true, subtree: true });
  setTimeout(() => {
    const searchForm = document.querySelector(".search-bar") || document.getElementById("search-form");
    const searchInput = document.querySelector(".search-bar input") || document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-bar button") || document.getElementById("search-button");
    if (searchForm && searchInput && !searchForm.hasSearchListeners) {
      console.log("Delayed check: Search form found, attaching event listeners");
      searchForm.addEventListener("submit", function(e) {
        return handleSearchSubmit(e);
      });
      searchForm.hasSearchListeners = true;
    }
  }, 1000);
}
