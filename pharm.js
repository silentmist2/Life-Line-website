// Selectors
let productCardHTML = document.querySelector('.listofProducts');
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favoriteCart = JSON.parse(localStorage.getItem('favoriteCart')) || [];

// Function to update the shopping cart UI and display the table
const updateCart = () => {
    const cartContainer = document.querySelector('.listcart');
    cartContainer.innerHTML = '';

    let totalPrice = 0;

    // Create the table
    const table = document.createElement('table');
    table.classList.add('cart-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong id="grand-total">$0</strong></td>
            </tr>
            <tr>
                <td colspan="4" style="text-align: center;">
                    <button id="favorite-cart">Favorite</button>
                    <button id="buy-now">Buy Now</button>
                    <button id="empty-cart">Empty Cart</button>
                </td>
            </tr>
        </tfoot>
    `;

    const tableBody = table.querySelector('tbody');
    if (cart.length > 0) {
        cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>${item.quantity}</td>
                <td>$${item.quantity * item.price}</td>
            `;
            tableBody.appendChild(row);
            totalPrice += item.quantity * item.price;
        });

        // Update total price in the table footer
        table.querySelector('#grand-total').textContent = `$${totalPrice}`;
    } else {
        const noItemsRow = document.createElement('tr');
        noItemsRow.innerHTML = `<td colspan="4" style="text-align: center;">Your cart is empty.</td>`;
        tableBody.appendChild(noItemsRow);
    }

    cartContainer.appendChild(table);

    // Add event listeners for "Favorite", "Buy Now" and "Empty Cart" buttons
    document.getElementById('favorite-cart').addEventListener('click', () => {
        // If cart is empty, load the previous favorite items
        if (cart.length === 0) {
            cart = [...favoriteCart];
        } else {
            // Overwrite favorite items with the current cart
            favoriteCart = [...cart];
        }
        saveFavoriteCartToLocalStorage();
        saveCartToLocalStorage();
        alert('Favorite items updated.');
        updateCart();
    });

    document.getElementById('buy-now').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty! Add some items before proceeding to checkout.');
        } else {
            localStorage.setItem('cart', JSON.stringify(cart)); // Save the cart data
            window.location.href = 'checkout.html'; // Redirect to checkout page
        }
    });

    document.getElementById('empty-cart').addEventListener('click', () => {
        cart = [];
        saveCartToLocalStorage();
        updateCart();
    });
};

// Function to synchronize the cart with localStorage
const saveCartToLocalStorage = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Function to synchronize the favorite cart with localStorage
const saveFavoriteCartToLocalStorage = () => {
    localStorage.setItem('favoriteCart', JSON.stringify(favoriteCart));
};

// Function to load the shopping cart from localStorage
const loadCartFromLocalStorage = () => {
    updateCart();
};

// Function to add products dynamically to the page
const addDataToHTML = (groupedCategories) => {
    productCardHTML.innerHTML = ""; // Clear any existing products

    if (Object.keys(groupedCategories).length > 0) {
        Object.keys(groupedCategories).forEach(category => {
            // Create a container for the category
            let categoryContainer = document.createElement('div');
            categoryContainer.classList.add('category-container');

            // Add a header for the category
            let categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryHeader.classList.add('category-header');
            categoryContainer.appendChild(categoryHeader);

            // Create a container for product rows
            let productRow = document.createElement('div');
            productRow.classList.add('product-row');
            categoryContainer.appendChild(productRow);

            // Loop through the products and create product cards
            groupedCategories[category].forEach((product, index) => {
                // After every 3 products, create a new row
                if (index > 0 && index % 3 === 0) {
                    productRow = document.createElement('div');
                    productRow.classList.add('product-row');
                    categoryContainer.appendChild(productRow);
                }

                // Create a product card
                let productCard = document.createElement('div');
                productCard.dataset.id = product.id;
                productCard.classList.add('productCard');
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h4 class="medsname">${product.name}</h4>
                    <div class="pricing">$${product.price}</div>
                    <input type="number" id="quantity-${product.id}" placeholder="Enter the required amount">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                `;
                productRow.appendChild(productCard);
            });

            // Append the entire category container to the main product card HTML
            productCardHTML.appendChild(categoryContainer);
        });
    }
};

// Function to handle adding items to the shopping cart
document.querySelector('.listofProducts').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const productID = e.target.dataset.id;
        const quantityInput = document.querySelector(`#quantity-${productID}`);
        const quantity = parseInt(quantityInput?.value || "0");

        if (isNaN(quantity) || quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const product = products.find(p => p.id == productID);
        if (!product) {
            alert("Product not found.");
            return;
        }

        const existingItem = cart.find(item => item.id === productID);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
            });
        }

        saveCartToLocalStorage();
        updateCart();
    }
});

// Function to group products by categories
const groupProductsByCategory = (categories) => {
    const groupedProducts = {};

    Object.keys(categories).forEach(category => {
        groupedProducts[category] = categories[category].map(product => {
            if (!product.category) product.category = category;
            return product;
        });
    });

    return groupedProducts;
};

// Function to initialize the app and load products
const initApp = () => {
    fetch('pharm2.json')
        .then((response) => response.json())
        .then((data) => {
            console.log("Loaded Data: ", data);

            // Ensure we have categories data
            if (data.categories) {
                // Flatten all products into the `products` array
                products = Object.values(data.categories).flat();

                const groupedCategories = groupProductsByCategory(data.categories);
                addDataToHTML(groupedCategories);
            } else {
                console.error("Data does not have categories");
            }
        })
        .catch((err) => console.error("Failed to load JSON data:", err));
};

// Initialize the app and load the carts
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    loadCartFromLocalStorage();
});
