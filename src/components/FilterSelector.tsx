import {
    Button,
    Menu,
    MenuItem,
    Stack,
    Typography
} from "@mui/material";
import React from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CustomRadio from "./CustomRadio.tsx";

type Props = {
    filters: any[];
    selectedFilter: string;
    setFilter: () => void;
};

const FilterSelector: React.FC<Props> = ({filters}) => {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                endIcon={<KeyboardArrowDownIcon/>}
                onClick={handleClick}
                sx={{fontSize: "0.7rem"}}
            >Filters
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}>
                {filters.map((filter, index:number) => (
                    <MenuItem key={index}>
                        <Stack direction={"row"} alignItems={"center"} spacing={2}>
                            <CustomRadio></CustomRadio>
                            <Typography sx={{fontSize: "0.7rem"}}>{Object.values(filter)}</Typography>
                        </Stack>
                    </MenuItem>
                ))}
                <Button sx={{fontSize: "0.7rem"}}>Clear All Filters</Button>
            </Menu>
        </div>
    );
};

export default FilterSelector;