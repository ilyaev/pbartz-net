import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DraggableCardState } from "../systems/cards";

export const cardsSlice = createSlice({
    name: "cards",
    initialState: {
        items: [] as DraggableCardState[],
    },
    reducers: {
        addCard: (state, action: PayloadAction<DraggableCardState>) => {
            const maxId = state.items.reduce((acc, card) => {
                return Math.max(acc, card.id);
            }, 0);
            state.items.push(
                Object.assign({}, action.payload, { id: maxId + 1 })
            );
        },
        deleteCard: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(
                (card) => card.id !== action.payload
            );
        },
        updateCard: (
            state,
            action: PayloadAction<Partial<DraggableCardState>>
        ) => {
            const index = state.items.findIndex(
                (card) => card.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = Object.assign(
                    {},
                    state.items[index],
                    action.payload
                );
            }
        },
        processCards: (state) => {
            state.items = ([] as DraggableCardState[]).concat(
                state.items.map((card) => {
                    // card.x += 0.04;
                    return { ...card, x: card.x + 0.01 };
                })
            );
        },
    },
});

export const { addCard, deleteCard, updateCard, processCards } =
    cardsSlice.actions;

export default cardsSlice.reducer;
