document.addEventListener('DOMContentLoaded', function() {
    fetch('/assets/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-content').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));
});

fetch('/assets/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('header-content').innerHTML = data;
    })
    .catch(error => console.error('Error loading header:', error));
