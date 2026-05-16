import 'dotenv/config'
import admin from 'firebase-admin'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT
const SA_FILE = join(PROJECT_ROOT, 'firebase.private.json')

if (!SERVICE_ACCOUNT && !existsSync(SA_FILE)) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT не задан и нет firebase.private.json')
  console.error('')
  console.error('  Скачайте сервисный аккаунт в Firebase Console:')
  console.error('  Settings → Service Accounts → Generate New Private Key')
  console.error('  Сохраните JSON как firebase.private.json в корне проекта')
  process.exit(1)
}

let credential: admin.credential.Credential

if (SERVICE_ACCOUNT) {
  const json = SERVICE_ACCOUNT.replace(/^'|'$/g, '')
  const tmpFile = join(tmpdir(), `hmoney-sa-${Date.now()}.json`)
  writeFileSync(tmpFile, json)
  credential = admin.credential.cert(tmpFile)
  unlinkSync(tmpFile)
} else {
  credential = admin.credential.cert(SA_FILE)
}

admin.initializeApp({ credential })

const EMAIL_DOMAIN = '@vitalik.dev'

async function main() {
  let deleted = 0
  let errors = 0

  const { users } = await admin.auth().listUsers(1000)

  for (const user of users) {
    const email = user.email ?? ''
    if (!email.endsWith(EMAIL_DOMAIN)) continue

    let ok = false

    try {
      await admin.firestore().recursiveDelete(admin.firestore().collection('users').doc(user.uid))
      ok = true
    } catch (e: any) {
      console.error(`  ✗ ${email}: Firestore — ${e.message}`)
      errors++
    }

    try {
      await admin.auth().deleteUser(user.uid)
      ok = true
    } catch (e: any) {
      console.error(`  ✗ ${email}: Auth — ${e.message}`)
      errors++
    }

    if (ok) {
      deleted++
      console.log(`  ✓ ${email}`)
    }
  }

  console.log(`\nУдалено ${deleted} пользователей${errors ? `, ошибок: ${errors}` : ''}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
