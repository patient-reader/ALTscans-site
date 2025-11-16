//Final Commit For Month - March 2025
const base_url = `https://api.alternativescans.icu`;
const frontoken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNlIxVVNhdHEhdE5oZGgkV05OaHAiLCJpYXQiOjE3NDgzNzMyODl9.qtzXR_F-xqq0p_gEr3FPu5I8-oaUQ2kkcVej4EMZ6qI`;
const discordUrl = `https://discord.com/oauth2/authorize?client_id=1326916685655052369&response_type=code&redirect_uri=https%3A%2F%2Falternativescans.icu%2Flogin&scope=identify+email`;
//For dev
//const discordUrl = `https://discord.com/oauth2/authorize?client_id=1326916685655052369&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A6556%2Flogin&scope=identify+email`

/* Keyboard Shortcuts for Reader Page:
 * ← (Left Arrow): Previous chapter
 * → (Right Arrow): Next chapter
 * Home: Go to first chapter
 * End: Go to last chapter
 * Space / Page Down: Scroll down
 * Page Up: Scroll up
 * F: Toggle fullscreen
 * H: Return to home page
 * 0-9: Jump to chapter by percentage (1=10%, 5=50%, 0=100%)
 * ?: Show keyboard shortcuts help
 */

// Common Functions

// Function to set a cookie with an expiration time
function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/`;
}

function openSeries(manga, nick) {
  window.location.href = `/series/?series=${nick}&id=${manga}`;
}

function formatTitle(title) {
  if (!title) return ""; // Add null check
  return title
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncateDescription(desc, wordLimit) {
  const words = desc.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return desc;
}

function getTokenValue() {
  const cookie = document.cookie;
  const token = cookie
    .split(";")
    .find((row) => row.trim().startsWith("token=")) || "";
  
  if (token === null || token.split("=")[1] === null || token.split("=")[1] === "" || token.split("=")[1] === undefined) {
    console.log("No user token found. User not logged in.");
    return null;
  }
  
  return token ? token.split("=")[1] : null;
}

function getUserIdValue() {
  const cookie = document.cookie;
  const userId = cookie
    .split(";")
    .find((row) => row.trim().startsWith("userId="));
  
  if (userId === null) {
    console.log("No user id found. User not logged in.");
    return null;
  }
  
  return userId ? userId.split("=")[1] : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const backToTopButton = document.getElementById("backToTopBtn");

  window.addEventListener("scroll", () => {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      backToTopButton.style.display = "flex";
    } else {
      backToTopButton.style.display = "none";
    }
  });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  async function fetchUserProfile() {
    const token = getTokenValue();
    const userId = getUserIdValue();
    if (!token || !userId) return null;

    try {
      const response = await axios.get(`${base_url}/api/user/${userId}`, {
        headers: {
          Authorization: `${frontoken}`,
          "x-user-token": `${token}`,
        },
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

  // Function to check if the account exists and verify it if needed
  async function checkAndVerifyAccount() {
    const token = getTokenValue();
    const userId = getUserIdValue();
    const lastVerified = localStorage.getItem("lastVerified");
    console.log("Checking account...");
    if (token && userId) {
      const currentTime = new Date().getTime();
      const lastVerifiedTime = lastVerified
        ? new Date(lastVerified).getTime()
        : 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // If more than 24 hours have passed since the last verification
      if (currentTime - lastVerifiedTime > twentyFourHours) {
        try {
          console.log("Verifying account...");
          const response = await axios.post(
            `${base_url}/api/auth/verifySession`,
            {
              userId: userId,
              token: token,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
              },
            },
          );

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

  // Function to set up background verification every 24 hours
  function setupBackgroundVerification() {
    setInterval(checkAndVerifyAccount, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }

  // Fetch and display user profile information
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
  // Call checkAndVerifyAccount function
  await checkAndVerifyAccount();
  setupBackgroundVerification(); // Set up background verification
  await displayUserProfile(); // Display user profile information
});


document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", function() {
        document.querySelector(".mobilePopNav").setAttribute("style", "display: flex;");
    });
});
