import path from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'

const dbPath = path.join(app.getPath('userData'), 'muchat.db')
const db = new Database(dbPath)

export default db
