import React from "react";
import {Button, Card, CardContent, Chip, CircularProgress, Stack, Theme, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
    card: {
        borderRadius: "16px !important",
        height: "160px",
    },
    content: {
        padding: "1rem !important",
    },
    button: {
        color: "black !important",
        backgroundColor: "#26ea9a99 !important",
    },
    title: {
        fontSize: "1.25rem !important",
        fontWeight: "bold !important",

        [theme.breakpoints.down("xl")]: {
            fontSize: "1rem !important",
        },
    },
    currentBlock: {
        fontSize: "1.25rem !important",
        [theme.breakpoints.down("xl")]: {
            fontSize: "1rem !important",
        },
    },
    currentBlockStack: {
        marginTop: "1.5rem",
        [theme.breakpoints.down("xl")]: {
            marginTop: "1.5rem",
        },
        [theme.breakpoints.down("lg")]: {
            marginTop: "1rem",
        }, [theme.breakpoints.down("md")]: {
            marginTop: "2rem",
        }, [theme.breakpoints.down("sm")]: {
            marginTop: "1rem",
        },
    }
}));

type Props = {
    lastBlock: number;
    loading: boolean;
};

const CurrentBlock: React.FC<Props> = ({lastBlock, loading}) => {
    const classes = useStyles();
    return (
        <Card className={classes.card}>
            <CardContent className={classes.content}>
                <Stack direction={"row"} spacing={2}>
                    <Typography className={classes.title} color="text.secondary">
                        Current Block
                    </Typography>
                    <Stack spacing={1} direction={"row"} alignItems={"center"}>
                        <Chip size="small"
                              sx={{fontSize: "12px"}}
                              label="Live" color="success"/>
                        <Chip size="small"
                              sx={{fontSize: "12px"}}
                              color="success" label="Devnet"/>
                    </Stack>
                </Stack>

                {loading ? (
                    <CurrentBlockLoading/>
                ) : (
                    <Stack direction={"row"} spacing={4} className={classes.currentBlockStack} alignItems={"center"}>
                        <Typography className={classes.currentBlock}>{lastBlock}</Typography>
                        <Button sx={{maxHeight: "2rem"}} size="small" variant="contained" className={classes.button}>
                            View
                        </Button>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};

export const CurrentBlockLoading = () => {
    return (
        <Card
            sx={{
                borderRadius: "16px !important",
                height: "80px",
            }}
        >
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress/>
            </div>
        </Card>
    );
};

export default CurrentBlock;
