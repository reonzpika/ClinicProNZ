'use client'

import React, { useState } from 'react'
import { Button } from '@/src/shared/components/ui/button'
import { useConsultationStores } from '@/src/hooks/useConsultationStores'
import { useGenerateConsultationNotes } from '@/src/hooks/consultation/useConsultationQueries'

interface ConsultationNotesGeneratorProps {
  onSuccess?: (notes: string) => void
  onError?: (error: Error) => void
}

export function ConsultationNotesGenerator({ 
  onSuccess, 
  onError 
}: ConsultationNotesGeneratorProps) {
  // Note: userTier is handled automatically in the React Query hooks
  
  const {
    transcription,
    typedInput,
    inputMode,
    templateId,
    currentPatientSessionId,
    getCompiledConsultationText,
    getEffectiveGuestToken,
    setGeneratedNotes,
  } = useConsultationStores()

  const [isGenerating, setIsGenerating] = useState(false)

  // React Query mutation for generating notes
  const generateNotesMutation = useGenerateConsultationNotes()

  const handleGenerateNotes = async () => {
    if (!currentPatientSessionId) {
      onError?.(new Error('No active patient session'))
      return
    }

    setIsGenerating(true)

    try {
      // Prepare the consultation data
      const mainContent = inputMode === 'audio' ? transcription.transcript : typedInput
      const additionalContent = getCompiledConsultationText()

      // Combine main content with additional notes
      const combinedTranscription = additionalContent && additionalContent.trim()
        ? `${mainContent}\n\nADDITIONAL NOTES:\n${additionalContent}`
        : mainContent

      // Prepare the request data to match the actual API
      const requestData = {
        rawConsultationData: combinedTranscription,
        templateId: templateId || '', // Use empty string if no template
        guestToken: getEffectiveGuestToken(),
      }

      // Use React Query mutation to generate notes
      const result = await generateNotesMutation.mutateAsync(requestData)

      // Update the generated notes in the consultation context
      setGeneratedNotes(result.notes)
      
      onSuccess?.(result.notes)
    } catch (error) {
      console.error('Error generating consultation notes:', error)
      onError?.(error as Error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerateNotes}
        disabled={isGenerating || generateNotesMutation.isPending}
        className="w-full"
      >
        {isGenerating || generateNotesMutation.isPending 
          ? 'Generating Notes...' 
          : 'Generate Consultation Notes'
        }
      </Button>

      {generateNotesMutation.error && (
        <div className="text-red-500 text-sm">
          Error: {generateNotesMutation.error.message}
        </div>
      )}

      {generateNotesMutation.isSuccess && (
        <div className="text-green-500 text-sm">
          Notes generated successfully!
        </div>
      )}
    </div>
  )
}