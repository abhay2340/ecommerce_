import api from "./API.js";

document.addEventListener("DOMContentLoaded", async () => {
    const productId = new URLSearchParams(window.location.search).get("id");

    if (!productId) {
        alert("No product selected.");
        return;
    }

    try {
        // Fetch product details
        const product = await api.getProductId(productId);

        // Populate product information
        document.getElementById("product-thumbnail").src = product.thumbnail;
        document.getElementById("product-title").textContent = product.title;
        document.getElementById("product-price").textContent = `Price: ${product.price} INR`;
        document.getElementById("product-full-description").textContent = product.description;

        // Additional product details
        document.getElementById("product-brand").textContent = product.brand;
        document.getElementById("product-sku").textContent = product.sku;
        document.getElementById("product-weight").textContent = product.weight;

        // Format dimensions
        const dimensions = `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm`;
        document.getElementById("product-dimensions").textContent = dimensions;

        document.getElementById("product-warranty").textContent = product.warrantyInformation;
        document.getElementById("product-shipping").textContent = product.shippingInformation;
        document.getElementById("product-availability").textContent = product.availabilityStatus;

        // Display reviews
const reviewsList = document.getElementById("product-reviews");
product.reviews.forEach(review => {
    const reviewItem = document.createElement("li");
    reviewItem.classList.add("review-item");

    // Create tooltip
    const tooltip = document.createElement("span");
    tooltip.classList.add("tooltip");
    tooltip.textContent = `Reviewed on: ${new Date(review.date).toLocaleDateString()}`;

    // Create star rating
    const starsContainer = document.createElement("div");
    starsContainer.classList.add("stars");
    const rating = review.rating;

    // Generate stars
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.classList.add("star");
        star.innerHTML = i <= rating ? '&#9733;' : '&#9734;'; // Filled star or empty star
        starsContainer.appendChild(star);
    }

    // Set review text
    reviewItem.appendChild(starsContainer);
    reviewItem.appendChild(document.createTextNode(` ${review.reviewerName}: ${review.comment}`));
    reviewItem.appendChild(tooltip);

    reviewsList.appendChild(reviewItem);
});

    } catch (error) {
        console.error("Error fetching product details:", error);
    }

    // Back to Cart button
    document.getElementById("back-to-cart").addEventListener("click", () => {
        window.location.href = "./cart.html";
    });
});
