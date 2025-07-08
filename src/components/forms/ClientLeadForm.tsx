'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitClientLead } from '@/lib/forms/client-submission'
import { logClientError } from '@/lib/client-error-logger'
import { Button } from '@/catalyst/components/button'
import { Heading } from '@/catalyst/components/heading'
import { Text } from '@/catalyst/components/text'
import { Input } from '@/catalyst/components/input'
import { Field, Fieldset, FieldGroup } from '@/catalyst/components/fieldset'
import * as Headless from '@headlessui/react'

const clientLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  mobilePhone: z.string().min(10, 'Valid phone number is required'),
})

type ClientLeadFormData = z.infer<typeof clientLeadSchema>

export default function ClientLeadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [portalUuid, setPortalUuid] = useState<string>('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientLeadFormData>({
    resolver: zodResolver(clientLeadSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
    },
  })

  const onSubmit = async (data: ClientLeadFormData) => {
    setIsLoading(true)
    let userEmail: string | undefined
    let clientId: string | undefined

    try {
      userEmail = data.email
      clientId = await submitClientLead(data)

      const response = await fetch('/api/portal/create-from-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
      })

      const result = await response.json()

      if (result.success) {
        setPortalUuid(result.portalUuid)
        setIsSuccess(true)
      } else {
        logClientError(result.error, { operation: 'create_portal', clientId })
      }
    } catch (error) {
      logClientError(error, { operation: 'submit_client_lead', userEmail, clientId })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Heading level={2} className="text-xl font-semibold text-gray-900">
              Success!
            </Heading>
            <Text className="text-gray-600">
              Your information has been submitted successfully
            </Text>
          </div>
          
          <div className="space-y-4">
            <Text className="text-center text-gray-500">
              Portal ID: {portalUuid}
            </Text>
            <Button
              className="w-full"
              onClick={() =>
                (window.location.href = `/portal/${portalUuid}/register`)
              }
            >
              Complete Portal Registration
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Heading level={2} className="text-xl font-semibold text-gray-900">
            Get Started
          </Heading>
          <Text className="text-gray-600">
            Enter your details to begin
          </Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Headless.Label className="text-sm font-medium text-gray-900">
                  First Name
                </Headless.Label>
                <Input
                  {...register('firstName')}
                  type="text"
                  placeholder="John"
                  className="mt-2"
                />
                {errors.firstName && (
                  <Text className="text-sm text-red-600 mt-1">
                    {errors.firstName.message}
                  </Text>
                )}
              </Field>

              <Field>
                <Headless.Label className="text-sm font-medium text-gray-900">
                  Last Name
                </Headless.Label>
                <Input
                  {...register('lastName')}
                  type="text"
                  placeholder="Doe"
                  className="mt-2"
                />
                {errors.lastName && (
                  <Text className="text-sm text-red-600 mt-1">
                    {errors.lastName.message}
                  </Text>
                )}
              </Field>

              <Field>
                <Headless.Label className="text-sm font-medium text-gray-900">
                  Email
                </Headless.Label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className="mt-2"
                />
                {errors.email && (
                  <Text className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </Field>

              <Field>
                <Headless.Label className="text-sm font-medium text-gray-900">
                  Phone Number
                </Headless.Label>
                <Input
                  {...register('mobilePhone')}
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="mt-2"
                />
                {errors.mobilePhone && (
                  <Text className="text-sm text-red-600 mt-1">
                    {errors.mobilePhone.message}
                  </Text>
                )}
              </Field>

              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </FieldGroup>
          </Fieldset>
        </form>
      </div>
    </div>
  )
}