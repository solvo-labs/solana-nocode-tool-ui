import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 400 : 200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#5DC9EB" : "#308fe8",
  },
}));

type Props = {
  value: number;
};

const CustomizedProgressBars: React.FC<Props> = ({ value }) => {
  return (
    <Box sx={{ flexGrow: 1, marginTop: "0.5rem" }}>
      <BorderLinearProgress variant="determinate" value={value} />
    </Box>
  );
};

export default CustomizedProgressBars;
