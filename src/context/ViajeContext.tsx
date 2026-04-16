import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { flowService } from "../services/flowService";

// MSAL temporalmente deshabilitado - userEmail hardcodeado
// import { useAuth } from "./AuthContext";

export interface ViajeActivo {
  id: string;
  numViaje: string;
  fechaInicio: string;
  fechaFin: string;
  ceco: string;
}

interface ViajeContextType {
  viajeActivo: ViajeActivo | null;
  isLoadingViaje: boolean;
  setViajeActivo: (viaje: ViajeActivo) => void;
  clearViajeActivo: () => void;
  recargarViajeActivo: () => Promise<void>;
}

const ViajeContext = createContext<ViajeContextType | undefined>(undefined);

const STORAGE_KEY = "gastos_viaje_activo";

interface ViajeProviderProps {
  children: ReactNode;
}

export const ViajeProvider: React.FC<ViajeProviderProps> = ({ children }) => {
  const [viajeActivo, setViajeActivoState] = useState<ViajeActivo | null>(null);
  const [isLoadingViaje, setIsLoadingViaje] = useState(true);
  
  // MSAL temporalmente deshabilitado - userEmail hardcodeado
  // const { userEmail, isAuthenticated } = useAuth();
  const userEmail = "david.moreno-castillo@inetum.com";
  const isAuthenticated = true;

  // Cargar viaje activo al montar
  useEffect(() => {
    const cargarViajeActivo = async () => {
      // Solo cargar si el usuario está autenticado
      if (!isAuthenticated || !userEmail) {
        setIsLoadingViaje(false);
        return;
      }

      try {
        // Intentar cargar desde localStorage primero
        const storedViaje = localStorage.getItem(STORAGE_KEY);
        if (storedViaje) {
          const viaje = JSON.parse(storedViaje) as ViajeActivo;
          setViajeActivoState(viaje);
        }

        // Verificar con el servidor usando el servicio
        const data = await flowService.obtenerViajeActivo({ userEmail });

        if (data.found === true && data.id) {
          // Viaje encontrado, actualizar estado y localStorage
          const viaje: ViajeActivo = {
            id: data.id,
            numViaje: data.numViaje,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            ceco: data.ceco,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(viaje));
          setViajeActivoState(viaje);
        } else {
          // No hay viaje activo en el servidor
          localStorage.removeItem(STORAGE_KEY);
          setViajeActivoState(null);
        }
      } catch (error) {
        console.error("Error al cargar viaje activo:", error);
        // En caso de error, mantener lo que hay en localStorage
      } finally {
        setIsLoadingViaje(false);
      }
    };

    cargarViajeActivo();
  }, [isAuthenticated, userEmail]);

  const setViajeActivo = (viaje: ViajeActivo) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viaje));
      setViajeActivoState(viaje);
    } catch (error) {
      console.error("Error al guardar viaje en localStorage:", error);
    }
  };

  const clearViajeActivo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setViajeActivoState(null);
    } catch (error) {
      console.error("Error al limpiar viaje de localStorage:", error);
    }
  };

  const recargarViajeActivo = async () => {
    if (!userEmail) {
      console.warn("No hay usuario autenticado para recargar viaje");
      return;
    }

    setIsLoadingViaje(true);
    try {
      const data = await flowService.obtenerViajeActivo({ userEmail });

      if (data.found === true && data.id) {
        const viaje: ViajeActivo = {
          id: data.id,
          numViaje: data.numViaje,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          ceco: data.ceco,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(viaje));
        setViajeActivoState(viaje);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setViajeActivoState(null);
      }
    } catch (error) {
      console.error("Error al recargar viaje activo:", error);
    } finally {
      setIsLoadingViaje(false);
    }
  };

  return (
    <ViajeContext.Provider
      value={{
        viajeActivo,
        isLoadingViaje,
        setViajeActivo,
        clearViajeActivo,
        recargarViajeActivo,
      }}
    >
      {children}
    </ViajeContext.Provider>
  );
};

export const useViaje = (): ViajeContextType => {
  const context = useContext(ViajeContext);
  if (context === undefined) {
    throw new Error("useViaje debe usarse dentro de un ViajeProvider");
  }
  return context;
};
