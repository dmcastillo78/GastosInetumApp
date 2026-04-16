// Servicio para llamadas a Microsoft Graph API

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

export interface UserProfile {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  size: number;
}

class GraphService {
  /**
   * Obtiene el perfil del usuario actual
   */
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    const response = await fetch(`${GRAPH_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener perfil: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Sube un archivo a OneDrive del usuario
   * @param accessToken Token de acceso
   * @param fileName Nombre del archivo
   * @param fileContent Contenido del archivo (ArrayBuffer, Blob, etc.)
   * @param folderPath Ruta de la carpeta (ej: "Gastos", "Gastos/2026")
   */
  async uploadFileToOneDrive(
    accessToken: string,
    fileName: string,
    fileContent: ArrayBuffer | Blob,
    folderPath?: string
  ): Promise<DriveItem> {
    // Construir la ruta del endpoint
    let uploadPath = `/me/drive/root`;
    if (folderPath) {
      uploadPath += `:/${folderPath}`;
    }
    uploadPath += `:/${fileName}:/content`;

    const response = await fetch(`${GRAPH_BASE_URL}${uploadPath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: fileContent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al subir archivo: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Crea una carpeta en OneDrive
   * @param accessToken Token de acceso
   * @param folderName Nombre de la carpeta
   * @param parentPath Ruta padre (opcional, por defecto raíz)
   */
  async createFolder(
    accessToken: string,
    folderName: string,
    parentPath?: string
  ): Promise<DriveItem> {
    let endpoint = `${GRAPH_BASE_URL}/me/drive/root/children`;
    if (parentPath) {
      endpoint = `${GRAPH_BASE_URL}/me/drive/root:/${parentPath}:/children`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear carpeta: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Envía un email usando Microsoft Graph
   * @param accessToken Token de acceso
   * @param to Destinatario(s)
   * @param subject Asunto
   * @param body Cuerpo del mensaje (HTML)
   * @param attachments Adjuntos (opcional)
   */
  async sendEmail(
    accessToken: string,
    to: string | string[],
    subject: string,
    body: string,
    attachments?: Array<{
      name: string;
      contentBytes: string; // Base64
      contentType: string;
    }>
  ): Promise<void> {
    const recipients = Array.isArray(to) ? to : [to];

    const message = {
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: body,
        },
        toRecipients: recipients.map((email) => ({
          emailAddress: {
            address: email,
          },
        })),
        ...(attachments && attachments.length > 0 && { attachments }),
      },
    };

    const response = await fetch(`${GRAPH_BASE_URL}/me/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al enviar email: ${response.status} - ${errorText}`);
    }
  }

  /**
   * Obtiene el contenido de un archivo de OneDrive
   * @param accessToken Token de acceso
   * @param itemId ID del item en OneDrive
   */
  async getFileContent(accessToken: string, itemId: string): Promise<ArrayBuffer> {
    const response = await fetch(`${GRAPH_BASE_URL}/me/drive/items/${itemId}/content`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener contenido: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Lista archivos en una carpeta de OneDrive
   * @param accessToken Token de acceso
   * @param folderPath Ruta de la carpeta (opcional, por defecto raíz)
   */
  async listFiles(accessToken: string, folderPath?: string): Promise<DriveItem[]> {
    let endpoint = `${GRAPH_BASE_URL}/me/drive/root/children`;
    if (folderPath) {
      endpoint = `${GRAPH_BASE_URL}/me/drive/root:/${folderPath}:/children`;
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al listar archivos: ${response.status}`);
    }

    const data = await response.json();
    return data.value || [];
  }
}

export const graphService = new GraphService();
