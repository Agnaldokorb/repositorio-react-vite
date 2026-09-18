import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProjects } from './projectsService'
import { supabase } from '@/lib/supabase'
import { project } from '@/test/fixtures'

// Substitui o cliente real do Supabase durante estes testes.
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

let query

beforeEach(() => {
  vi.mocked(supabase.from).mockReset()

  // Simula a sequência de métodos da consulta.
  query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockResolvedValue({
      data: [project],
      error: null,
    }),
  }

  vi.mocked(supabase.from).mockReturnValue(query)
})

describe('Serviço de projetos', () => {
  it('consulta a tabela projects e retorna os dados recebidos', async () => {
    const controller = new AbortController()

    const resultado = await getProjects(controller.signal)

    expect(supabase.from).toHaveBeenCalledWith('projects')
    expect(resultado).toEqual([project])
  })

  it('solicita somente projetos publicados', async () => {
    const controller = new AbortController()

    await getProjects(controller.signal)

    expect(query.eq).toHaveBeenCalledWith('published', true)
  })

  it('ordena por posição e usa o id como desempate', async () => {
    const controller = new AbortController()

    await getProjects(controller.signal)

    expect(query.order).toHaveBeenNthCalledWith(
      1,
      'sort_order',
      { ascending: true },
    )

    expect(query.order).toHaveBeenNthCalledWith(
      2,
      'id',
      { ascending: true },
    )
  })

  it('encaminha o sinal de cancelamento à consulta', async () => {
    const controller = new AbortController()

    await getProjects(controller.signal)

    expect(query.abortSignal).toHaveBeenCalledWith(
      controller.signal,
    )
  })

  it('retorna uma lista vazia quando os dados são nulos', async () => {
    query.abortSignal.mockResolvedValue({
      data: null,
      error: null,
    })

    const controller = new AbortController()

    await expect(
      getProjects(controller.signal),
    ).resolves.toEqual([])
  })

  it('propaga o erro retornado pelo Supabase', async () => {
    const erro = {
      message: 'Consulta indisponível',
      code: 'TEST_ERROR',
    }

    query.abortSignal.mockResolvedValue({
      data: null,
      error: erro,
    })

    const controller = new AbortController()

    await expect(
      getProjects(controller.signal),
    ).rejects.toEqual(erro)
  })
})