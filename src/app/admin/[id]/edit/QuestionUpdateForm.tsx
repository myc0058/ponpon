'use client'

import React, { useRef } from 'react'

export function QuestionUpdateForm({ children, action }: { children: React.ReactNode, action: (formData: FormData) => Promise<void> }) {
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = async (formData: FormData) => {
        try {
            await action(formData)
            // 폼 제출 성공 시 간소화된 alert 대신 더 좋은 UI가 있으면 좋겠지만, 
            // 현재 요청사항은 "메시지가 떠야됨"이므로 브라우저 기본 alert 사용
            alert('저장되었습니다!')
        } catch (error) {
            console.error(error)
            alert('저장 중 오류가 발생했습니다.')
        }
    }

    return (
        <form
            ref={formRef}
            action={handleSubmit}
            className="question-update-form"
            style={{
                border: 'none',
                padding: 0,
                marginTop: 0,
                backgroundColor: 'transparent',
                display: 'contents'
            }}
        >
            {children}
        </form>
    )
}
