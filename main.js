import api from "./API.js";

// Set constants and state variables
localStorage.clear();
const maxItemsPerPage = 40; // Maximum items to load per page
const itemsPerScroll = 8; // Items to load on each scroll event
let currentPage = 1; // Current page
let totalItems = 0; // Total number of items
let totalFetchedItems = 0; // Total fetched items for this page
const heroSection = document.getElementById("heroSection");
const paginationContainer = document.getElementById("pagination-container");




// Cache map for storing fetched data by page number
const pageDataCache = new Map();






// Fetch products based on the current page and items loaded
async function fetchProducts() {
    // If data for the current page is fully cached, use it directly
    if (pageDataCache.has(currentPage) && pageDataCache.get(currentPage).length === maxItemsPerPage) {
        return []; // Return an empty array to prevent refetching and let loadMoreProducts handle cached data
    }

    if (totalFetchedItems >= maxItemsPerPage) {
        return []; // Stop fetching if we've reached max items
    }

    const totalOffset = (currentPage - 1) * maxItemsPerPage + totalFetchedItems;

    try {
        const data = await api.limitedGet(itemsPerScroll, totalOffset);
        totalItems = data.total;

        if (!pageDataCache.has(currentPage)) {
            pageDataCache.set(currentPage, []);
        }

        pageDataCache.get(currentPage).push(...data.products);
        totalFetchedItems += data.products.length;
        return data.products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}




// Fetch and display more products within the current page
async function loadMoreProducts() {
    // If cached data for the page is incomplete, use it and avoid redundant fetch
    if (pageDataCache.has(currentPage)) {
        const cachedProducts = pageDataCache.get(currentPage).slice(totalFetchedItems, totalFetchedItems + itemsPerScroll);
        totalFetchedItems += cachedProducts.length;

        if (cachedProducts.length > 0) {
            console.log("cache");
            console.log(cachedProducts);
            displayProducts(cachedProducts);
            return; // Exit if using cached data
        }
    }

    // Fetch more products if cache is not enough
    const products = await fetchProducts();
    if (products.length > 0) {
        displayProducts(products);
    }
}



// Load and display products for the current page
async function loadPageProducts() {
    heroSection.innerHTML = ""; // Clear previous items
    totalFetchedItems = 0; // Reset fetched items count for new page
    const products = await fetchProducts();

    displayProducts(products); // Display the first batch
    updatePaginationControls();
}



// Append products to the page
function displayProducts(items) {
    let itemList = items
        .map(
            (item) => `
        <div class="card">
            <div class="card-wrapper">
                <div class="image"><img src="${item.thumbnail}" alt="${item.title}"></div>
                <h1 class="title">${item.title}</h1>
                <p class="price">${item.price} INR</p>
                <p class="description">${item.description}</p>
                <button class="add-to-cart-button" data-product-id="${item.id}">Add to Cart</button>
            </div>
        </div>`
        )
        .join("");

    heroSection.innerHTML += itemList; // Append new items to the section
}





// Scroll event listener with debounce
window.addEventListener("scroll", debounce(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMoreProducts();
    }
}, 500)); // Adjust the wait time as needed






// Pagination control updates for navigation
function updatePaginationControls() {
    paginationContainer.innerHTML = ""; // Clear existing pagination buttons

    const totalPages = Math.ceil(totalItems / maxItemsPerPage);
    const maxPagesToShow = 4; // Number of page links to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust start and end pages if we are near the beginning or end
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous Button
    const prevButton = document.createElement("button");
    prevButton.innerText = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        currentPage--;
        loadPageProducts();
    };
    paginationContainer.appendChild(prevButton);





    // Page Number Buttons
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = pageNumber;
        if (pageNumber === currentPage) pageButton.classList.add("active");
        pageButton.onclick = () => {
            currentPage = pageNumber;
            loadPageProducts();
        };
        paginationContainer.appendChild(pageButton);
    }




    // Next Button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = () => {
        currentPage++;
        loadPageProducts();
    };


    paginationContainer.appendChild(nextButton);
}






// Search Feature
function debounce(func, delay) {
    let debounceTimer;
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}



// Listen for input events on the search box
const searchInput = document.getElementById("search-input");



// Function to handle the search operation
async function handleSearch(event) {
    const keyword = event.target.value.trim();
    currentPage = 1; // Reset to first page on new search

    if (keyword.length > 0) {
        try {
            const products = await api.searchByKeyword(keyword);
            heroSection.innerHTML = ""; // Clear existing products
            displayProducts(products);
        } catch (error) {
            console.error("Error searching products:", error);
        }
    } else {
        loadPageProducts(); // Load default paginated products if input is cleared
    }
}



// Use debounce to control the search input calls
searchInput.addEventListener("input", debounce(handleSearch, 300));

// Add to Cart Function
async function addToCart(productId) {
    try {
        const items = await api.get();
        const product = items.find((item) => item.id == productId);
        if (product) {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(product);
            localStorage.setItem("cart", JSON.stringify(cart));
            incrementCartItemCount(cart.length);
        }
    } catch (error) {
        console.error("Error adding product to cart:", error);
    }
}




// Remove from Cart Function
function removeFromCart(productId) {
    try {
        let cart = JSON.parse(localStorage.getItem("cart"));
        cart = cart.filter((item) => item.id != productId);
        localStorage.setItem("cart", JSON.stringify(cart));
        incrementCartItemCount(cart.length);
    } catch (error) {
        console.error("Error removing product from cart:", error);
    }
}



// search bar eventlistner
heroSection.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("add-to-cart-button")) {
        const productId = event.target.getAttribute("data-product-id");
        if (event.target.innerText === "Add to Cart") {
            event.target.style.backgroundColor = "red";
            event.target.innerText = "Remove from cart";
            addToCart(productId);
        } else {
            event.target.style.backgroundColor = "#4caf50";
            event.target.innerText = "Add to Cart";
            removeFromCart(productId);
        }
    }
});



// Updating Cart Item Count
let cartItemCount = document.getElementById("no-of-cart-items");

function incrementCartItemCount(size) {
    if (size === 0) {
        let cartSize = JSON.parse(localStorage.getItem("cart"))?.length || 0;
        cartItemCount.innerText = cartSize;
    } else {
        cartItemCount.innerText = size;
    }
}

incrementCartItemCount(0);



// Handle Cart Redirection
let cart = document.getElementById("cart-logo");

cart.addEventListener("click", () => {
    window.location.href = "./cart.html";
});




// ----------------------------Modal Handling---------------------------
let postModalButton = document.getElementById("post-button");
let closeModalButton = document.getElementById("modal-close-button");
let postDataButton = document.getElementById("post-data");

postModalButton.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("form-modal-container").style.display = "block";
});

const modalCloser = () => {
    document.getElementById("form-modal-container").style.display = "none";
};

// ------------------close modal---------------
closeModalButton.addEventListener("click", modalCloser);

const isValidUrl = urlString=> {
    try { 
        return Boolean(new URL(urlString)); 
    }
    catch(e){ 
        return false; 
    }
}

//   // Validation function
  function validateForm(postObject) {
    const errors = [];

    if (!postObject.title || postObject.title.trim() === "") {
      errors.push("Product Title is required.");
    }
    if (!postObject.price || isNaN(postObject.price) || postObject.price <= 0) {
      errors.push("Product Price must be a positive number.");
    }
    if (!postObject.description || postObject.description.trim() === "") {
      errors.push("Product Description is required.");
    }
    if (!postObject.thumbnail || !isValidUrl(postObject.thumbnail)) {
      errors.push("Product Image URL must be a valid URL.");
    }
    if (!postObject.category || postObject.category.trim() === "") {
      errors.push("Product Category is required.");
    }

    return errors;
  }



//   // Function to handle form submission
  async function postData(event) {
    event.preventDefault();

    // Collect data from the form inputs
    const postObject = {
      title: document.getElementById("product-title").value,
      price: document.getElementById("product-price").value,
      description: document.getElementById("product-description").value,
      thumbnail: document.getElementById("product-image").value,
      category: document.getElementById("product-category").value,
    };

    // Validate inputs
    const errors = validateForm(postObject);
    if (errors.length > 0) {
      alert("Please fix the following errors:\n" + errors.join("\n"));
      return;
    }

    try {
      // Post data using the api.js post method
      const response = await api.post(postObject);
      console.log("Product posted successfully:", response);
      alert("Product posted successfully!");

      // Clear the form after submission
      form.reset();
    } catch (error) {
      console.error("Error posting product:", error);
      alert("There was an error posting the product.");
    }
  }

  // Add click event to post data button
  postDataButton.addEventListener("click", postData);


// Initial product load
loadPageProducts();
