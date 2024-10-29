class API {
    #baseURL = "https://dummyjson.com/products";
  


    // Method to get all items optional
    async get() {
        let response = await fetch(this.#baseURL);
        let items = await response.json();
        console.log(items)
      return items.products;
    }



    async getProductId(productId) {
      const api=`${this.#baseURL}/${productId}`
      console.log(api)
        let response = await fetch(api);
        let item = await response.json();
      return item;
    }
  


    // Method to fetch items with limit and skip for pagination
    async limitedGet(maxItemsPerPage, offset) {
      const api = `${this.#baseURL}?limit=${maxItemsPerPage}&skip=${offset}`
      let response = await fetch(api);
      let items = await response.json();
    return items;
    }
  


    // Method to fetch items by category 
    async searchByCategory(category) {
      let response = await fetch(`${this.#baseURL}?category=${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let items = await response.json();
      return items.products;
    }


    async searchByKeyword(keyword) {
      const api = `${this.#baseURL}/search?q=${keyword}`;
      const response = await fetch(api);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const items = await response.json();
      return items.products;
  }


  
      // Post method to add a new product
      async post(postObject) {
        const response = await fetch(`${this.#baseURL}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postObject),
        });
        return response.json();
    }

}
  
  
  export default new API();
  