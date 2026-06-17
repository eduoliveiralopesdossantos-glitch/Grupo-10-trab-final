/**
 * Dados usados pelos formulários de autenticação.
 */
export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

export class AuthService {
  private readonly minPasswordLength = 8;

  /**
   * Valida se o email informado possui formato básico correto.
   */
  validateEmail(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(normalized);
  }

  /**
   * Valida se a senha atende ao tamanho mínimo.
   */
  validatePassword(password: string): boolean {
    return password.trim().length >= this.minPasswordLength;
  }

  /**
   * Valida se o nome do usuário contém ao menos três caracteres.
   */
  validateName(name: string): boolean {
    return name.trim().length >= 3;
  }

  /**
   * Validação de login baseada em email e senha.
   */
  login(data: AuthFormData): boolean {
    return this.validateEmail(data.email) && this.validatePassword(data.password);
  }

  /**
   * Validação de cadastro com nome, email e senha.
   */
  register(data: AuthFormData): boolean {
    return (
      this.validateName(data.name ?? '') &&
      this.validateEmail(data.email) &&
      this.validatePassword(data.password)
    );
  }
}
