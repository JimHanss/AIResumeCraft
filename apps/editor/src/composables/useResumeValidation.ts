import type { ResumeDocument } from '@airesumecraft/shared'

export type ResumeValidationErrorCode
  = 'email-invalid' | 'name-required' | 'preview-empty'

export interface ResumeValidationError {
  code: ResumeValidationErrorCode
}

export interface ResumeValidationResult {
  errors: ResumeValidationError[]
  valid: boolean
}

const emailPattern = /^[^\s@]+@[^\s@][^\s.@]*(?:\.[^\s@.]+)+$/

function createResult(errors: ResumeValidationError[]): ResumeValidationResult {
  return {
    errors,
    valid: errors.length === 0,
  }
}

export function validationMessageKey(code: ResumeValidationErrorCode) {
  return `editor.validation.${code}` as const
}

export function useResumeValidation() {
  function validateRequiredName(name: string) {
    return createResult(
      name.trim()
        ? []
        : [
            {
              code: 'name-required',
            },
          ],
    )
  }

  function validateEmail(email: string) {
    const value = email.trim()
    return createResult(
      !value || emailPattern.test(value)
        ? []
        : [
            {
              code: 'email-invalid',
            },
          ],
    )
  }

  function validatePreviewDocument(document: ResumeDocument) {
    return createResult(
      document.modules.length > 0
        ? []
        : [
            {
              code: 'preview-empty',
            },
          ],
    )
  }

  function validateResumeForExport(document: ResumeDocument) {
    return createResult([
      ...validateRequiredName(document.profile.name).errors,
      ...validateEmail(document.profile.email).errors,
      ...validatePreviewDocument(document).errors,
    ])
  }

  return {
    validateEmail,
    validatePreviewDocument,
    validateRequiredName,
    validateResumeForExport,
    validationMessageKey,
  }
}
