import {Box, Modal, Tab, Tabs, Typography} from "@mui/material";
import React from "react";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "70%",
    height: "60%",
    bgcolor: 'background.paper',
    border: '1px solid black',
    borderRadius: "12px",
    boxShadow: 12,
    p: 4,
    color: "black",
};

type Props = {
    handleClose: () => void;
    open: boolean;
    daoName: string;
}

const MembersModal:React.FC<Props> = ({handleClose, open,daoName}) => {
    return(
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography>{daoName}</Typography>
                <Typography>Members</Typography>
            </Box>
            <Box
                sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
            >
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    <Tab label="Item One"  />
                    <Tab label="Item Two" />
                    <Tab label="Item Three"/>
                    <Tab label="Item Four"  />
                    <Tab label="Item Five" />
                    <Tab label="Item Six" />
                    <Tab label="Item Seven"/>
                </Tabs>
                <TabPanel value={value} index={0}>
                    Item One
                </TabPanel>
                <TabPanel value={value} index={1}>
                    Item Two
                </TabPanel>
                <TabPanel value={value} index={2}>
                    Item Three
                </TabPanel>

            </Box>
        </Modal>
    );
};

export default MembersModal;