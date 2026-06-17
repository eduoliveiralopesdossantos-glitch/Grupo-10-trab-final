import { AuthService } from './auth.js';

const authService = new AuthService();
const STORAGE_PRODUCTS = 'esw_products';
const STORAGE_ORDERS = 'esw_orders';
const STORAGE_CART = 'esw_cart';

// Limpar cache de produtos para atualizar imagens
localStorage.removeItem(STORAGE_PRODUCTS);
const tabButtons = document.querySelectorAll('.tab-button');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const productGrid = document.querySelector('#product-grid');
const browseMessage = document.querySelector('#browse-message');
const cartButton = document.querySelector('#cart-button');
const cartCount = document.querySelector('#cart-count');
const cartPanel = document.querySelector('#cart-panel');
const cartPanelClose = document.querySelector('#cart-panel-close');
const cartItemsContainer = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const cartCheckout = document.querySelector('#cart-checkout');
const productModal = document.querySelector('#product-modal');
const productModalClose = document.querySelector('#product-modal-close');
const productModalImage = document.querySelector('#product-modal-image');
const productModalLabel = document.querySelector('#product-modal-label');
const productModalTitle = document.querySelector('#product-modal-title');
const productModalDescription = document.querySelector('#product-modal-description');
const productModalPrice = document.querySelector('#product-modal-price');
const productModalQuantity = document.querySelector('#product-modal-quantity');
const productModalAdd = document.querySelector('#product-modal-add');

function setActiveTab(targetId) {
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === targetId);
  });

  authForms.forEach((form) => {
    form.classList.toggle('active', form.id === targetId);
  });
}

function showMessage(message) {
  window.alert(message);
}

function getStorageData(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn(`Erro ao ler ${key} do localStorage:`, error);
    return fallback;
  }
}

function setStorageData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeProducts() {
  const existing = getStorageData(STORAGE_PRODUCTS, []);
  if (!Array.isArray(existing) || existing.length === 0) {
    const initialProducts = [
      {
        id: 'prod_1',
        label: 'Treino',
        title: 'Camiseta Carbon',
        description: 'Malha leve, ajuste sofisticado e visual contemporâneo.',
        image: 'assets/images/product-1.jpg',
        price: 129.9,
      },
      {
        id: 'prod_2',
        label: 'Signature',
        title: 'Camiseta Bandeira',
        description: 'Texto minimalista e acabamento premium para looks versáteis.',
        image: 'assets/images/product-2.jpg',
        price: 149.9,
      },
      {
        id: 'prod_3',
        label: 'Urban',
        title: 'Camiseta Essential',
        description: 'Silhueta clean e toque suave, ideal para o dia a dia.',
        image: 'assets/images/paquetop.jpg',
        price: 119.9,
      },
    ];
    setStorageData(STORAGE_PRODUCTS, initialProducts);
    return initialProducts;
  }
  return existing;
}

function renderProducts() {
  if (!productGrid) {
    return;
  }

  const products = getStorageData(STORAGE_PRODUCTS, []);
  if (!Array.isArray(products) || products.length === 0) {
    productGrid.innerHTML = '<p class="empty-state">Nenhum produto disponível no momento.</p>';
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => {
        const imageSrc = product.image || 'assets/images/placeholder-hero.svg';
        const price = Number(product.price) || 0;
        return `
        <article class="product-card" data-product-id="${product.id}">
          <img class="product-image" src="${imageSrc}" alt="${product.title}">
          <p class="product-label">${product.label || ''}</p>
          <h4>${product.title || 'Produto sem nome'}</h4>
          <p>${product.description || ''}</p>
          <div class="product-bottom">
            <span class="product-price">R$ ${price.toFixed(2)}</span>
          </div>
        </article>
      `;
      },
    )
    .join('');
}

function loadCart() {
  return getStorageData(STORAGE_CART, []);
}

function saveCart(cart) {
  setStorageData(STORAGE_CART, cart);
}

function getCartCount() {
  return loadCart().reduce((total, item) => total + Number(item.quantity), 0);
}

function renderCartCount() {
  if (!cartCount) return;
  const count = getCartCount();
  cartCount.textContent = count;
  cartCount.classList.toggle('hidden', count === 0);
}

function openCartPanel() {
  cartPanel?.classList.remove('hidden');
  renderCartItems();
}

function closeCartPanel() {
  cartPanel?.classList.add('hidden');
}

function openProductModal(productId) {
  const products = getStorageData(STORAGE_PRODUCTS, []);
  const product = products.find((item) => item.id === productId);
  if (!product || !productModal) {
    return;
  }

  if (productModalImage) productModalImage.src = product.image || 'assets/images/placeholder-hero.svg';
  if (productModalLabel) productModalLabel.textContent = product.label || '';
  if (productModalTitle) productModalTitle.textContent = product.title || 'Produto sem nome';
  if (productModalDescription) productModalDescription.textContent = product.description || '';
  if (productModalPrice) productModalPrice.textContent = `R$ ${Number(product.price).toFixed(2)}`;
  if (productModalQuantity) productModalQuantity.value = '1';
  productModal.dataset.productId = product.id;
  productModal.classList.remove('hidden');
}

function closeProductModal() {
  productModal?.classList.add('hidden');
}

function renderCartItems() {
  if (!cartItemsContainer) return;
  const cart = loadCart();
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-state">Seu carrinho está vazio.</p>';
    cartTotal.textContent = 'Total: R$ 0,00';
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map((item) => {
      const subtotal = Number(item.price) * Number(item.quantity);
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-info">
            <strong>${item.title}</strong>
            <span>${item.quantity} x R$ ${Number(item.price).toFixed(2)}</span>
            <span>Subtotal: R$ ${subtotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    })
    .join('');
  updateCartTotal();
}

function updateCartTotal() {
  if (!cartTotal) return;
  const cart = loadCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function addToCart(productId, quantity) {
  const products = getStorageData(STORAGE_PRODUCTS, []);
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const cart = loadCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity = Number(existing.quantity) + Number(quantity);
  } else {
    cart.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: Number(quantity),
    });
  }
  saveCart(cart);
  renderCartCount();
}

function checkoutCart() {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const cart = loadCart();
  if (cart.length === 0) {
    showMessage('O carrinho está vazio. Adicione um produto antes de finalizar a compra.');
    return;
  }

  const orders = getStorageData(STORAGE_ORDERS, []);
  cart.forEach((item) => {
    orders.unshift({
      id: `order_${Date.now()}_${item.productId}`,
      createdAt: new Date().toISOString(),
      productId: item.productId,
      productName: item.title,
      productPrice: item.price,
      userEmail: currentUser.email,
      quantity: item.quantity,
    });
  });
  setStorageData(STORAGE_ORDERS, orders);
  saveCart([]);
  renderCartCount();
  closeCartPanel();
  showMessage('Compra finalizada! Seus produtos foram encaminhadas com sucesso.');
}

function saveOrder(productId) {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const products = getStorageData(STORAGE_PRODUCTS, []);
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const orders = getStorageData(STORAGE_ORDERS, []);
  orders.unshift({
    id: `order_${Date.now()}`,
    createdAt: new Date().toISOString(),
    productId: product.id,
    productName: product.title,
    productPrice: product.price,
    userEmail: currentUser.email,
  });
  setStorageData(STORAGE_ORDERS, orders);
  window.dispatchEvent(new Event('storage'));
  showMessage(`Pedido registrado para ${product.title}.`);
}

function handleBuyClick(event) {
  const card = event.target.closest('.product-card');
  if (!card) return;
  const productId = card.dataset.productId;
  if (productId) {
    openProductModal(productId);
  }
}

function handleLogin(event) {
  event.preventDefault();

  const email = (document.querySelector('#login-email')?.value ?? '').trim();
  const password = (document.querySelector('#login-password')?.value ?? '').trim();
  const formData = { email, password };

  const user = authService.login(formData);
  if (!user) {
    showMessage('Por favor, informe um email válido e senha com pelo menos 8 caracteres.');
    return;
  }

  loginForm?.reset();
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    showMessage('Login realizado com sucesso! Bem-vindo de volta à Elite Sports Wear.');
    window.location.href = 'index.html';
  }
}

function handleRegister(event) {
  event.preventDefault();

  const name = (document.querySelector('#register-name')?.value ?? '').trim();
  const email = (document.querySelector('#register-email')?.value ?? '').trim();
  const password = (document.querySelector('#register-password')?.value ?? '').trim();
  const formData = { name, email, password };

  if (!authService.register(formData)) {
    showMessage('Por favor, verifique se todos os campos estão preenchidos corretamente ou se o email já está em uso.');
    return;
  }

  showMessage('Conta criada com sucesso! Agora faça login para continuar.');
  registerForm?.reset();
  setActiveTab('login-form');
}

function initApp() {
  initializeProducts();
  renderProducts();
  renderCartCount();

  document.addEventListener('click', handleBuyClick);
  document.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.cart-remove-btn');
    if (removeButton) {
      const productId = removeButton.dataset.productId;
      if (productId) {
        removeFromCart(productId);
      }
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.target));
  });
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  if (cartButton) {
    cartButton.addEventListener('click', openCartPanel);
  }
  if (cartPanelClose) {
    cartPanelClose.addEventListener('click', closeCartPanel);
  }
  if (cartCheckout) {
    cartCheckout.addEventListener('click', checkoutCart);
  }
  if (productModalClose) {
    productModalClose.addEventListener('click', closeProductModal);
  }
  if (productModalAdd) {
    productModalAdd.addEventListener('click', () => {
      const productId = productModal?.dataset.productId;
      const quantity = Number(productModalQuantity?.value || 1);
      if (productId && quantity > 0) {
        addToCart(productId, quantity);
        closeProductModal();
        showMessage('Produto encaminhado para o carrinho.');
      }
    });
  }
  if (productModal) {
    productModal.addEventListener('click', (event) => {
      if (event.target === productModal) {
        closeProductModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
