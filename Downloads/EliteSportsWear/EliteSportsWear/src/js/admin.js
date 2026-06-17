import { AuthService } from './auth.js';

const authService = new AuthService();
const STORAGE_PRODUCTS = 'esw_products';
const STORAGE_USERS = 'esw_users';
const STORAGE_ORDERS = 'esw_orders';

const logoutBtn = document.querySelector('#logout-btn');
const productForm = document.querySelector('#product-form');
const productsTable = document.querySelector('#products-table tbody');
const usersTable = document.querySelector('#users-table tbody');
const ordersTable = document.querySelector('#orders-table tbody');
const totalProducts = document.querySelector('#total-products');
const totalUsers = document.querySelector('#total-users');
const totalOrders = document.querySelector('#total-orders');
const salesChartCtx = document.querySelector('#sales-chart');
const productImageField = document.querySelector('#product-image');
const productImageFileField = document.querySelector('#product-image-file');
const productImagePreview = document.querySelector('#product-image-preview');

function getStorageData(key, fallback) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function setStorageData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function loadProducts() {
  return getStorageData(STORAGE_PRODUCTS, []);
}

function loadUsers() {
  return getStorageData(STORAGE_USERS, []);
}

function loadOrders() {
  return getStorageData(STORAGE_ORDERS, []);
}

function saveProduct(product) {
  const products = loadProducts();
  const existing = products.find((item) => item.id === product.id);
  if (existing) {
    const index = products.findIndex((item) => item.id === product.id);
    products[index] = product;
  } else {
    products.unshift(product);
  }
  setStorageData(STORAGE_PRODUCTS, products);
  return products;
}

function deleteProduct(id) {
  const products = loadProducts().filter((item) => item.id !== id);
  setStorageData(STORAGE_PRODUCTS, products);
  return products;
}

function deleteUser(id) {
  const users = loadUsers().filter((item) => item.id !== id);
  setStorageData(STORAGE_USERS, users);
  return users;
}

function renderStats() {
  const products = loadProducts();
  const users = loadUsers();
  const orders = loadOrders();

  totalProducts.textContent = products.length;
  totalUsers.textContent = users.length;
  totalOrders.textContent = orders.length;
}

function renderProductsTable() {
  const products = loadProducts();
  productsTable.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td><img src="${product.image}" alt="${product.title}"></td>
          <td>${product.title}</td>
          <td>${formatCurrency(product.price)}</td>
          <td>
            <button class="inline-button" data-action="edit" data-id="${product.id}">Editar</button>
            <button class="inline-button delete" data-action="delete" data-id="${product.id}">Excluir</button>
          </td>
        </tr>
      `,
    )
    .join('');
}

function renderUsersTable() {
  const users = loadUsers();
  usersTable.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            ${user.role === 'admin' ? '<span class="inline-button">Admin</span>' : `<button class="inline-button delete" data-action="delete-user" data-id="${user.id}">Excluir</button>`}
          </td>
        </tr>
      `,
    )
    .join('');
}

function renderOrdersTable() {
  const orders = loadOrders();
  ordersTable.innerHTML = orders
    .slice(0, 10)
    .map(
      (order) => `
        <tr>
          <td>${order.productName}</td>
          <td>${formatCurrency(order.productPrice)}</td>
          <td>${order.userEmail}</td>
          <td>${formatDate(order.createdAt)}</td>
        </tr>
      `,
    )
    .join('');
}

function updateChart() {
  if (!salesChartCtx) return;
  const orders = loadOrders();
  const grouped = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + order.productPrice;
    return acc;
  }, {});

  const labels = Object.keys(grouped).slice(-7);
  const data = labels.map((label) => grouped[label] || 0);

  const canvas = salesChartCtx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

  const chartWidth = canvas.offsetWidth - 60;
  const chartHeight = canvas.offsetHeight - 60;
  const max = Math.max(...data, 1);

  ctx.strokeStyle = '#f8cf30';
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((value, index) => {
    const x = 40 + (chartWidth / Math.max(data.length - 1, 1)) * index;
    const y = chartHeight - (value / max) * chartHeight + 30;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '12px Inter, system-ui, sans-serif';
  labels.forEach((label, index) => {
    const x = 40 + (chartWidth / Math.max(data.length - 1, 1)) * index;
    ctx.fillText(label, x - 18, canvas.offsetHeight - 10);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadProductImagePreview(src) {
  if (!productImagePreview) return;
  if (!src) {
    productImagePreview.src = '';
    productImagePreview.alt = 'Prévia não disponível';
    return;
  }
  productImagePreview.src = src;
  productImagePreview.alt = 'Prévia do produto';
}

function fillForm(product) {
  document.querySelector('#product-id').value = product.id;
  document.querySelector('#product-title').value = product.title;
  document.querySelector('#product-label').value = product.label;
  document.querySelector('#product-description').value = product.description;
  document.querySelector('#product-price').value = product.price;
  if (productImageField) {
    productImageField.value = product.image;
  }
  if (productImageFileField) {
    productImageFileField.value = '';
  }
  loadProductImagePreview(product.image);
}

function resetForm() {
  productForm.reset();
  document.querySelector('#product-id').value = '';
  if (productImagePreview) {
    productImagePreview.src = '';
    productImagePreview.alt = 'Prévia não disponível';
  }
}

async function handleProductForm(event) {
  event.preventDefault();
  const id = document.querySelector('#product-id').value || `prod_${Date.now()}`;
  const products = loadProducts();
  const existingProduct = products.find((item) => item.id === id);
  let imageValue = productImageField ? productImageField.value.trim() : '';

  if (productImageFileField && productImageFileField.files.length > 0) {
    const file = productImageFileField.files[0];
    imageValue = await readFileAsDataURL(file);
  }

  if (!imageValue && existingProduct) {
    imageValue = existingProduct.image || '';
  }

  const product = {
    id,
    title: document.querySelector('#product-title').value.trim(),
    label: document.querySelector('#product-label').value.trim(),
    description: document.querySelector('#product-description').value.trim(),
    price: Number(document.querySelector('#product-price').value),
    image: imageValue,
  };

  saveProduct(product);
  renderProductsTable();
  renderStats();
  resetForm();
}

function handleProductAction(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'edit') {
    const products = loadProducts();
    const product = products.find((item) => item.id === id);
    if (product) {
      fillForm(product);
    }
    return;
  }

  if (action === 'delete') {
    deleteProduct(id);
    renderProductsTable();
    renderStats();
    return;
  }

  if (action === 'delete-user') {
    deleteUser(id);
    renderUsersTable();
    renderStats();
  }
}

function handleLogout() {
  authService.clearCurrentUser();
  window.location.href = 'login.html';
}

function verifyAdminAccess() {
  const currentUser = authService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'login.html';
  }
}

function synchronizeData() {
  renderStats();
  renderProductsTable();
  renderUsersTable();
  renderOrdersTable();
  updateChart();
}

function initAdmin() {
  verifyAdminAccess();
  synchronizeData();
  productForm.addEventListener('submit', handleProductForm);
  if (productImageFileField) {
    productImageFileField.addEventListener('change', async () => {
      if (productImageFileField.files.length === 0) {
        loadProductImagePreview(productImageField?.value || '');
        return;
      }
      const file = productImageFileField.files[0];
      const previewSrc = await readFileAsDataURL(file);
      if (productImageField) {
        productImageField.value = previewSrc;
      }
      loadProductImagePreview(previewSrc);
    });
  }
  productsTable.addEventListener('click', handleProductAction);
  usersTable.addEventListener('click', handleProductAction);
  logoutBtn.addEventListener('click', handleLogout);
  window.addEventListener('storage', synchronizeData);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('admin-page')) {
    initAdmin();
  }
});
