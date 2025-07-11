import React from "react";

import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

const CustomLoader = () => {
    return (
        <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 9999 }}>
            <LinearProgress color="blue" />
        </Box>
    );
}

export default CustomLoader;