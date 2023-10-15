import {Grid, Typography} from "@mui/material";
import React from "react";

type Props = {
    selectedMember: any;
}

const MemberDetail:React.FC<Props> = ({selectedMember}) => {
    return (
        <Grid>
            <Typography>{selectedMember.pubkey.toBase58().slice(0,10)}</Typography>
        </Grid>
    );
};

export default MemberDetail;