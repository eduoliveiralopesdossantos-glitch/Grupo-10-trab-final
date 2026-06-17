import { AuthService, type AuthFormData } from './auth';

const authService = new AuthService();
const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab-button');
const authForms = document.querySelectorAll<HTMLFormElement>('.auth-form');
const loginForm = document.querySelector<HTMLFormElement>('#login-form');
const registerForm = document.querySelector<HTMLFormElement>('#register-form');

function setActiveTab(targetId: string): void {
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.target === targetId);
  });

  authForms.forEach((form) => {
    form.classList.toggle('active', form.id === targetId);
  });
}

function showMessage(message: string): void {
  window.alert(message);
}

function handleLogin(event: SubmitEvent): void {
  event.preventDefault();

  const email = (document.querySelector<HTMLInputElement>('#login-email')?.value ?? '').trim();
  const password = (document.querySelector<HTMLInputElement>('#login-password')?.value ?? '').trim();
  const formData: AuthFormData = { email, password };

  if (!authService.login(formData)) {
    showMessage('Por favor, informe um email válido e senha com pelo menos 8 caracteres.');
    return;
  }

  showMessage('Login realizado com sucesso! Bem-vindo de volta à Elite Sports Wear.');
  loginForm?.reset();
}

function handleRegister(event: SubmitEvent): void {
  event.preventDefault();

  const name = (document.querySelector<HTMLInputElement>('#register-name')?.value ?? '').trim();
  const email = (document.querySelector<HTMLInputElement>('#register-email')?.value ?? '').trim();
  const password = (document.querySelector<HTMLInputElement>('#register-password')?.value ?? '').trim();
  const formData: AuthFormData = { name, email, password };

  if (!authService.register(formData)) {
    showMessage('Por favor, verifique se todos os campos estão preenchidos corretamente.');
    return;
  }

  showMessage('Conta criada com sucesso! Agora faça login para continuar.');
  registerForm?.reset();
  setActiveTab('login-form');
}

document.addEventListener('DOMContentLoaded', () => {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.target ?? 'login-form'));
  });

  loginForm?.addEventListener('submit', handleLogin);
  registerForm?.addEventListener('submit', handleRegister);
});
