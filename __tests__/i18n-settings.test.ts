import { fallbackLng, languages, defaultNS, cookieName, getOptions } from '../src/app/i18n/settings'

describe('i18n settings', () => {
  describe('constants', () => {
    it('should have English as fallback language', () => {
      expect(fallbackLng).toBe('en')
    })

    it('should support 7 languages', () => {
      expect(languages).toHaveLength(7)
      expect(languages).toContain('en')
      expect(languages).toContain('es')
      expect(languages).toContain('it')
      expect(languages).toContain('nl')
      expect(languages).toContain('de')
      expect(languages).toContain('fr')
      expect(languages).toContain('pt')
    })

    it('should have correct default namespace', () => {
      expect(defaultNS).toBe('translation')
    })

    it('should have correct cookie name', () => {
      expect(cookieName).toBe('i18next')
    })
  })

  describe('getOptions', () => {
    it('should return default options when called without arguments', () => {
      const options = getOptions()

      expect(options.lng).toBe('en')
      expect(options.fallbackLng).toBe('en')
      expect(options.supportedLngs).toEqual(languages)
      expect(options.defaultNS).toBe('translation')
      expect(options.fallbackNS).toBe('translation')
      expect(options.ns).toBe('translation')
    })

    it('should use provided language', () => {
      const options = getOptions('es')

      expect(options.lng).toBe('es')
      expect(options.fallbackLng).toBe('en')
    })

    it('should use provided namespace as string', () => {
      const options = getOptions('en', 'common')

      expect(options.ns).toBe('common')
    })

    it('should use provided namespaces as array', () => {
      const options = getOptions('en', ['common', 'errors'])

      expect(options.ns).toEqual(['common', 'errors'])
    })
  })
})
