const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");
let lastScrollTop = 0;

// Toggle active link with underline
navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});


window.addEventListener("scroll", function () {
  const currentScroll =
    window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > lastScrollTop) {
    // Scrolling down
    navbar.classList.add("hidden");
  } else {
    // Scrolling up
    navbar.classList.remove("hidden");
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});



  const cardContainer = document.getElementById("cardContainer");
  const paginationContainer = document.getElementById("paginationContainer");
  const showingText = document.getElementById("showing-text");
  const showSelect = document.getElementById("show");
  const sortSelect = document.getElementById("sort");

  function getParam(key, def) {
    const url = new URL(location.href);
    return url.searchParams.get(key) || def;
  }

  function setParams(params) {
    const url = new URL(location.href);
    Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
    history.replaceState(null, '', url.toString());
  }

  let currentPage = parseInt(getParam("page", "1"));
  let perPage = parseInt(getParam("size", "10"));
  let sortOrder = getParam("sort", "desc");

  showSelect.value = perPage;
  sortSelect.value = sortOrder;

  async function fetchData() {
    const sortValue = sortOrder === "asc" ? "published_at" : "-published_at";
    const url = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sortValue}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error("API error");

      const result = await response.json();
      console.log(result.data[0]); 
      
      const items = result.data.map((item) => ({
        title: item.title,
        published_at: item.published_at,
        thumbnail:
          item.small_image?.[0]?.url ||
          "https://via.placeholder.com/400x225?text=No+Image",
      }));


    //   const items = result.data.map((item) => ({
    //     title: item.title,
    //     published_at: item.published_at,
    //     // thumbnail: item.small_image?.url || "https://via.placeholder.com/400x225?text=No+Image"
    //     thumbnail:item.small_image?.[0]?.url ||"https://via.placeholder.com/400x225?text=No+Image"
    //   }));

      renderCards(items);
      renderPagination(result.meta.last_page);
      const start = (currentPage - 1) * perPage;
      showingText.textContent = `Showing ${start + 1} - ${start + items.length} of ${result.meta.total}`;
    } catch (err) {
      showingText.textContent = "Gagal memuat data.";
      console.error("Fetch error:", err);
    }
  }

  function renderCards(items) {
    cardContainer.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
      <div class="image-wrapper">
        <img loading="lazy" src="${item.thumbnail}" alt="Gambar Artikel">
      </div>
      <div class="card-content">
        <small>${new Date(item.published_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}</small>
        <h4>${item.title}</h4>
      </div>
    `;
      cardContainer.appendChild(card);
    });
  }


 

  function renderPagination(totalPages) {
    paginationContainer.innerHTML = "";
    const createBtn = (label, page) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      if (page === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = page;
        setParams({ page: currentPage, size: perPage, sort: sortOrder });
        fetchData();
      };
      return btn;
    };

    if (currentPage > 1)
      paginationContainer.appendChild(createBtn("«", currentPage - 1));

    for (let i = 1; i <= totalPages; i++) {
      if (i <= 3 || i > totalPages - 2 || Math.abs(i - currentPage) <= 1) {
        paginationContainer.appendChild(createBtn(i, i));
      } else if (i === 4 || i === totalPages - 2) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        paginationContainer.appendChild(dots);
      }
    }

    if (currentPage < totalPages)
      paginationContainer.appendChild(createBtn("»", currentPage + 1));
  }

  showSelect.addEventListener("change", () => {
    perPage = parseInt(showSelect.value);
    currentPage = 1;
    setParams({ page: currentPage, size: perPage, sort: sortOrder });
    fetchData();
  });

  sortSelect.addEventListener("change", () => {
    sortOrder = sortSelect.value;
    currentPage = 1;
    setParams({ page: currentPage, size: perPage, sort: sortOrder });
    fetchData();
  });

  fetchData();

const proxyImage = (originalUrl) => {
  const cleanUrl = originalUrl.replace(/^https?:\/\//, ""); 
  return `https://images.weserv.nl/?url=${cleanUrl}`;
};


