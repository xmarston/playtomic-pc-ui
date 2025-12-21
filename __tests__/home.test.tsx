import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../src/app/[lng]/page'

jest.mock('next/navigation', () => ({
  useParams: () => ({ lng: 'en' }),
}))

jest.mock('../src/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        title: 'Playtomic Probability Calculator',
        player: 'player',
        level: 'level',
        reliability: 'reliability',
        calculate: 'Calculate',
        loading: 'Loading',
        couple_probability: 'Couple probability',
        error_level: 'Level is required',
        error_reliability: 'Reliability is required',
      }
      return translations[key] || key
    },
  }),
}))

jest.mock('../src/app/services/api_connector', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import sendRequest from '../src/app/services/api_connector'

const mockSendRequest = sendRequest as jest.MockedFunction<typeof sendRequest>

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the title', () => {
    render(<Home />)

    expect(screen.getByText('Playtomic Probability Calculator')).toBeInTheDocument()
  })

  it('should render 4 player level inputs', () => {
    render(<Home />)

    expect(screen.getByLabelText('Player 1 Level')).toBeInTheDocument()
    expect(screen.getByLabelText('Player 2 Level')).toBeInTheDocument()
    expect(screen.getByLabelText('Player 3 Level')).toBeInTheDocument()
    expect(screen.getByLabelText('Player 4 Level')).toBeInTheDocument()
  })

  it('should render 4 player reliability inputs', () => {
    render(<Home />)

    expect(screen.getAllByText(/Player \d Reliability/)).toHaveLength(4)
  })

  it('should render calculate button', () => {
    render(<Home />)

    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
  })

  it('should update player level on input change', () => {
    render(<Home />)

    const input = screen.getByLabelText('Player 1 Level') as HTMLInputElement
    fireEvent.change(input, { target: { value: '5.5' } })

    expect(input.value).toBe('5.5')
  })

  it('should cap level at 7', () => {
    render(<Home />)

    const input = screen.getByLabelText('Player 1 Level') as HTMLInputElement
    fireEvent.change(input, { target: { value: '8' } })

    expect(input.value).toBe('7')
  })

  it('should cap reliability at 100', () => {
    render(<Home />)

    const inputs = screen.getAllByRole('textbox')
    const reliabilityInput = inputs[1] as HTMLInputElement
    fireEvent.change(reliabilityInput, { target: { value: '150' } })

    expect(reliabilityInput.value).toBe('100')
  })

  it('should only accept numeric values', () => {
    render(<Home />)

    const input = screen.getByLabelText('Player 1 Level') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })

    expect(input.value).toBe('0')
  })

  it('should show validation errors when submitting with empty values', () => {
    render(<Home />)

    const button = screen.getByRole('button', { name: /calculate/i })
    fireEvent.click(button)

    expect(screen.getAllByText('Level is required')).toHaveLength(4)
    expect(screen.getAllByText('Reliability is required')).toHaveLength(4)
  })

  it('should call sendRequest with valid data', async () => {
    mockSendRequest.mockResolvedValueOnce({
      probability_couple_1: 0.6,
      probability_couple_2: 0.4,
    })

    render(<Home />)

    const inputs = screen.getAllByRole('textbox')

    // Fill in all 4 players (level and reliability for each)
    fireEvent.change(inputs[0], { target: { value: '5' } })
    fireEvent.change(inputs[1], { target: { value: '80' } })
    fireEvent.change(inputs[2], { target: { value: '4' } })
    fireEvent.change(inputs[3], { target: { value: '90' } })
    fireEvent.change(inputs[4], { target: { value: '6' } })
    fireEvent.change(inputs[5], { target: { value: '75' } })
    fireEvent.change(inputs[6], { target: { value: '3' } })
    fireEvent.change(inputs[7], { target: { value: '85' } })

    const button = screen.getByRole('button', { name: /calculate/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith([
        { level: 5, reliability: 80 },
        { level: 4, reliability: 90 },
        { level: 6, reliability: 75 },
        { level: 3, reliability: 85 },
      ])
    })
  })

  it('should display probability results after successful API call', async () => {
    mockSendRequest.mockResolvedValueOnce({
      probability_couple_1: 0.6,
      probability_couple_2: 0.4,
    })

    render(<Home />)

    const inputs = screen.getAllByRole('textbox')

    // Fill in all players
    fireEvent.change(inputs[0], { target: { value: '5' } })
    fireEvent.change(inputs[1], { target: { value: '80' } })
    fireEvent.change(inputs[2], { target: { value: '4' } })
    fireEvent.change(inputs[3], { target: { value: '90' } })
    fireEvent.change(inputs[4], { target: { value: '6' } })
    fireEvent.change(inputs[5], { target: { value: '75' } })
    fireEvent.change(inputs[6], { target: { value: '3' } })
    fireEvent.change(inputs[7], { target: { value: '85' } })

    const button = screen.getByRole('button', { name: /calculate/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Couple probability 1: 60.00%/)).toBeInTheDocument()
      expect(screen.getByText(/Couple probability 2: 40.00%/)).toBeInTheDocument()
    })
  })
})
