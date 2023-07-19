import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  id: 1,
  name: 'talos',
};

const framework = createSlice({
  name: 'framework',
  initialState,
  reducers: {
    updateFramework(
      state,
      action: PayloadAction<{
        id: number;
        name: string;
      }>,
    ) {
      state.id = action.payload.id;
      state.name = action.payload.name;
    },
  },
});

export const { updateFramework } = framework.actions;
export default framework.reducer;
