import { Typography, Container } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate("/"), 2000);
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ marginTop: "50px", textAlign: "center" }}>
      <Typography variant="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1">The page you are looking for does not exist.You are redirecting to Home Page</Typography>
    </Container>
  );
};

export default NotFoundPage;
