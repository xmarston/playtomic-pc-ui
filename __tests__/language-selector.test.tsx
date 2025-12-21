import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSelector from '../src/app/components/LanguageSelector'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ lng: 'en' }),
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; width: number; height: number; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the language selector button', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    expect(button).toBeInTheDocument()
  })

  it('should show current language flag', () => {
    render(<LanguageSelector />)

    const flag = screen.getByAltText('English')
    expect(flag).toBeInTheDocument()
    expect(flag).toHaveAttribute('src', '/images/flags/en.svg')
  })

  it('should not show language menu by default', () => {
    render(<LanguageSelector />)

    expect(screen.queryByText('Español')).not.toBeInTheDocument()
    expect(screen.queryByText('Français')).not.toBeInTheDocument()
  })

  it('should open language menu when button is clicked', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
    expect(screen.getByText('Français')).toBeInTheDocument()
    expect(screen.getByText('Deutsch')).toBeInTheDocument()
    expect(screen.getByText('Italiano')).toBeInTheDocument()
    expect(screen.getByText('Nederlands')).toBeInTheDocument()
    expect(screen.getByText('Português')).toBeInTheDocument()
  })

  it('should show all 7 language flags in the menu', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    expect(screen.getAllByAltText('English')).toHaveLength(2) // One in button, one in menu
    expect(screen.getByAltText('Español')).toBeInTheDocument()
    expect(screen.getByAltText('Français')).toBeInTheDocument()
    expect(screen.getByAltText('Deutsch')).toBeInTheDocument()
    expect(screen.getByAltText('Italiano')).toBeInTheDocument()
    expect(screen.getByAltText('Nederlands')).toBeInTheDocument()
    expect(screen.getByAltText('Português')).toBeInTheDocument()
  })

  it('should navigate to selected language when clicked', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    const spanishOption = screen.getByText('Español')
    fireEvent.click(spanishOption)

    expect(mockPush).toHaveBeenCalledWith('/es')
  })

  it('should close menu after selecting a language', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    const frenchOption = screen.getByText('Français')
    fireEvent.click(frenchOption)

    expect(screen.queryByText('Español')).not.toBeInTheDocument()
  })

  it('should toggle menu open and closed', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })

    // Open menu
    fireEvent.click(button)
    expect(screen.getByText('Español')).toBeInTheDocument()

    // Close menu
    fireEvent.click(button)
    expect(screen.queryByText('Español')).not.toBeInTheDocument()
  })

  it('should highlight current language in menu', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    const englishButton = screen.getByText('English').closest('button')
    expect(englishButton).toHaveClass('bg-blue-50')
  })

  it('should navigate to different languages correctly', () => {
    render(<LanguageSelector />)

    const button = screen.getByRole('button', { name: /select language/i })
    fireEvent.click(button)

    const germanOption = screen.getByText('Deutsch')
    fireEvent.click(germanOption)

    expect(mockPush).toHaveBeenCalledWith('/de')
  })
})
