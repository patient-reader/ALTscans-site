// Cookies
const cookie = document.cookie;
const token = cookie.split(';').find(row => row.trim().startsWith('token='));
const userId = cookie.split(';').find(row => row.trim().startsWith('userId='));

// Hide profile input
document.querySelector('.profile-input').setAttribute('style', 'display: none;')

if (token && userId) {
    const tokenValue = token.split('=')[1];
    const userIdValue = userId.split('=')[1];

    async function loadProfile() {
        function formatText(text) {
            if (!text) return ""; // Add null check
            return text
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }

        try {
            let response = await axios.get(`${base_url}/api/user/${userIdValue}`, {
                headers: {
                    Authorization: `${frontoken}`,
                    'x-user-token': `${tokenValue}`
                }
            });

            const username = document.querySelector('.profile-username');
            const profileId = document.querySelector('.profile-id');
            const bio = document.querySelector('.profile-bio');
            const profileImageContainer = document.querySelector('.profile-image-container');
            const bookmarkList = document.querySelector('.bookmarks-list');
            const bannerContainer = document.querySelector('.banner-container');
            
            console.log(response.data);
            username.textContent = response.data.username;
            profileId.textContent = `ID: ${userIdValue}`;
            bio.value = response.data.bio || "";
            profileImageContainer.innerHTML = `<img src="${response.data.username === 'Destic' ? 'https://ik.imagekit.io/zkkmiqvpqa/pfp/cursed.jpeg ' : response.data.profilePicture}" alt="Profile Image" class="profile-image" id="profile-image">`;
            bannerContainer.style.backgroundImage = `url(${response.data.banner})`;
            
            let bookmarks = response.data.bookmark || [];
            bookmarkList.innerHTML = ''; // Clear the list before adding new items
            bookmarks.forEach(bookmark => {
                const bookmarkItem = document.createElement('div');
                bookmarkItem.classList.add('bookmark-item');
                bookmarkItem.innerHTML = `
                    <div class="bookmark-image">
                        <img src="${bookmark.thumbnail || ''}" alt="${formatText(bookmark.series)} cover">
                    </div>
                    <div class="bookmark-details">
                        <h3 class="bookmark-title">${formatText(bookmark.series)}</h3>
                        <div class="bookmark-info">Viewed: <span class="chapter-viewed">${bookmark.lastRead}</span></div>
                        <div class="bookmark-info">Current: <span class="chapter-current">${bookmark.currentChapter || 0}</span></div>
                        <div class="bookmark-info">Last updated: ${formatDate(bookmark.lastUpdated)}</div>
                    </div>
                    <button class="remove-btn remove-bookmark" aria-label="Remove bookmark">Remove</button>
                `;
                bookmarkList.appendChild(bookmarkItem);

                // Attach event listener to the remove button
                bookmarkItem.querySelector('.remove-bookmark').addEventListener('click', () => removeBookmark(bookmark.series));
            });

        } catch (error) {
            console.error(error);
        }
    }

// ======================== Update Bookmarks Functions ========================
    async function updateProfile() {
        try {
            const bio = document.querySelector('.profile-bio').value;

            let response = await axios.put(`${base_url}/api/user/${userIdValue}`, {
                type: `user-update`,
                bio: escapeHtml(bio)
            }, {
                headers: {
                    Authorization: `${frontoken}`,
                    'x-user-token': `${tokenValue}`
                }
            });

            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

// ======================== Remove Bookmark Functions ========================
    async function removeBookmark(series) {
        try {
            let response = await axios.delete(`${base_url}/api/user/${userIdValue}/bookmarks`, {
                headers: {
                    Authorization: `${frontoken}`,
                    'x-user-token': `${tokenValue}`
                },
                data: {
                    seriesName: series
                }
            });

            console.log(response.data);

            if (response.data.message === 'Bookmark removed successfully' && response.status === 200) {
                alert('Bookmark removed successfully');
                // Optionally, reload the profile to reflect the changes
                loadProfile();
            }

        } catch (error) {
            console.error(error);
        }
    }

// ======================== Logout Function ========================
    async function logout() {
        try {
            // Delete cookies by setting expiration to past date
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            window.location.href = '/login';
        } catch (error) {
            console.error(error);
        }
    }

// ======================== Profile Picture Upload Functions ========================
    
    function triggerProfileUpload() {
      document.querySelector('.profile-input').setAttribute('style', 'display: initial;')
    }

    function handleProfileUpload(event) {
        const file = event.target.files[0];

        if (file) {
          // Check file type
          const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!validTypes.includes(file.type)) {
              alert('Please select an image file (JPEG, PNG, or GIF)');
              event.target.value = '';
              return;
          }

          
          // Check if file size exceeds 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB. Please choose a smaller file.');
                return;
            }

            // Read the file and display a preview
            const reader = new FileReader();
            reader.onload = function (e) {
                const profileImageContainer = document.querySelector('.profile-image-container');
                profileImageContainer.innerHTML = `<img src="${e.target.result}" alt="Profile Image" class="profile-image" id="profile-image">`;
            };
            reader.readAsDataURL(file);

            // Upload the file to the server
            uploadProfileImage(file);
        }
    }

    // Function to upload the profile image to the server
    async function uploadProfileImage(file) {
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            let response = await axios.put(`${base_url}/api/user/${userIdValue}`, formData, {
                headers: {
                    Authorization: `${frontoken}`,
                    'x-user-token': `${tokenValue}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response.data);
            if (response.status === 200) {
                alert('Profile image updated successfully');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to upload profile image. Please try again.');
        }
    }

// ======================== Banner Upload Functions ========================

function triggerBannerUpload() {
    document.getElementById('banner-input').click();
}

function handleBannerUpload(event) {
    const file = event.target.files[0];

    if (file) {
        // Check if file size exceeds 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB. Please choose a smaller file.');
            return;
        }

        // Read the file and display a preview
        const reader = new FileReader();
        reader.onload = function (e) {
            const bannerContainer = document.querySelector('.banner-container');
            bannerContainer.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);

        // Upload the file to the server
        uploadBannerImage(file);
    }
}

// Function to upload the banner image to the server
async function uploadBannerImage(file) {
    const formData = new FormData();
    formData.append('bannerImage', file);

    try {
        let response = await axios.put(`${base_url}/api/user/${userIdValue}`, formData, {
            headers: {
                Authorization: `${frontoken}`,
                'x-user-token': `${tokenValue}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log(response.data);
        if (response.status === 200) {
            alert('Banner image updated successfully');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to upload banner image. Please try again.');
    }
}
    
    // Add event listener to the profile image input
    document.querySelector('.profile-image-container').addEventListener('click', triggerProfileUpload);
    document.querySelector('.profile-input').addEventListener('change', handleProfileUpload);
    document.querySelector('.logout').addEventListener('click', logout);
    document.querySelector('.saveBio').addEventListener('click', updateProfile);

    document.addEventListener('DOMContentLoaded', loadProfile);
} else {
    console.error('Token or userId not found in cookies');
    window.location.href = '/login';
}
