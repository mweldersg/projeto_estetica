import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as readline from 'node:readline'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function createPromptInterface() {
  return readline.createInterface({ input: process.stdin, output: process.stdout })
}

function promptWith(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()))
  })
}

function promptHiddenWith(rl: readline.Interface, question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    return promptWith(rl, question)
  }
  return new Promise((resolve) => {
    const stdin = process.stdin as NodeJS.ReadStream & { isRaw?: boolean }
    const wasRaw = stdin.isRaw
    const mutableStdout = process.stdout as NodeJS.WriteStream
    process.stdout.write(question)
    if (stdin.isTTY) stdin.setRawMode?.(true)
    let password = ''
    const onData = (char: Buffer) => {
      const str = char.toString('utf8')
      if (str === '\r' || str === '\n' || str === '\u0004') {
        stdin.removeListener('data', onData)
        if (stdin.isTTY) stdin.setRawMode?.(!!wasRaw)
        mutableStdout.write('\n')
        resolve(password.trim())
        return
      }
      if (str === '\u0003') {
        stdin.removeListener('data', onData)
        mutableStdout.write('\n')
        process.exit(1)
      }
      if (str === '\u007f' || str === '\b') {
        if (password.length > 0) password = password.slice(0, -1)
        return
      }
      password += str
    }
    stdin.on('data', onData)
    ;(rl as unknown as { _writeToOutput?: (s: string) => void })._writeToOutput = () => {}
  })
}

async function main() {
  let rl: readline.Interface | null = null
  let phoneRaw: string
  let password: string

  const existing = await prisma.admin.count()
  if (existing > 0) {
    console.error('An admin account already exists — refusing to create another. Use password reset or delete the existing admin first.')
    process.exit(1)
  }

  if (!process.stdin.isTTY) {
    // Piped / test mode: read two lines via readline (handles piped input correctly)
    const pipedRl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false })
    const lines: string[] = []
    // Collect up to 2 lines with timeout
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 5000)
      pipedRl.on('line', (line) => {
        lines.push(line)
        if (lines.length >= 2) {
          clearTimeout(timer)
          resolve()
        }
      })
      pipedRl.on('close', () => {
        clearTimeout(timer)
        resolve()
      })
    })
    try { pipedRl.close() } catch {}
    phoneRaw = (lines[0] || '').trim()
    password = (lines[1] || '').trim()
    process.stdout.write('Admin phone (digits, e.g. 19998740950): \n')
    process.stdout.write('Admin password (min 8 characters, hidden): \n')
  } else {
    rl = createPromptInterface()
    phoneRaw = await promptWith(rl, 'Admin phone (digits, e.g. 19998740950): ')
    password = await promptHiddenWith(rl, 'Admin password (min 8 characters, hidden): ')
  }

  // Shared validation
  try {
    const cleanPhone = phoneRaw.replace(/\D/g, '')
    if (!cleanPhone) {
      console.error('Admin phone is required.')
      process.exit(1)
    }
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      console.error('Invalid phone number — must be 10-15 digits.')
      process.exit(1)
    }
    if (!password) {
      console.error('Admin password is required.')
      process.exit(1)
    }
    if (password.length < 8) {
      console.error('Password too short — must be at least 8 characters.')
      process.exit(1)
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.admin.create({
      data: { phone: cleanPhone, password: hashed },
    })

    console.log(`Admin account created for ${cleanPhone}.`)
  } catch (err) {
    // Never log password/hash
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.includes('already exists')) console.error('Failed to create admin:', msg)
    process.exit(1)
  } finally {
    try { rl?.close() } catch {}
    await prisma.$disconnect()
  }
}

main()
