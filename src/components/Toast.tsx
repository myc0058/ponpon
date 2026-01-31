'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import styles from './Toast.module.css'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, message, type }])

        // Auto remove after 3 seconds
        setTimeout(() => {
            setRemovingIds((prev) => {
                const newSet = new Set(prev)
                newSet.add(id)
                return newSet
            })

            // Remove from DOM after animation
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
                setRemovingIds((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(id)
                    return newSet
                })
            }, 300) // Match animation duration
        }, 3000)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${removingIds.has(toast.id) ? styles.removing : ''}`}
                    >
                        <div className={styles.icon}>
                            {toast.type === 'success' && <CheckCircle2 size={24} color="#10b981" />}
                            {toast.type === 'error' && <AlertCircle size={24} color="#ef4444" />}
                            {toast.type === 'info' && <Info size={24} color="#6d28d9" />}
                        </div>
                        <span className={styles.message}>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
