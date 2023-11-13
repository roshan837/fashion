//dom Elements
const productDom = document.querySelector(".products-center");
const cartDom = document.querySelector(".cart-content");
const cartMain = document.querySelector(".cart");
const cartPrice = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartOverlay = document.querySelector(".cart-overlay");
const cartButton = document.querySelector(".cart-btn");
const cartClose = document.querySelector(".close-cart");
const clearCart = document.querySelector(".btn-clear");
const removeItem = document.querySelector(".remove-item");
const loginLink = document.querySelector(".login-link");
const loginModal = document.querySelector(".login-modal");
const buyModal = document.querySelector(".buy-modal");
const buyContent = document.querySelector(".buy-content");
const closeModal = document.querySelector(".close-modal");
const closeBuyModal = document.querySelector(".close-buy-modal");
const btnBuy = document.querySelector(".btn-buy");
const totalBuyPrice = document.querySelector(".total-Buy-Price");

let cart = [];

class Products {
  async getProducts(type) {
    try {
      const result = await fetch("data/products.json");
      let products = await result.json();
      let data = products.items;
      data = data.map((item) => {
        const { title, price, type, rating } = item.fields;
        const id = item.sys.id;
        const url = item.fields.image.fields.file.url;
        return { title, price, type, rating, id, url };
      });
      return data.filter(
        (product) =>
          type === "all" ||
          product.type.toLowerCase().includes(type.toLowerCase())
      );
    } catch (error) {
      console.log(error);
    }
  }
}

//display class
class UserInterface {
  insertProductsInDom(products) {
    let result = "";
    products.forEach((element) => {
      let star = "";
      for (let i = 0; i < element.rating; i++) {
        star += `<i class="fas fa-star"></i>`;
      }
      for (let i = 0; i < 5 - element.rating; i++) {
        star += `<i class="far fa-star"></i>`;
      }
      result += `
            <article class="product">
                <div class="img-container">
                    <img src=${element.url} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${element.id}><i class="fas fa-shopping-cart"></i>Add To Cart</button>
                    <p>${element.title}</p>
                </div>
                <div>
                    <h4 class="light">${element.type}</h4>
                    <h4 class="price">$ ${element.price}</h4>
                </div>
                <div class="star">
                   ${star}
                </div>
            </article>
          `;
    });
    productDom.innerHTML = result;
  }

  addCartItems(cart) {
    let cartHtml = "";
    cart.forEach((cartItem) => {
      cartHtml += ` <div class="cart-item">
                <img src=${cartItem.url} alt="cart">
                <div>
                    <h4>${cartItem.title}</h4>
                    <h5>$ ${cartItem.price}</h5>
                    <span class="remove-item" data-id=${cartItem.id}>remove</span>
                </div>

                <div class="addremove" data-id=${cartItem.id}>
                    <i class="fas fa-plus-circle"></i>
                    <p class="itemNo">${cartItem.amount}</p>
                    <i class="fas fa-minus-circle"></i>
                </div>
            </div>
          `;
    });
    cartDom.innerHTML = cartHtml;
  }

  setCartValues(cart) {
    let totalPrice = 0;
    let totalItems = 0;
    cart = cart.map((cartItem) => {
      totalPrice += cartItem.price * cartItem.amount;
      totalItems += cartItem.amount;
    });
    cartPrice.innerHTML = parseFloat(totalPrice.toFixed(2));
    cartItems.innerHTML = totalItems;
  }

  showCart() {
    cartOverlay.classList.add("show-cart");
    cartMain.classList.add("transparentbg");
  }

  closeCart() {
    cartOverlay.classList.remove("show-cart");
    cartMain.classList.remove("transparentbg");
  }

  initialSetup() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.addCartItems(cart);
  }

  resetButtons() {
    //convert nodelist into an array
    let buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((btn) => {
      let id = btn.dataset.id;
      let incart = cart.find((items) => items.id === id);
      if (incart) {
        btn.innerHTML = "In Cart";
        btn.disabled = true;
      } else {
        btn.innerHTML = "Add to Cart";
        btn.disabled = false;
      }
    });
  }

  getBagButtons() {
    let buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((btn) => {
      let id = btn.dataset.id;
      let incart = cart.find((items) => items.id === id);
      if (incart) {
        btn.innerHTML = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerHTML = "In Cart";
        event.target.disabled = true;

        let selectedProduct = Storage.getLocalProduct(event.target.dataset.id);

        selectedProduct = { ...selectedProduct, amount: 1 };
        cart = [...cart, selectedProduct];

        Storage.setCartItems(cart);

        this.setCartValues(cart);

        this.addCartItems(cart);

        this.showCart();
      });
    });
  }

  cartFuntionality() {
    cartDom.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        // filter can be used
        let index = cart.findIndex(
          (item) => item.id === event.target.dataset.id
        );
        cart.splice(index, 1);
        Storage.setCartItems(cart);

        this.setCartValues(cart);

        this.addCartItems(cart);

        this.resetButtons();
      }
      if (event.target.classList.contains("fa-plus-circle")) {
        let tempItem = cart.find(
          (item) => item.id === event.target.parentElement.dataset.id
        );
        tempItem.amount = tempItem.amount + 1;
        Storage.setCartItems(cart);

        this.setCartValues(cart);

        this.addCartItems(cart);
      }
      if (event.target.classList.contains("fa-minus-circle")) {
        let tempItem = cart.find(
          (item) => item.id === event.target.parentElement.dataset.id
        );
        if (tempItem.amount === 1) {
          let index = cart.findIndex(
            (item) => item.id === event.target.parentElement.dataset.id
          );
          cart.splice(index, 1);
          Storage.setCartItems(cart);

          this.setCartValues(cart);

          this.addCartItems(cart);

          this.resetButtons();
        }
        tempItem.amount = tempItem.amount - 1;
        Storage.setCartItems(cart);

        this.setCartValues(cart);

        this.addCartItems(cart);
      }
    });
  }

  clearCart() {
    cart = [];
    Storage.setCartItems(cart);

    this.setCartValues(cart);

    this.addCartItems(cart);

    this.closeCart();

    this.resetButtons();
  }

  addCartItemsToModel(cart) {
    let cartHtml = "";
    let totalPrice = 0;
    cart.forEach((cartItem) => {
      totalPrice += cartItem.price * cartItem.amount;
      cartHtml += ` <div class="cart-item">
                <img src=${cartItem.url} alt="cart">
                <div>
                    <h4>${cartItem.title}</h4>
                    <h5>$ ${cartItem.price}</h5>
                </div>
                <div class="addremove" data-id=${cartItem.id}>
                    <p class="itemNo">${cartItem.amount}</p>
                </div>
              </div>
          `;
    });
    buyContent.innerHTML = cartHtml;
    totalBuyPrice.innerHTML = totalPrice;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("Products", JSON.stringify(products));
  }
  static getLocalProduct(id) {
    return JSON.parse(localStorage.getItem("Products")).find(
      (prod) => prod.id === id
    );
  }
  static setCartItems(cart) {
    localStorage.setItem("Cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("Cart")
      ? JSON.parse(localStorage.getItem("Cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => filterProducts());

function filterProducts(type = "all") {
  const p = new Products();
  const ui = new UserInterface();

  p.getProducts(type).then((data) => {
    ui.insertProductsInDom(data);

    Storage.saveProducts(data);
    ui.initialSetup();
    ui.getBagButtons();
    ui.cartFuntionality();
  });
}

cartClose.addEventListener("click", () => {
  const ui = new UserInterface();
  ui.closeCart();
});

cartButton.addEventListener("click", () => {
  const ui = new UserInterface();
  ui.showCart();
});

btnBuy.onclick = () => {
  const ui = new UserInterface();
  let cartval = Storage.getCart();
  ui.addCartItemsToModel(cartval);
  ui.closeCart();
  ui.clearCart();
  buyModal.style.display = "block";
};

closeBuyModal.onclick = () => {
  buyModal.style.display = "none";
};

clearCart.onclick = () => {
  const ui = new UserInterface();
  ui.clearCart();
};

loginLink.onclick = function () {
  loginModal.style.display = "block";
};

closeModal.onclick = function () {
  loginModal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
};
