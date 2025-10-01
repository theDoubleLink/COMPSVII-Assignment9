console.log("script.js loaded");

// ======== CONFIG ========
const API_KEY = "2FDsYVOUVJS1lMzRtBFrzZs9E7oZT6BW";
const BASE_URL = "https://api.giphy.com/v1/gifs/search";

let endpoint =
  "https://api.giphy.com/v1/gifs/search?api_key=2FDsYVOUVJS1lMzRtBFrzZs9E7oZT6BW&q=McLaren&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips";

// Defaults for searches
const DEFAULT_QUERY = "McLaren Indycar";
const DEFAULT_LIMIT = 25;

// ======== DOM ========
const $input = document.getElementById("search-input");
const $grid = document.getElementById("gif-container");

// ======== UTIL ========
function buildUrl(query, { limit = DEFAULT_LIMIT, offset = 0, rating = "g", lang = "en", bundle = "messaging_non_clips" } = {}) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    q: query,
    limit: String(limit),
    offset: String(offset),
    rating,
    lang,
    bundle
  });
  return `${BASE_URL}?${params.toString()}`;
}

function createCol(html) {
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
  col.innerHTML = html;
  return col;
}

function clearGrid() {
  $grid.innerHTML = "";
}

function showMessage(text) {
  clearGrid();
  const col = createCol(`
    <div class="card p-3 text-center gif-card">
      <div class="muted">${text}</div>
    </div>
  `);
  // Fill row with one centered message
  col.classList.add("mx-auto");
  $grid.appendChild(col);
}

function renderGifs(gifs) {
  clearGrid();
  if (!gifs || gifs.length === 0) {
    showMessage("No results. Try another search.");
    return;
  }

  const frag = document.createDocumentFragment();

  gifs.forEach(g => {
    const { images, title, url } = g;
    // Prefer a reasonable size with good quality
    const imgSrc = images?.downsized_medium?.url || images?.original?.url || images?.fixed_height?.url;

    const cardHtml = `
      <div class="card border-0 gif-card h-100">
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
          <img src="${imgSrc}" alt="${title || "GIF"}" class="gif-img">
        </a>
        <div class="p-2">
          <div class="muted text-truncate" title="${title || "Giphy GIF"}">${title || "Giphy GIF"}</div>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="stretched-link"></a>
        </div>
      </div>
    `;
    frag.appendChild(createCol(cardHtml));
  });

  $grid.appendChild(frag);
}

async function fetchGifs(query) {
  try {
    const url = buildUrl(query || DEFAULT_QUERY);
    // Keep `endpoint` variable in sync with the last requested URL
    endpoint = url;

    showMessage("Loading…");

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    renderGifs(data.data);
  } catch (err) {
    console.error(err);
    showMessage("Something went wrong while fetching GIFs. Please try again.");
  }
}

// Debounce helper to avoid spamming the API while typing
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ======== INIT ========
document.addEventListener("DOMContentLoaded", () => {
  // Initial load with default query
  fetchGifs(DEFAULT_QUERY);

  // Live searching as the user types 
  const onType = debounce(() => {
    const q = ($input.value || "").trim();
    if (q.length === 0) {
      fetchGifs(DEFAULT_QUERY);
    } else {
      fetchGifs(q);
    }
  }, 400);

  if ($input) {
    $input.addEventListener("input", onType);
    // Allow Enter to force fetch immediately
    $input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onType.flush ? onType.flush() : fetchGifs(($input.value || "").trim() || DEFAULT_QUERY);
      }
    });
  }
});
