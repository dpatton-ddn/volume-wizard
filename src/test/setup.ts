import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setApiConfig } from '../mocks/config'
import { resetDb } from '../mocks/db'
import { server } from '../mocks/node'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

beforeEach(() => {
  setApiConfig({ latency: [0, 0], fail: 'none', nameLookupMs: 0 })
  resetDb()
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())
