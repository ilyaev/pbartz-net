import { configureStore } from "@reduxjs/toolkit";
import cardsReducer from "./cards";

export const store = configureStore({
    reducer: {
        cards: cardsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export enum DATA_TYPE {
    CARD = "card",
    HAND = "hand",
    PINCH = "pinch",
    CLICK = "click",
}
