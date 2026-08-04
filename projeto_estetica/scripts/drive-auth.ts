import 'dotenv/config'
import { google } from 'googleapis'
import { createServer } from 'node:http'
import { execSync } from 'node:child_process'

const SCOPES = ['https://www.googleapis.com/auth/drive.file']
const PORT = 3001
const REDIRECT_URI = `http://localhost:${PORT}`

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error(
      'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first (Google Cloud Console > Credentials > OAuth Client ID, type "Web application").'
    )
    process.exit(1)
  }

  const oauth = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)
  const authUrl = oauth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  })

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', REDIRECT_URI)
    const code = url.searchParams.get('code')
    if (!code) {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('No authorization code received. Close this window and try again.')
      return
    }

    try {
      const { tokens } = await oauth.getToken(code)
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(
        'Authorization successful. Copy the GOOGLE_REFRESH_TOKEN value below and close this window.\n\n' +
          (tokens.refresh_token
            ? `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`
            : 'No refresh token returned. Revoke app access (myaccount.google.com/permissions) and try again.\n')
      )
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Authorization failed: ${String(error)}`)
    }
    server.close()
  })

  server.listen(PORT, () => {
    console.log('Opening browser for authorization...')
    try {
      execSync(`open "${authUrl}"`)
    } catch {
      console.log(`Open this URL manually:\n${authUrl}\n`)
    }
  })
}

main()
