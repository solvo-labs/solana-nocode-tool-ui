import {Grid, Typography} from "@mui/material";
import React from "react";

type Props = {
    selectedMember: any;
}

const MemberDetail:React.FC<Props> = ({selectedMember}) => {
    return (
        <Grid>
            <Typography>{selectedMember.account.governingTokenOwner.toBase58().slice(0, 5) + "..." + selectedMember.account.governingTokenOwner.toBase58().slice(-5)}</Typography>
        </Grid>
    );
};

export default MemberDetail;