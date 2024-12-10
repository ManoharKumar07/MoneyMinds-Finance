import { createSlice } from "@reduxjs/toolkit";

export const roscaSlice = createSlice({
  name: "rosca",
  initialState: {
    roscaId: null, // Initially, no rosca is selected
  },
  reducers: {
    setRoscaId: (state, action) => {
      state.roscaId = action.payload;
    },
    resetRoscaId: (state) => {
      state.roscaId = null;
    },
  },
});

export const { setRoscaId, resetRoscaId } = roscaSlice.actions;
