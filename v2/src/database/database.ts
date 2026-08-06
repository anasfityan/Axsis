const DATABASE_NAME = "axsis-v2"
const DATABASE_VERSION = 1

export const stores = {
  courses: "courses",
  courseSessions: "courseSessions",
  exams: "exams",
  grades: "grades",
  files: "files",
  settings: "settings",
  syncQueue: "syncQueue",
  migrations: "migrations",
} as const

let databasePromise: Promise<IDBDatabase> | null = null

export function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      for (const storeName of Object.values(stores)) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: "id" })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("Unable to open the local database."))
    request.onblocked = () => reject(new Error("The local database upgrade is blocked by another open tab."))
  })

  return databasePromise
}

export async function putRecord<T extends { id: string }>(storeName: string, record: T): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    transaction.objectStore(storeName).put(record)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to save the local record."))
    transaction.onabort = () => reject(transaction.error ?? new Error("The local save operation was aborted."))
  })
}

export async function getRecord<T>(storeName: string, id: string): Promise<T | undefined> {
  const database = await openDatabase()
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly")
    const request = transaction.objectStore(storeName).get(id)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error ?? new Error("Unable to read the local record."))
  })
}

export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const database = await openDatabase()
  return new Promise<T[]>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly")
    const request = transaction.objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error ?? new Error("Unable to read local records."))
  })
}

export async function removeRecord(storeName: string, id: string): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite")
    transaction.objectStore(storeName).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to remove the local record."))
    transaction.onabort = () => reject(transaction.error ?? new Error("The local delete operation was aborted."))
  })
}

export const deleteRecord = removeRecord
