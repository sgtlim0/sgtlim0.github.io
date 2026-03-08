/**
 * CSRF Usage Example
 *
 * This file demonstrates how to use the CSRF protection utilities
 * in React components and API calls.
 */

import { useCsrf } from './csrf'

/**
 * Example: Using CSRF in a React component
 */
export function ExampleFormComponent() {
  const { token, addToHeaders } = useCsrf()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/protected-endpoint', {
        method: 'POST',
        headers: addToHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit({ /* form data */ })
    }}>
      {/* Include CSRF token as hidden field for traditional form submissions */}
      <input type="hidden" name="csrf_token" value={token} />

      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  )
}

/**
 * Example: API route handler with CSRF validation (Next.js)
 */
export async function POST(request: Request) {
  // Get CSRF token from header
  const csrfToken = request.headers.get('X-CSRF-Token')

  // In a real implementation, you would validate this on the server
  // by comparing with the session token
  if (!csrfToken) {
    return new Response('CSRF token missing', { status: 403 })
  }

  // Validate token (in production, this would be done server-side)
  // For now, this is just a placeholder
  const isValid = true // validateCsrfToken(csrfToken)

  if (!isValid) {
    return new Response('Invalid CSRF token', { status: 403 })
  }

  // Process the request
  const data = await request.json()
  // ... handle the request ...

  return Response.json({ success: true })
}

/**
 * Example: Using CSRF with fetch wrapper
 */
export class SecureApiClient {
  private csrf = useCsrf()

  async post(url: string, data: any) {
    return fetch(url, {
      method: 'POST',
      headers: this.csrf.addToHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(data),
    })
  }

  async put(url: string, data: any) {
    return fetch(url, {
      method: 'PUT',
      headers: this.csrf.addToHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(data),
    })
  }

  async delete(url: string) {
    return fetch(url, {
      method: 'DELETE',
      headers: this.csrf.addToHeaders(),
    })
  }
}