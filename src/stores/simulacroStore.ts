import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SimulacroState {
  // Estado UI
  activeSimulacroId: string | null
  currentQuestionIndex: number
  
  // Acciones
  setActiveSimulacro: (id: string | null) => void
  setQuestionIndex: (index: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
}

export const useSimulacroStore = create<SimulacroState>()(
  persist(
    (set) => ({
      activeSimulacroId: null,
      currentQuestionIndex: 0,
      
      setActiveSimulacro: (id) => set({ activeSimulacroId: id, currentQuestionIndex: 0 }),
      setQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
      prevQuestion: () => set((state) => ({ currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1) })),
    }),
    {
      name: 'simulacro-storage', // persistencia en localStorage para recargas
    }
  )
)
