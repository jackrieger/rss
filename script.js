document.addEventListener("DOMContentLoaded", function() {
  const proxy = 'https://corsproxy.io/?';
  const MAX_ITEMS_HACKER_NEWS = 10;
  const MAX_ITEMS_DHH_FEED = 5;

  const feedUrls = [
    {url: proxy + encodeURIComponent('https://hnrss.org/frontpage.atom'), className: "hacker-news", maxItems: MAX_ITEMS_HACKER_NEWS},
    {url: proxy + encodeURIComponent('https://world.hey.com/dhh/feed.atom'), className: "dhh-feed", maxItems: MAX_ITEMS_DHH_FEED}
  ];

  feedUrls.forEach(feed => fetchAndParseFeed(feed.url, feed.className, feed.maxItems));
});

function fetchAndParseFeed(feedUrl, className, maxItems) {
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
      let itemCount = 0;

      items.forEach((item, index) => {
        if (index < maxItems) {
          const title = item.querySelector("title").textContent;
          const linkElement = item.querySelector("link");
          const link = linkElement ? linkElement.getAttribute("href") : null;
          let blurb = "";
          if (className === "dhh-feed") {
            const summary = item.querySelector("summary") ? item.querySelector("summary").textContent : (item.querySelector("content") ? item.querySelector("content").textContent : "No summary available");
            blurb = summary.length > 200 ? `${summary.substring(0, 200)}...` : summary; // Truncate to 200 characters
          }

          if(link) {
            column.innerHTML += `<div class="card"><a href="${link}" target="_blank">${title}</a>${className === "dhh-feed" ? `<p>${blurb}</p>` : ''}</div>`;
          }
          itemCount++;
        }
      });
    })
    .catch(error => console.error("Error fetching or parsing feed:", error));
}
