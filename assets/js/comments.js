function toggleCommentOptions() {
    const options = document.getElementById('comment-options');
    const button = document.querySelector('.icon-button');
    const isHidden = options.hidden;

    options.hidden = !isHidden;
    button.setAttribute('aria-expanded', !isHidden);
}

function switchTab(type) {
    const tabs = document.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
    });

    panels.forEach(panel => {
        panel.hidden = true;
    });

    const selectedTab = document.getElementById(`${type}-tab`);
    const selectedPanel = document.getElementById(`${type}-panel`);

    selectedTab.setAttribute('aria-selected', 'true');
    selectedPanel.hidden = false; 
}

// Set Disqus as the default comment section on page load
document.addEventListener('DOMContentLoaded', () => {
    switchTab('disqus');
});
