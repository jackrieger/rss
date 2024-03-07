document.addEventListener("DOMContentLoaded", function() {
  const proxy = 'https://corsproxy.io/?';
  const feedUrls = [
    { url: proxy + encodeURIComponent('https://hnrss.org/frontpage.atom'), className: "hacker-news", maxItems: 10 },
    { url: proxy + encodeURIComponent('https://world.hey.com/dhh/feed.atom'), className: "dhh-feed", maxItems: 5 },
    { url: proxy + encodeURIComponent('https://tim.blog/feed/'), className: "tim-blog", maxItems: 5 } // Added Tim Ferriss's blog feed
  ];

  feedUrls.forEach(feed => fetchAndParseFeed(feed.url, feed.className, feed.maxItems));
});

function fetchAndParseFeed(feedUrl, className, maxItems) {
  fetch(feedUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for ${className}`);
      }
      return response.text();
    })
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      const items = data.querySelectorAll("entry");
      let column = document.querySelector(`.${className}`);
      let htmlContent = '';

      items.forEach((item, index) => {
        if (index < maxItems) {
          const title = item.querySelector("title").textContent;
          const linkElement = item.querySelector("link");
          const link = linkElement ? linkElement.getAttribute("href") : null;
          let blurb = "";
          if (className === "dhh-feed" || className === "tim-blog") { // Check if feed needs a summary
            const summary = item.querySelector("summary") ? item.querySelector("summary").textContent : (item.querySelector("content") ? item.querySelector("content").textContent : "No summary available");
            blurb = summary.length > 200 ? `${summary.substring(0, 200)}...` : summary; // Truncate to 200 characters
          }

          htmlContent += `
            <div class="card">
              <a href="${link}" target="_blank" class="card-link">
                <span class="card-title">${title}</span>
                ${(className === "dhh-feed" || className === "tim-blog") ? `<p class="card-summary">${blurb}</p>` : ''}
              </a>
            </div>
          `;
        }
      });

      column.innerHTML = htmlContent;
    })
    .catch(error => console.error("Error fetching or parsing feed:", error));
};
