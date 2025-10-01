console.log("script.js loaded");

// ======== CONFIG ========
const API_KEY = "2FDsYVOUVJS1lMzRtBFrzZs9E7oZT6BW";
const BASE_URL = "https://api.giphy.com/v1/gifs/search";
let endpoint = "https://api.giphy.com/v1/gifs/search?api_key=2FDsYVOUVJS1lMzRtBFrzZs9E7oZT6BW&q=McLaren&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips";

const DEFAULT_QUERY = "McLaren";
const DEFAULT_LIMIT = 25;

// ======== DOM ========
const $input = document.querySelector("#search-input");          // search text box
const $fetchBtn = document.querySelector("#fetch-gif-btn");      // <input id="fetch-gif-btn">
const $grid = document.querySelector("#gif-container");

// ======== RENDER HELPERS ========
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

// ======== FETCH (refactored to use string interpolation) ========
async function fetchGifs(query) {
  try {
    const q = (query && query.length ? query : DEFAULT_QUERY).trim();
    // Use template literals + encodeURIComponent to interpolate the query
    endpoint = `${BASE_URL}?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=${DEFAULT_LIMIT}&offset=0&rating=g&lang=en&bundle=messaging_non_clips`;

    showMessage("Loading…");

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderGifs(data.data);
  } catch (err) {
    console.error(err);
    showMessage("Something went wrong while fetching GIFs. Please try again.");
  }
}

// ======== Debounce for live-typing search ========
function debounce(fn, delay = 300) {
  let t;
  function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  }
  debounced.flush = () => {
    clearTimeout(t);
    fn();
  };
  return debounced;
}

// ======== INIT ========
document.addEventListener("DOMContentLoaded", () => {
  // Initial load
  fetchGifs(DEFAULT_QUERY);

  // Button click → get input.value and fetch
  if ($fetchBtn) {
    $fetchBtn.addEventListener("click", () => {
      const term = ($input?.value || "").trim();
      fetchGifs(term);
      // Tip: add a console to verify your value while debugging
      console.log("Searching for:", term);
      console.log("Request URL:", endpoint);
    });
  }

  // live search as user types
  if ($input) {
    const onType = debounce(() => {
      const term = ($input.value || "").trim();
      fetchGifs(term || DEFAULT_QUERY);
      console.log("Live term:", term);
    }, 400);
    $input.addEventListener("input", onType);

    // Enter key → instant fetch
    $input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        fetchGifs(($input.value || "").trim());
      }
    });
  }
});
