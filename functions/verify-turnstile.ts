export async function onRequestPost(context: any) {
  const { request, env } = context

  try {
    const { token } = await request.json()

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY

    if (!TURNSTILE_SECRET_KEY) {
      console.error('TURNSTILE_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, message: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify token with Cloudflare
    const formData = new FormData()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)

    // Optionally add remote IP for additional verification
    const clientIP = request.headers.get('CF-Connecting-IP') ||
                    request.headers.get('X-Forwarded-For') ||
                    'unknown'
    formData.append('remoteip', clientIP)

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const result = await verifyResponse.json()

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Verification successful'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } else {
      console.error('Turnstile verification failed:', result)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Verification failed',
          errorCodes: result['error-codes'] || []
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}