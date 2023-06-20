import React from "react";
import Router from "./router/Router";
import { ThemeProvider } from "@mui/styles";
import { createTheme } from "@mui/material";

const App: React.FC = () => {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
};

export default App;
