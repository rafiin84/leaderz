// Mock API — simulates async fetch with realistic delays
// Replace with real fetch calls when backend is ready

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

export { delay }

// Re-export all API modules
export * from './leader'
export * from './contacts'
export * from './content'
export * from './missions'
export * from './followers'
export * from './notifications'
