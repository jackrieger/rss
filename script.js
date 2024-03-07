document.addEventListener("DOMContentLoaded", function() {
  const proxy = 'https://corsproxy.io/?';
  const feedUrls = [
    { url: proxy + encodeURIComponent('https://hnrss.org/frontpage.atom'), className: "hacker-news", maxItems: 10 },
    { url: proxy + encodeURIComponent('https://world.hey.com/dhh/feed.atom'), className: "dhh-feed", maxItems: 5 },
    { url: proxy + encodeURIComponent('https://tim.blog/feed/'), className: "tim-blog", maxItems: 5 }
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
    .then(str => {
      // Use DOMParser for 'text/xml', which should be compatible with RSS 2.0
      const data = (new window.DOMParser()).parseFromString(str, "text/xml");
      return className.includes("tim-blog") ? data.querySelectorAll("item") : data.querySelectorAll("entry");
    })
    .then(items => {
      let column = document.querySelector(`.${className}`);
      let htmlContent = '';

      items.forEach((item, index) => {
        if (index < maxItems) {
          // The element names in RSS 2.0 are 'title' and 'link', same as Atom, but the summary/content might differ.
          const title = item.querySelector("title").textContent;
          const link = item.querySelector("link").textContent; // 'link' element in RSS 2.0 contains text content directly
          let blurb = "";
          // For RSS 2.0, the description element is often used instead of summary
          const description = item.querySelector("description") ? item.querySelector("description").textContent : '';
          blurb = description.length > 200 ? `${description.substring(0, 200)}...` : description;

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
