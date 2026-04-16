import React, { useState, useRef } from "react";
import {
  Button,
  Card,
  makeStyles,
  shorthands,
  tokens,
  Text,
  Input,
} from "@fluentui/react-components";
import { ShieldLock24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding("20px"),
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    ...shorthands.padding("32px", "24px"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.gap("24px"),
  },
  iconContainer: {
    width: "64px",
    height: "64px",
    ...shorthands.borderRadius("50%"),
    backgroundColor: tokens.colorBrandBackground2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorBrandForeground1,
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: tokens.colorNeutralForeground2,
    textAlign: "center",
  },
  pinContainer: {
    display: "flex",
    ...shorthands.gap("12px"),
    justifyContent: "center",
    width: "100%",
  },
  pinInput: {
    width: "56px",
    height: "56px",
    fontSize: "24px",
    fontWeight: 600,
    textAlign: "center",
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "14px",
    textAlign: "center",
  },
  loginButton: {
    width: "100%",
  },
});

// Tabla de usuarios hardcodeada
const USERS = [
  { pin: "1234", email: "david.moreno-castillo@inetum.com", nombre: "David Moreno" },
  { pin: "5678", email: "test@inetum.com", nombre: "Usuario Test" },
];

interface LoginPinProps {
  onLoginSuccess: () => void;
}

export const LoginPin: React.FC<LoginPinProps> = ({ onLoginSuccess }) => {
  const styles = useStyles();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Auto-focus en el siguiente input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Si se completaron los 4 dígitos, intentar login
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join("");
      handleLogin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newPin = pastedData.split("").concat(["", "", "", ""]).slice(0, 4);
    setPin(newPin);

    // Enfocar el siguiente input vacío
    const nextEmptyIndex = newPin.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs[nextEmptyIndex].current?.focus();
    } else {
      handleLogin(newPin.join(""));
    }
  };

  const handleLogin = async (fullPin: string) => {
    setIsLoading(true);
    setError("");

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = USERS.find(u => u.pin === fullPin);

    if (user) {
      // Guardar en localStorage
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.nombre);
      
      // Llamar al callback de éxito
      onLoginSuccess();
    } else {
      setError("PIN incorrecto");
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    }

    setIsLoading(false);
  };

  const handleManualLogin = () => {
    const fullPin = pin.join("");
    if (fullPin.length === 4) {
      handleLogin(fullPin);
    } else {
      setError("Por favor, introduce los 4 dígitos");
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.iconContainer}>
          <ShieldLock24Regular />
        </div>

        <div>
          <h1 className={styles.title}>Gestión de Gastos Inetum</h1>
          <p className={styles.subtitle}>
            Introduce tu PIN de 4 dígitos para acceder
          </p>
        </div>

        <div className={styles.pinContainer}>
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={styles.pinInput}
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <Text className={styles.errorMessage}>{error}</Text>
        )}

        <Button
          appearance="primary"
          size="large"
          onClick={handleManualLogin}
          disabled={isLoading || pin.join("").length !== 4}
          className={styles.loginButton}
        >
          {isLoading ? "Verificando..." : "Iniciar Sesión"}
        </Button>

        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          PIN temporal para desarrollo
        </Text>
      </Card>
    </div>
  );
};
