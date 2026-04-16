export const msalConfig = {
  auth: {
    clientId: "2c370e68-403d-4a79-9bcc-68af26dc0388",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.hostname === "localhost" 
      ? "https://localhost:5173/" 
      : "https://dmcastillo78.github.io/GastosInetumApp/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const graphScopes = ["User.Read"];
