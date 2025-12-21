import sendRequest from '../src/app/services/api_connector'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('API Connector', () => {
  const mockPlayers = [
    { level: 5.5, reliability: 80 },
    { level: 4.0, reliability: 90 },
    { level: 6.0, reliability: 75 },
    { level: 3.5, reliability: 85 },
  ]

  const mockResponse = {
    probability_couple_1: 0.55,
    probability_couple_2: 0.45,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_PPC_API_URL = 'http://localhost:8000'
  })

  it('should send a POST request with correct body format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    await sendRequest(mockPlayers)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/get-probability',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player1_level: 5.5,
          player1_reliability: 80,
          player2_level: 4.0,
          player2_reliability: 90,
          player3_level: 6.0,
          player3_reliability: 75,
          player4_level: 3.5,
          player4_reliability: 85,
        }),
      })
    )
  })

  it('should return data on successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await sendRequest(mockPlayers)

    expect(result).toEqual(mockResponse)
  })

  it('should throw error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const result = await sendRequest(mockPlayers)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('Request failed')
  })

  it('should return error when fetch fails', async () => {
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValueOnce(networkError)

    const result = await sendRequest(mockPlayers)

    expect(result).toBe(networkError)
  })
})
