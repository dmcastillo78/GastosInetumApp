import React, { createContext, useContext, useState, useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { graphScopes } from "../authConfig";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  accessToken: string | null;
  acquireToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("msalAccessToken")
  );

  const userAccount = accounts[0];
  const userEmail = userAccount?.username || null;
  const userName = userAccount?.name || null;

  // Función para adquirir token silenciosamente o con popup
  const acquireToken = async (): Promise<string | null> => {
    if (!isAuthenticated || !userAccount) {
      console.warn("Usuario no autenticado");
      return null;
    }

    try {
      // Intentar adquirir token silenciosamente
      const response = await instance.acquireTokenSilent({
        scopes: graphScopes,
        account: userAccount,
      });

      const token = response.accessToken;
      localStorage.setItem("msalAccessToken", token);
      setAccessToken(token);
      return token;
    } catch (error) {
      console.warn("Token silencioso falló, intentando con popup:", error);
      
      // Si falla, intentar con popup
      try {
        const response = await instance.acquireTokenPopup({
          scopes: graphScopes,
        });

        const token = response.accessToken;
        localStorage.setItem("msalAccessToken", token);
        setAccessToken(token);
        return token;
      } catch (popupError) {
        console.error("Error al adquirir token:", popupError);
        return null;
      }
    }
  };

  // Adquirir token al montar si está autenticado
  useEffect(() => {
    if (isAuthenticated && !accessToken) {
      acquireToken();
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    isAuthenticated,
    userEmail,
    userName,
    accessToken,
    acquireToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
