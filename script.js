document.addEventListener("DOMContentLoaded", function() {
  const proxy = 'https://corsproxy.io/?';
  const feedUrls = [
    { url: proxy + encodeURIComponent('https://hnrss.org/frontpage.atom'), className: "hacker-news", maxItems: 10, sourceLink: 'https://news.ycombinator.com/' },
    { url: proxy + encodeURIComponent('https://world.hey.com/dhh/feed.atom'), className: "dhh-feed", maxItems: 5, sourceLink: 'https://world.hey.com/dhh' },
    { url: proxy + encodeURIComponent('https://tim.blog/feed/'), className: "tim-blog", maxItems: 5, sourceLink: 'https://tim.blog/' }
  ];

  feedUrls.forEach(feed => {
    fetchAndParseFeed(feed.url, feed.className, feed.maxItems, feed.sourceLink);
  });
});

function fetchAndParseFeed(feedUrl, className, maxItems, sourceLink) {
  fetch(feedUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for ${className}`);
      }
      return response.text();
    })
    .then(str => {
      // Use DOMParser for 'text/xml', which should be compatible with both Atom and RSS 2.0
      const data = (new window.DOMParser()).parseFromString(str, "text/xml");
      const isAtom = className !== "tim-blog";
      const items = isAtom ? data.querySelectorAll("entry") : data.querySelectorAll("item");
      return { items, isAtom };
    })
    .then(({ items, isAtom }) => {
      let column = document.querySelector(`.${className}`);
      let htmlContent = `<h2 class="feed-header"><a href="${sourceLink}" target="_blank">${className.replace(/-/g, ' ').toUpperCase()}</a></h2>`;

      items.forEach((item, index) => {
        if (index < maxItems) {
          const title = item.querySelector("title").textContent;
          const link = isAtom ? item.querySelector("link").getAttribute("href") : item.querySelector("link").textContent;
          let blurb = "";
          const summary = isAtom ? item.querySelector("summary") : item.querySelector("description");
          const content = summary ? summary.textContent : "No summary available";
          blurb = content.length > 200 ? `${content.substring(0, 200)}...` : content;

          htmlContent += `
            <div class="card">
              <a href="${link}" target="_blank" class="card-link">
                <span class="card-title">${title}</span>
                ${className !== "hacker-news" ? `<p class="card-summary">${blurb}</p>` : ''}
              </a>
            </div>
          `;
        }
      });

      column.innerHTML = htmlContent;
    })
    .catch(error => console.error("Error fetching or parsing feed:", error));
});
