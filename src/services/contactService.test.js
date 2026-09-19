import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendContact } from './contactService'

const fetchMock = vi.fn()

const values = {
  name: 'Agnaldo',
  email: 'agnaldo@example.com',
  message: 'Quero conversar sobre um projeto.',
}

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://projeto.example.com')
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'chave-publica-de-teste')

  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function mockResponse(body, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

describe('Serviço de contato', () => {
  it('envia os campos e o token para a função e retorna o resultado', async () => {
    const responseBody = {
      success: true,
      message: 'Mensagem aceita para envio.',
    }

    mockResponse(responseBody)

    const result = await sendContact(
      { ...values, to: 'outro@example.com' },
      'token-de-teste',
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0]

    expect(url).toBe(
      'https://projeto.example.com/functions/v1/send-contact',
    )

    expect(options.method).toBe('POST')

    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
      apikey: 'chave-publica-de-teste',
    })

    expect(JSON.parse(options.body)).toEqual({
      ...values,
      turnstileToken: 'token-de-teste',
    })

    expect(options.signal).toBeDefined()
    expect(options.signal.aborted).toBe(false)
    expect(result).toEqual(responseBody)
  })

  it('apresenta a mensagem de erro retornada pelo servidor', async () => {
    mockResponse(
      { error: 'Verificação de segurança inválida ou expirada.' },
      400,
    )

    await expect(
      sendContact(values, 'token-invalido'),
    ).rejects.toThrow(
      'Verificação de segurança inválida ou expirada.',
    )
  })

  it('usa uma mensagem padrão quando o servidor falha sem explicar o motivo', async () => {
    mockResponse({}, 500)

    await expect(
      sendContact(values, 'token-de-teste'),
    ).rejects.toThrow('Não foi possível enviar sua mensagem.')
  })

  it('trata erro HTTP com resposta que não é JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<html>Serviço indisponível</html>', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }),
    )

    await expect(
      sendContact(values, 'token-de-teste'),
    ).rejects.toThrow('Não foi possível enviar sua mensagem.')
  })

  it.each([
    ['falha de conexão', new TypeError('Failed to fetch')],
    ['tempo de espera excedido', new DOMException('Timeout', 'TimeoutError')],
  ])('trata %s sem confirmar o envio', async (_scenario, error) => {
    fetchMock.mockRejectedValueOnce(error)

    await expect(
      sendContact(values, 'token-de-teste'),
    ).rejects.toThrow(
      'Não foi possível confirmar o envio. Confira sua conexão e tente novamente mais tarde.',
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['sem confirmação', {}],
    ['com falha declarada', { success: false }],
    ['com confirmação em formato inválido', { success: 'true' }],
    ['com corpo nulo', null],
  ])('rejeita uma resposta HTTP 200 %s', async (_scenario, body) => {
    mockResponse(body)

    await expect(
      sendContact(values, 'token-de-teste'),
    ).rejects.toThrow('Não foi possível confirmar o envio da mensagem.')
  })

  it('não confirma envio quando a resposta HTTP 200 não contém JSON válido', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Resposta inválida', { status: 200 }),
    )

    await expect(
      sendContact(values, 'token-de-teste'),
    ).rejects.toThrow('Não foi possível confirmar o envio da mensagem.')
  })

  it.each([
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ])('não faz requisição quando falta %s', async (variable) => {
    vi.stubEnv(variable, '')

    await expect(
      sendContact(values, 'token-de-teste'),
    ).rejects.toThrow('O formulário está temporariamente indisponível.')

    expect(fetchMock).not.toHaveBeenCalled()
  })
})