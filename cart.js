
function myCart() {
    let cartItemsContainer = document.getElementById("cart-items");
  
    // Retrieve cart data from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      // Generate HTML for each cart item
      cartItemsContainer.innerHTML = cart
        .map((item) => {
          return `
            <div class="cart-item">
              <div class="cart-item-image">
                <img src="${item.thumbnail}" alt="${item.title}">
            <p id="close-btn" data-product-id="${item.id}">Remove From Cart</p>

              </div>
              <div class="cart-item-details">
                <h2>${item.title}</h2>
                <p>${item.description}</p>
                <p>Price: ${item.price} INR</p>
                 <button class="view-details-btn" data-product-id="${item.id}">View Full Details</button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  
    // Checkout button event listener
    document.getElementById("checkout-button").addEventListener("click", () => {
      alert("Items Checked Out");
      localStorage.clear()
      location.reload();
    });
    document.querySelectorAll(".view-details-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
          const productId = e.target.getAttribute("data-product-id");
          // Redirect to the details page with the product ID
          console.log(productId)
          window.location.href = `productDetail.html?id=${productId}`;
      });
  });
  };

  myCart()

  let closeBtn=document.getElementById("close-btn")
  console.log(closeBtn)
  closeBtn.addEventListener("click",(e)=>{
    const productId=e.target.getAttribute("data-product-id");
    let cart = JSON.parse(localStorage.getItem("cart"));
            [...cart]=cart.filter((item)=>item.id!=productId);
            localStorage.setItem("cart", JSON.stringify(cart));
            // incrementCartItemCount(cart.length);
            location.reload()

  })

  