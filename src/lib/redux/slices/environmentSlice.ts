import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EnvironmentState {
  activeEnv: string | null;
  environments: string[];
}

const initialState: EnvironmentState = {
  activeEnv: "",
  environments: [],
};

const environmentSlice = createSlice({
  name: "environment",
  initialState,
  reducers: {
    setActiveEnv: (state, action: PayloadAction<string>) => {
      state.activeEnv = action.payload;
    },
    setEnvironments: (state, action: PayloadAction<string[]>) => {
      state.environments = action.payload;
    },
  },
});

export const { setActiveEnv, setEnvironments } = environmentSlice.actions;
export default environmentSlice.reducer;
