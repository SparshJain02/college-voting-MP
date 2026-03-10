import { configureStore } from '@reduxjs/toolkit'
import  authStateReducer  from '../features/auth/auth-stateSlice.js'

export default configureStore({
  reducer: {
    authState: authStateReducer,
  },
})