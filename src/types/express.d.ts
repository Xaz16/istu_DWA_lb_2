declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: number;
        login: string;
        role: string;
      };
    }
  }
}

export {};
