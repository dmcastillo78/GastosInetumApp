import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const ViajeContext = createContext<ViajeContextType | undefined>(undefined);

const STORAGE_KEY = "gastos_viaje_activo";

interface ViajeProviderProps {
  children: ReactNode;
}

export const ViajeProvider: React.FC<ViajeProviderProps> = ({ children }) => {
  const [viajeActivo, setViajeActivoState] = useState<ViajeActivo | null>(null);
  const [isLoadingViaje, setIsLoadingViaje] = useState(true);

  // Cargar viaje activo al montar
  useEffect(() => {
    const cargarViajeActivo = async () => {
      try {
        // Intentar cargar desde localStorage primero
        const storedViaje = localStorage.getItem(STORAGE_KEY);
        if (storedViaje) {
          const viaje = JSON.parse(storedViaje) as ViajeActivo;
          setViajeActivoState(viaje);
        }

        // Verificar con el servidor
        const response = await fetch(
          "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/da0f7e2ba61a4a489c74a8da3dc9d7b2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YRqHO6NwtLLUalM1-iItLFp84LRoQpuyrEUVKIEe_4I",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: "david.moreno-castillo@inetum.com",
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          
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
        } else {
          console.warn("Error al verificar viaje activo en el servidor");
          // Mantener el viaje de localStorage si existe
        }
      } catch (error) {
        console.error("Error al cargar viaje activo:", error);
        // En caso de error, mantener lo que hay en localStorage
      } finally {
        setIsLoadingViaje(false);
      }
    };

    cargarViajeActivo();
  }, []);

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

  return (
    <ViajeContext.Provider
      value={{
        viajeActivo,
        isLoadingViaje,
        setViajeActivo,
        clearViajeActivo,
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
