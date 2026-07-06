import { demoResume } from '@airesumecraft/shared'
import { describe, expect, it } from 'vitest'
import { useResumeValidation } from '../useResumeValidation'

describe('useResumeValidation', () => {
  it('requires a non-empty profile name', () => {
    const { validateRequiredName } = useResumeValidation()

    expect(validateRequiredName('Lin Yinuo').valid).toBe(true)
    expect(validateRequiredName('   ').errors).toEqual([
      { code: 'name-required' },
    ])
  })

  it('allows empty emails but rejects malformed email values', () => {
    const { validateEmail } = useResumeValidation()

    expect(validateEmail('').valid).toBe(true)
    expect(validateEmail('lin@example.com').valid).toBe(true)
    expect(validateEmail('lin@example').errors).toEqual([
      { code: 'email-invalid' },
    ])
  })

  it('validates export readiness without mutating the resume document', () => {
    const { validateResumeForExport } = useResumeValidation()
    const document = structuredClone(demoResume)
    document.modules = []

    expect(validateResumeForExport(document).errors).toEqual([
      { code: 'preview-empty' },
    ])
  })
})
