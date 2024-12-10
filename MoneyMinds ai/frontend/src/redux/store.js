import { configureStore } from "@reduxjs/toolkit";
import { alertSlice } from "./features/alertSlice";
import { userSlice } from "./features/userSlice";
import { roscaSlice } from "./features/roscaSlice"; // Import the roscaSlice

export default configureStore({
  reducer: {
    alerts: alertSlice.reducer,
    user: userSlice.reducer,
    rosca: roscaSlice.reducer, // Add rosca slice to the store
  },
});
