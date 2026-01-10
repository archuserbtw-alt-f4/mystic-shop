const firebaseConfig = {
    apiKey: "AIzaSyDR6-ewzysqRb_ufaWbT4zBQA1oqOR4Fa8",
    authDomain: "mysticstore-4afd8.firebaseapp.com",
    databaseURL: "https://mysticstore-4afd8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mysticstore-4afd8"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentLang = 'en';
const translations = {
    en: {
        plushies: "🧸 Plushies",
        figures: "💎 Figures",
        clothes: "👕 Clothes",
        accessories: "💍 Accessories",
        n_plushies: "Plushies",
        n_figures: "Figures",
        n_clothes: "Clothes",
        n_accessories: "Accessories",
        cartNav: "🛒 Cart",
        buy: "Add to Cart",
        soldout: "Sold Out",
        bag: "Your Bag",
        name: "Full Name",
        addr: "Neighborhood / Street",
        phone: "Phone Number",
        submit: "Submit Order",
        langBtn: "العربية",
        orderMsg: "Order Sent! Mystic will contact you soon.",
        instH: "Follow Our Journey",
        instP: "Stay updated with the latest drops on Instagram"
    },
    ar: {
        plushies: "🧸 دمى محشوة",
        figures: "💎 مجسمات",
        clothes: "👕 ملابس",
        accessories: "💍 إكسسوارات",
        n_plushies: "دمى",
        n_figures: "مجسمات",
        n_clothes: "ملابس",
        n_accessories: "إكسسوارات",
        cartNav: "🛒 السلة",
        buy: "أضف للسلة",
        soldout: "نفذت الكمية",
        bag: "حقيبتك",
        name: "الاسم الكامل",
        addr: "المنطقة / الشارع",
        phone: "رقم الهاتف",
        submit: "إرسال الطلب",
        langBtn: "English",
        orderMsg: "تم إرسال الطلب! سيتم التواصل معكم قريباً",
        instH: "تابعوا رحلتنا",
        instP: "ابقوا على اطلاع بأحدث المنتجات على إنستغرام"
    }
};

window.switchLang = () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    const t = translations[currentLang];
    
    document.body.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    // Apply font change for Arabic
    document.body.style.fontFamily = currentLang === 'ar' ? "'Cairo', sans-serif" : "'Segoe UI', sans-serif";
    
    document.getElementById('langBtn').innerText = t.langBtn;
    
    // Fixed Nav translation
    document.getElementById('n-Plushies').innerText = t.n_plushies;
    document.getElementById('n-Figures').innerText = t.n_figures;
    document.getElementById('n-Clothes').innerText = t.n_clothes;
    document.getElementById('n-Accessories').innerText = t.n_accessories;
    
    document.getElementById('t-Plushies').innerText = t.plushies;
    document.getElementById('t-Figures').innerText = t.figures;
    document.getElementById('t-Clothes').innerText = t.clothes;
    document.getElementById('t-Accessories').innerText = t.accessories;
    
    document.getElementById('h-bag').innerText = t.bag;
    document.getElementById('btn-submit').innerText = t.submit;
    document.getElementById('inst-h').innerText = t.instH;
    document.getElementById('inst-p').innerText = t.instP;
    
    document.getElementById('custName').placeholder = t.name;
    document.getElementById('custLoc').placeholder = t.addr;
    document.getElementById('custPhone').placeholder = t.phone;

    loadProducts();
};

function loadProducts() {
    const grids = {
        Plushies: document.getElementById('grid-Plushies'),
        Figures: document.getElementById('grid-Figures'),
        Clothes: document.getElementById('grid-Clothes'),
        Accessories: document.getElementById('grid-Accessories')
    };

    database.ref('products').on('value', (snapshot) => {
        const products = snapshot.val();
        for (let key in grids) if(grids[key]) grids[key].innerHTML = '';

        for (let id in products) {
            const p = products[id];
            const cat = p.category || "Plushies";
            const targetGrid = grids[cat];

            if (targetGrid) {
                const finalPrice = p.price - (p.discount || 0);
                const isOutOfStock = p.stock <= 0;
                const t = translations[currentLang];

                targetGrid.innerHTML += `
                    <div class="card" style="${isOutOfStock ? 'opacity: 0.5;' : ''}">
                        <img src="${p.image}">
                        <div class="card-info">
                            <h3>${p.name}</h3>
                            <p class="price">${finalPrice.toLocaleString()} IQD</p>
                            <button class="buy-btn" onclick="addToCart('${p.name}', ${finalPrice}, '${id}')" ${isOutOfStock ? 'disabled' : ''}>
                                ${isOutOfStock ? t.soldout : t.buy}
                            </button>
                        </div>
                    </div>`;
            }
        }
        for (let key in grids) {
            const section = grids[key].parentElement;
            section.style.display = grids[key].innerHTML === '' ? 'none' : 'block';
        }
    });
}

let cart = [];
window.addToCart = (name, price, id) => {
    cart.push({ name, price, id });
    renderCart();
    const s = document.getElementById('cart-sidebar');
    if (currentLang === 'en') {
        s.style.right = '0px';
        s.style.left = 'auto';
    } else {
        s.style.left = '0px';
        s.style.right = 'auto';
    }
};

// Add these to your translations dictionary if needed
// ar: { delivery: "خدمة التوصيل: " }

function renderCart() {
    const totalDisp = document.getElementById('cart-total-price');
    const deliveryFee = parseInt(document.getElementById('deliveryArea').value);
    
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price);
    
    // Final total includes the delivery fee
    const finalTotal = subtotal + deliveryFee;
    
    totalDisp.innerText = finalTotal.toLocaleString();
    
    // Update Nav and Hidden Summary
    document.getElementById('cart-nav-link').innerText = `${translations[currentLang].cartNav} (${cart.length})`;
    
    // Include delivery fee in the order summary for the admin
    const areaText = document.getElementById('deliveryArea').options[document.getElementById('deliveryArea').selectedIndex].text;
    document.getElementById('orderSummaryHidden').value = 
        `Items: ${cart.map(c => c.name).join(", ")} | Delivery: ${areaText}`;
    
    // Item list display
    document.getElementById('cart-items-display').innerHTML = cart.map((item, i) => `
        <div class="cart-item-row">
            <span>${item.name}</span>
            <button class="remove-btn" onclick="removeItem(${i})">X</button>
        </div>
    `).join('');
}

window.removeItem = (i) => { cart.splice(i,1); renderCart(); };

window.toggleCart = () => {
    const s = document.getElementById('cart-sidebar');
    if (currentLang === 'en') {
        s.style.right = (s.style.right === '0px') ? '-100%' : '0px';
        s.style.left = 'auto';
    } else {
        s.style.left = (s.style.left === '0px') ? '-100%' : '0px';
        s.style.right = 'auto';
    }
};

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const orderData = {
        customer: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custLoc').value,
        items: document.getElementById('orderSummaryHidden').value,
        status: "pending",
        timestamp: Date.now()
    };

    database.ref('orders').push(orderData).then(() => {
        alert(translations[currentLang].orderMsg);
        cart = []; renderCart(); toggleCart();
        document.getElementById('orderForm').reset();
    });
});

window.onload = loadProducts;
