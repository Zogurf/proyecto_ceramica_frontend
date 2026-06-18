export type AuthUser = {
  name: string;
  role: string;
  email?: string;
};

export type AuthModalProps = {
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
};
