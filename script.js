const feeds = [
  {
    id: "hacker-news",
    link: "https://news.ycombinator.com/",
    feed: "https://hnrss.org/newest",
    cards_per: 10
  },
  {
    id: "dhh",
    link: "https://world.hey.com/dhh",
    feed: "https://world.hey.com/dhh/feed.atom",
    cards_per: 10
  },
  {
    id: "tim-ferriss",
    link: "https://tim.blog",
    feed: "https://tim.blog/feed/",
    cards_per: 10
  }
];

feeds.forEach(feed => {
  fetchFeed(feed);
});

function fetchFeed(feed) {
  const proxyUrl = "https://corsproxy.io/?";
  const feedUrl = encodeURIComponent(feed.feed);
  fetch(`${proxyUrl}${feedUrl}`)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => displayFeed(data, feed))
    .catch(err => console.error("Failed to fetch feed:", err));
}

function displayFeed(data, feed) {
  const items = Array.from(data.querySelectorAll("item")).slice(0, feed.cards_per);
  let html = `<h2><a href="${feed.link}" target="_blank">${feed.id.replace(/-/g, ' ').toUpperCase()}</a></h2>`;

  items.forEach(item => {
    const title = item.querySelector("title") ? item.querySelector("title").textContent : "No title";
    const link = item.querySelector("link") ? item.querySelector("link").textContent : "#";

    html += `
      <div class="card">
        <a href="${link}" target="_blank">${title}</a>
      </div>
    `;
  });

  document.querySelector(`#${feed.id}`).innerHTML = html;
}
