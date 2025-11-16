function handleClick(element, url) {
    element.classList.add('clicking');
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

let prof = document.getElementById("profile-action");
prof.onclick = function() {
    location.href = "/login.html"
};

function readChapter(manga, nick, chapter){
  Locationwindow.location.href = `${baseUrl}/reader.html?series=${nick}&chapter=${chapter}&id=${manga}`;
}