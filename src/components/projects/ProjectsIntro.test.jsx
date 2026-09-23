import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import ProjectsIntro from './ProjectsIntro'
import { mockMatchMedia } from '@/test/browser'

let changeMedia
let previousOverflow
let dialogDescriptors

beforeEach(() => {
  vi.useFakeTimers()
  changeMedia = mockMatchMedia()
  previousOverflow = document.body.style.overflow

  const prototype = HTMLDialogElement.prototype

  dialogDescriptors = {
    showModal: Object.getOwnPropertyDescriptor(prototype, 'showModal'),
    close: Object.getOwnPropertyDescriptor(prototype, 'close'),
  }

  // Simula abertura e fechamento, sem depender do modal nativo.
  Object.defineProperty(prototype, 'showModal', {
    configurable: true,
    value: function () {
      this.setAttribute('open', '')
    },
  })

  Object.defineProperty(prototype, 'close', {
    configurable: true,
    value: function () {
      this.removeAttribute('open')
    },
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()

  document.body.style.overflow = previousOverflow

  const prototype = HTMLDialogElement.prototype

  for (const name of ['showModal', 'close']) {
    const descriptor = dialogDescriptors[name]

    if (descriptor) {
      Object.defineProperty(prototype, name, descriptor)
    } else {
      delete prototype[name]
    }
  }
})

function advanceTime(milliseconds) {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}

describe('Introdução dos projetos', () => {
  it('aguarda seis segundos e apresenta a contagem de cinco a zero', () => {
    const onFinish = vi.fn()

    render(<ProjectsIntro onFinish={onFinish} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByText('5', { exact: true })).not.toBeInTheDocument()

    advanceTime(5999)

    expect(screen.queryByText('5', { exact: true })).not.toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()

    advanceTime(1)

    expect(screen.getByText('5', { exact: true })).toBeInTheDocument()

    for (const number of [4, 3, 2, 1, 0]) {
      advanceTime(1000)

      expect(
        screen.getByText(String(number), { exact: true }),
      ).toBeInTheDocument()

      expect(onFinish).not.toHaveBeenCalled()
    }

    advanceTime(1000)

    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('permite pular a introdução', () => {
    const onFinish = vi.fn()

    render(<ProjectsIntro onFinish={onFinish} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Pular introdução' }),
    )

    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('finaliza ao receber o cancelamento do diálogo', () => {
    const onFinish = vi.fn()

    render(<ProjectsIntro onFinish={onFinish} />)

    // O navegador emite "cancel" quando o usuário pressiona Escape.
    fireEvent(
      screen.getByRole('dialog'),
      new Event('cancel', { bubbles: true, cancelable: true }),
    )

    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('restaura a rolagem e cancela os temporizadores ao desmontar', () => {
    document.body.style.overflow = 'auto'

    const onFinish = vi.fn()
    const { unmount } = render(
      <ProjectsIntro onFinish={onFinish} />,
    )

    expect(document.body.style.overflow).toBe('hidden')

    // Entra na contagem antes de sair da página.
    advanceTime(6000)
    unmount()

    expect(document.body.style.overflow).toBe('auto')

    advanceTime(20000)

    expect(onFinish).not.toHaveBeenCalled()
  })

  it('não inicia a contagem quando há preferência por movimento reduzido', () => {
    changeMedia('(prefers-reduced-motion: reduce)', true)

    const onFinish = vi.fn()

    render(<ProjectsIntro onFinish={onFinish} />)

    advanceTime(20000)

    expect(onFinish).not.toHaveBeenCalled()
    expect(screen.queryByText('5', { exact: true })).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: 'Ativar movimento do celular',
      }),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver projetos' }),
    )

    expect(onFinish).toHaveBeenCalledTimes(1)
  })
})