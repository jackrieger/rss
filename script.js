document.addEventListener("DOMContentLoaded", function() {
  // CORS proxy
  const proxy = 'https://corsproxy.io/?';

  // Feed URLs
  const feedUrls = [
    proxy + encodeURIComponent('https://hnrss.org/frontpage.atom'),
    proxy + encodeURIComponent('https://world.hey.com/dhh/feed.atom')
  ];

  // Fetch feeds
  feedUrls.forEach(url => fetchAndParseFeed(url));
});

function fetchAndParseFeed(feedUrl) {
  fetch(feedUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      const items = data.querySelectorAll("entry");
      let content = document.querySelector("#feed-content");

      items.forEach(item => {
        const title = item.querySelector("title").textContent;
        const linkElement = item.querySelector("link");
        const link = linkElement ? linkElement.getAttribute("href") : null;

        // Append to content div, if link is present
        if(link) {
          content.innerHTML += `<p><a href="${link}" target="_blank">${title}</a></p>`;
        }
      });
    })
    .catch(error => console.error("Error fetching or parsing feed:", error));
}
