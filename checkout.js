document.addEventListener('DOMContentLoaded', () => {
    // Load cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Populate the receipt table
    const receiptItemsContainer = document.getElementById('receipt-items');
    let totalPrice = 0;

    cart.forEach(item => {
        const row = document.createElement('tr');
        const totalItemPrice = item.quantity * item.price;

        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>$${totalItemPrice.toFixed(2)}</td>
        `;

        receiptItemsContainer.appendChild(row);
        totalPrice += totalItemPrice;
    });

    document.getElementById('total-price').textContent = `$${totalPrice.toFixed(2)}`;

    // Form validation
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input, textarea');
    const buyNowButton = document.getElementById('buy-now');

    buyNowButton.addEventListener('click', () => {
        let isValid = true;

        // Validate each input
        inputs.forEach(input => {
            const errorMsg = input.nextElementSibling;

            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'red';
                errorMsg.textContent = `Please fill out this field.`;
                errorMsg.style.display = 'block';
            } else {
                input.style.borderColor = '#ccc';
                errorMsg.style.display = 'none';
            }
        });

        if (isValid) {
            // Redirect to the delivery page if all inputs are valid
            alert('Thank you for your purchase!');
            localStorage.removeItem('cart'); // Clear the cart
            form.reset(); // Reset the form
            window.location.href = 'delivery.html'; // Redirect to delivery page
        }
    });

    // Card number input formatting
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, ''); // Remove non-numeric characters
        value = value.match(/.{1,4}/g)?.join(' ') || ''; // Format into groups of 4
        this.value = value; // Update the input value
    });
});
