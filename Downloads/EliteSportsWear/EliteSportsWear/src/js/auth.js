const STORAGE_USERS = 'esw_users';
const STORAGE_CURRENT_USER = 'esw_current_user';

function createId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export class AuthService {
  constructor() {
    this.minPasswordLength = 8;
    this.initializeUsers();
  }

  initializeUsers() {
    const users = this.getUsers();
    if (users.length === 0) {
      const admin = {
        id: createId('user'),
        name: 'Administrador',
        email: 'admin@elite.com',
        password: 'Admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      this.saveUsers([admin]);
    }
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_CURRENT_USER) || 'null');
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  }

  validateEmail(email) {
    const normalized = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(normalized);
  }

  validatePassword(password) {
    return password.trim().length >= this.minPasswordLength;
  }

  validateName(name) {
    return name.trim().length >= 3;
  }

  login(data) {
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();
    if (!this.validateEmail(email) || !this.validatePassword(password)) {
      return null;
    }

    const user = this.getUsers().find((item) => item.email === email && item.password === password);
    if (!user) {
      return null;
    }

    this.setCurrentUser(user);
    return user;
  }

  register(data) {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!this.validateName(name) || !this.validateEmail(email) || !this.validatePassword(password)) {
      return false;
    }

    const existing = this.getUsers().some((item) => item.email === email);
    if (existing) {
      return false;
    }

    const newUser = {
      id: createId('user'),
      name,
      email,
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  getAllUsers() {
    return this.getUsers();
  }
}
