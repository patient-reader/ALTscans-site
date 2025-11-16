async function handleBookmarkClick(bookmarkBtn, series) {
  const tokenValue = getTokenValue();
  const userIdValue = getUserIdValue();
  const seriesName = series.title;
  const bookmarked = bookmarkBtn.classList.contains('bookmarked');

  if (bookmarked) {
    // Remove from bookmarks
    bookmarkBtn.classList.remove('bookmarked');
    bookmarkBtn.setAttribute('aria-label', 'Bookmark this series');
    alert(`Removed ${seriesName} from bookmarks.`);
  } else {
    // Add to bookmarks
    let bookmarkReq = await axios.post(`${base_url}/api/user/${userIdValue}/bookmarks`, {
      seriesId: series.id,
      seriesName: series.title,
      thumbnail: series.thumbnail || ''
    }, {
      headers: {
        Authorization: `${frontoken}`,
        'x-user-token': `${tokenValue}`
      }
    });

    if (bookmarkReq.status === 200) {
      bookmarkBtn.classList.add('bookmarked');
      bookmarkBtn.classList.toggle('active');
      bookmarkBtn.setAttribute('aria-label', 'Unbookmark this series');
      alert(`Added ${seriesName} to bookmarks.`);
    }
  }
}

async function checkIfBookmarked(series) {
  const tokenValue = getTokenValue();
  const userIdValue = getUserIdValue();

  if(tokenValue === null){
    return null;
  }
  
  if(userIdValue === null){
    return null;
  }
  
  let response = await axios.get(`${base_url}/api/user/${userIdValue}`, {
    headers: {
      Authorization: `${frontoken}`,
      'x-user-token': `${tokenValue}`
    }
  });

  let bookmarks = response.data.bookmark || [];
  return bookmarks.some(bookmark => bookmark.series === series.title);
}
