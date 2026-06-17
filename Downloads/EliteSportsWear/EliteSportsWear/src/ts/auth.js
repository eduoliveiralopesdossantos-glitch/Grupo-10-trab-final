export class AuthService {
  constructor() {
    this.minPasswordLength = 8;
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
    return this.validateEmail(data.email) && this.validatePassword(data.password);
  }

  register(data) {
    return (
      this.validateName(data.name ?? '') &&
      this.validateEmail(data.email) &&
      this.validatePassword(data.password)
    );
  }
}
