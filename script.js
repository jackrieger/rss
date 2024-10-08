const feeds = [
  {
    id: "dhh",
    display_name: "DHH",
    link: "https://world.hey.com/dhh",
    feed: "https://world.hey.com/dhh/feed.atom",
    cards_per: 10
  },
  {
    id: "hacker-news",
    display_name: "Hacker News",
    link: "https://news.ycombinator.com/",
    feed: "https://hnrss.org/newest",
    cards_per: 10
  },
  {
    id: "tim-ferriss",
    display_name: "Tim Ferriss",
    link: "https://tim.blog",
    feed: "https://tim.blog/feed/",
    cards_per: 5
  }
];

feeds.forEach(feed => {
  fetchFeed(feed);
});

function fetchFeed(feed) {
  const proxyUrl = "https://corsproxy.io/?";
  const cacheBustParam = `cacheBust=${new Date().getTime()}`;
  const feedUrl = encodeURIComponent(`${feed.feed}?${cacheBustParam}`);
  fetch(`${proxyUrl}${feedUrl}`)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => displayFeed(data, feed))
    .catch(err => console.error("Failed to fetch feed:", err));
}

function displayFeed(data, feed) {
  let items;
  // Check if the feed is Atom or RSS by looking for the feed tag (Atom) vs. rss tag (RSS)
  if (data.querySelector("feed")) {
    items = Array.from(data.querySelectorAll("entry")).slice(0, feed.cards_per);
  } else {
    items = Array.from(data.querySelectorAll("item")).slice(0, feed.cards_per);
  }

  let html = `
    <h2>
      <a href="${feed.link}" target="_blank">
        ${feed.display_name}
      </a>
    </h2>
  `;

  items.forEach(item => {
    let title, link;
    if (item.querySelector("title")) {
      title = item.querySelector("title").textContent;
    } else {
      title = "No title";
    }

    // Atom feeds use <link href="URL"> while RSS uses <link>URL</link>
    if (item.querySelector("link[href]")) {
      link = item.querySelector("link[href]").getAttribute("href");
    } else if (item.querySelector("link")) {
      link = item.querySelector("link").textContent;
    } else {
      link = "#";
    }

    html += `
      <a href="${link}" class="card" target="_blank">
        ${title}
      </a>
    `;
  });

  document.querySelector(`#${feed.id}`).innerHTML = html;
}
