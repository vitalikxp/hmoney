import 'dotenv/config'
import admin from 'firebase-admin'
import { read, clear } from './record.js'
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

async function main() {
  const emails = read()
  if (emails.length === 0) {
    console.log('Нет пользователей для очистки')
    return
  }

  let deleted = 0
  let errors = 0

  for (const email of emails) {
    try {
      const user = await admin.auth().getUserByEmail(email)
      await admin.firestore().recursiveDelete(admin.firestore().collection('users').doc(user.uid))
      await admin.auth().deleteUser(user.uid)
      deleted++
      console.log(`  ✓ ${email}`)
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        deleted++
      } else {
        console.error(`  ✗ ${email}: ${e.message}`)
        errors++
      }
    }
  }

  clear()
  console.log(`\nУдалено ${deleted} пользователей${errors ? `, ошибок: ${errors}` : ''}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
