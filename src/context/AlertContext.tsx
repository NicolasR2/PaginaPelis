// src/context/AlertContext.tsx
import { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

interface AlertContextType {
  showAlert: (
    message: string,
    severity?: "success" | "error" | "warning" | "info"
  ) => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const showAlert = (
    msg: string,
    sev: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};
export const useAlert = () => useContext(AlertContext);
