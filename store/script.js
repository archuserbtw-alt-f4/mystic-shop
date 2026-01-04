// --- YOUR FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDR6-ewzysqRb_ufaWbT4zBQA1oqOR4Fa8",
    authDomain: "mysticstore-4afd8.firebaseapp.com",
    databaseURL: "https://mysticstore-4afd8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mysticstore-4afd8",
    storageBucket: "mysticstore-4afd8.firebasestorage.app",
    messagingSenderId: "612226910526",
    appId: "1:612226910526:web:01e8e38ae054b87385846f",
    measurementId: "G-NYMTSWVZJ3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let cart = [];

// Sidebar Toggle Logic
window.toggleCart = function() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar.style.right === '0px') {
        sidebar.style.right = '-350px';
    } else {
        sidebar.style.right = '0px';
    }
}

// Add Item to Cart
window.addToCart = function(name, price) {
    cart.push({ name, price });
    renderCart();
    // Open sidebar automatically
    document.getElementById('cart-sidebar').style.right = '0px';
}

// Remove Item from Cart
window.removeItem = function(index) {
    cart.splice(index, 1);
    renderCart();
}

// Render UI Update
function renderCart() {
    const display = document.getElementById('cart-items-display');
    const totalDisp = document.getElementById('cart-total-price');
    const summary = document.getElementById('orderSummaryHidden');
    const navLink = document.getElementById('cart-nav-link');
    
    if (cart.length === 0) {
        display.innerHTML = '<p style="text-align:center; color:#555;">Your bag is empty.</p>';
        totalDisp.innerText = "0";
        navLink.innerText = "🛒 Cart (0)";
        summary.value = "";
        return;
    }

    let total = 0;
    display.innerHTML = cart.map((item, i) => {
        total += item.price;
        return `
            <div class="cart-item-row">
                <div>
                    <strong>${item.name}</strong><br>
                    <small style="color:var(--accent-gold)">${item.price.toLocaleString()} IQD</small>
                </div>
                <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
            </div>`;
    }).join('');
    
    totalDisp.innerText = total.toLocaleString();
    navLink.innerText = `🛒 Cart (${cart.length})`;
    summary.value = cart.map(i => i.name).join(", ") + " | Total: " + total.toLocaleString() + " IQD";
}

// Submit Order to Firebase
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if(cart.length === 0) return alert("Please add items to your cart first!");

    const orderData = {
        customerName: document.getElementById('custName').value,
        location: document.getElementById('custLoc').value,
        phone: document.getElementById('custPhone').value,
        items: document.getElementById('orderSummaryHidden').value,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Pushing to "orders" node in Realtime Database
    database.ref('orders').push(orderData)
    .then(() => {
        alert("Success! Mystic will contact you shortly to confirm.");
        cart = []; 
        renderCart(); 
        document.getElementById('orderForm').reset(); 
        toggleCart();
    })
    .catch((error) => {
        console.error("Firebase Error:", error);
        alert("Order failed. Please check your connection.");
    });
});