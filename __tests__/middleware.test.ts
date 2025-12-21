/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { middleware } from '../src/middleware'

describe('Middleware', () => {
  const createRequest = (pathname: string, options: { acceptLanguage?: string; referer?: string } = {}) => {
    const url = new URL(`http://localhost:3000${pathname}`)
    const headers = new Headers()

    if (options.acceptLanguage) {
      headers.set('Accept-Language', options.acceptLanguage)
    }
    if (options.referer) {
      headers.set('referer', options.referer)
    }

    return new NextRequest(url, { headers })
  }

  describe('static assets', () => {
    it('should pass through requests for images', () => {
      const request = createRequest('/images/logo.png')
      const response = middleware(request)

      expect(response.headers.get('x-middleware-next')).toBe('1')
    })

    it('should pass through requests for icons', () => {
      const request = createRequest('/favicon.icon')
      const response = middleware(request)

      expect(response.headers.get('x-middleware-next')).toBe('1')
    })
  })

  describe('language detection', () => {
    it('should redirect to fallback language when no Accept-Language header', () => {
      const request = createRequest('/')
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/en/')
    })

    it('should redirect to Spanish when Accept-Language is es', () => {
      const request = createRequest('/', { acceptLanguage: 'es' })
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/es/')
    })

    it('should redirect to French when Accept-Language is fr', () => {
      const request = createRequest('/', { acceptLanguage: 'fr' })
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/fr/')
    })

    it('should fallback to English for unsupported languages', () => {
      const request = createRequest('/', { acceptLanguage: 'ja' })
      const response = middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/en/')
    })
  })

  describe('language path handling', () => {
    it('should not redirect when path already contains valid language', () => {
      const request = createRequest('/en/some-page')
      const response = middleware(request)

      expect(response.headers.get('x-middleware-next')).toBe('1')
    })

    it('should not redirect for Spanish language path', () => {
      const request = createRequest('/es/some-page')
      const response = middleware(request)

      expect(response.headers.get('x-middleware-next')).toBe('1')
    })

    it('should preserve query parameters in redirect', () => {
      const request = createRequest('/?param=value', { acceptLanguage: 'de' })
      const response = middleware(request)

      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/de/')
      expect(location).toContain('param=value')
    })
  })

  describe('referer handling', () => {
    it('should set language cookie from referer', () => {
      const request = createRequest('/en/page', { referer: 'http://localhost:3000/es/other-page' })
      const response = middleware(request)

      const setCookie = response.headers.get('set-cookie')
      expect(setCookie).toContain('i18next=es')
    })
  })
})
