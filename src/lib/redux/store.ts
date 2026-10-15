import { configureStore } from "@reduxjs/toolkit";
import environmentReducer from "./slices/environmentSlice";

export const store = configureStore({
  reducer: {
    environment: environmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
