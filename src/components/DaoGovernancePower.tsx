import { CardActionArea, Card, CardContent, Typography, Box, Stack, Button } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { DAO_TYPE } from "../utils/enum";
import { RpcResponseAndContext, TokenAmount } from "@solana/web3.js";
import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import { useMemo } from "react";

type Props = {
  style: any;
  type: DAO_TYPE;
  token: RpcResponseAndContext<TokenAmount> | undefined;
  membersCount: number;
  member?: ProgramAccount<TokenOwnerRecord>;
  depositOnClick: () => void;
};

const DaoGovernancePower: React.FC<Props> = ({ style, type, token, membersCount, member, depositOnClick }) => {
  const balance = useMemo(() => {
    if (token && member) {
      const value = member.account.governingTokenDepositAmount.toNumber() / Math.pow(10, token.value.decimals);

      return value;
    }

    return 0;
  }, [member, token]);

  return (
    <CardActionArea>
      <Card className={style}>
        <CardContent>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography variant={"h6"}>My Governance Power</Typography>
            <Button sx={{ fontSize: "16", alignItems: "baseline" }} endIcon={<ArrowForwardIosIcon sx={{ width: 16, height: 16 }}></ArrowForwardIosIcon>}>
              Detail
            </Button>
          </Stack>
          {type == DAO_TYPE.COMMUNITY && token && (
            <div>
              <Box sx={{ backgroundColor: "#ebebeb", borderRadius: "12px" }}>
                <Stack padding={"1rem"} marginTop={"1rem"}>
                  <Typography variant="subtitle2">ogicik2 Votes</Typography>
                  <Stack direction={"row"} justifyContent={"space-between"} alignItems={"baseline"}>
                    <Typography variant="h6">{balance}</Typography>
                    <Typography variant="subtitle1">
                      {token.value.uiAmount && token.value.uiAmount > 0 ? ((balance / token.value.uiAmount) * 100).toFixed(2) : 0}% of Total
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "12px",
                  bgcolor: "white",
                  color: "#1793D1",
                  border: "1px solid #1793D1",
                  marginTop: "1rem",
                  ":hover": { backgroundColor: "#ebebeb", color: "#1793D1" },
                }}
                onClick={depositOnClick}
              >
                Deposit
              </Button>
            </div>
          )}
          {type == DAO_TYPE.MULTI_SIGNATURE && (
            <Box sx={{ backgroundColor: "#ebebeb", borderRadius: "12px" }}>
              <Stack padding={"1rem"} marginTop={"1rem"}>
                <Typography variant="subtitle2">ogicik2 Council Votes</Typography>
                <Stack direction={"row"} justifyContent={"space-between"}>
                  <Typography variant="h6">1</Typography>
                  <Typography variant="h6">{Math.floor(100 / membersCount)}% of Total</Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export default DaoGovernancePower;
