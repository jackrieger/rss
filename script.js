document.addEventListener("DOMContentLoaded", function() {
  const proxy = 'https://corsproxy.io/?';
  const feedUrls = [
    {url: proxy + encodeURIComponent('https://hnrss.org/frontpage.atom'), className: "hacker-news"},
    {url: proxy + encodeURIComponent('https://world.hey.com/dhh/feed.atom'), className: "dhh-feed"}
  ];

  feedUrls.forEach(feed => fetchAndParseFeed(feed.url, feed.className));
});

function fetchAndParseFeed(feedUrl, className) {
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
      let column = document.querySelector(`.${className}`);

      items.forEach(item => {
        const title = item.querySelector("title").textContent;
        const linkElement = item.querySelector("link");
        const link = linkElement ? linkElement.getAttribute("href") : null;

        if(link) {
          column.innerHTML += `<div class="card"><a href="${link}" target="_blank">${title}</a></div>`;
        }
      });
    })
    .catch(error => console.error("Error fetching or parsing feed:", error));
}
