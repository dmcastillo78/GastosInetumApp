// Servicio para gestionar llamadas a Power Automate Flows

const FLOW_ENDPOINTS = {
  nuevoViaje:
    "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4af45ce732e447be9b7c0a5f03ea99fd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Hs0ksCxYaTrNxICJdLzFFuZ3Fl__fZvlj0LUBt2pwTE",
  obtenerViajeActivo:
    "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/da0f7e2ba61a4a489c74a8da3dc9d7b2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YRqHO6NwtLLUalM1-iItLFp84LRoQpuyrEUVKIEe_4I",
  nuevoTicket:
    "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/07fe64faf5e04adda0ac34ad7925cfa0/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=OWIX1C3TW7GvS-e-lx_MYjlwFiDuGOl1h_HBPdF9x0Y",
  actualizarTicket:
    "https://cb2d3297d484eb42ae60646399e38f.fe.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3e9eaee7a1664cdca70b83332b98b45d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8X4GEczvLz41k2c4vt5kd3IFDcUXazhtAy-JlsF0FuY",
} as const;

export interface NuevoViajeParams {
  userEmail: string;
  fechaInicio: string;
  fechaFin: string;
  ceco: string;
  ciudad: string;
}

export interface ObtenerViajeActivoParams {
  userEmail: string;
}

export interface NuevoTicketParams {
  userEmail: string;
  viajeId: string;
  categoria: string;
  descripcion: string;
  importe: number;
  fecha: string;
  imageBase64: string;
}

export interface ActualizarTicketParams {
  userEmail: string;
  ticketId: string;
  categoria?: string;
  descripcion?: string;
  importe?: number;
  fecha?: string;
}

class FlowService {
  private async callFlow<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Flow error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling flow:", error);
      throw error;
    }
  }

  async nuevoViaje(params: NuevoViajeParams) {
    return this.callFlow(FLOW_ENDPOINTS.nuevoViaje, params);
  }

  async obtenerViajeActivo(params: ObtenerViajeActivoParams) {
    return this.callFlow(FLOW_ENDPOINTS.obtenerViajeActivo, params);
  }

  async nuevoTicket(params: NuevoTicketParams) {
    return this.callFlow(FLOW_ENDPOINTS.nuevoTicket, params);
  }

  async actualizarTicket(params: ActualizarTicketParams) {
    return this.callFlow(FLOW_ENDPOINTS.actualizarTicket, params);
  }
}

export const flowService = new FlowService();
