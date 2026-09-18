import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contact from './Contact'

describe('Formulário de contato', () => {
  it('mostra erros acessíveis e foca o primeiro campo inválido', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.click(screen.getByRole('button', { name: 'Testar formulário' }))
    expect(await screen.findAllByRole('alert')).toHaveLength(3)
    await waitFor(() => expect(screen.getByLabelText('Nome')).toHaveFocus())
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('Informe seu e-mail.')
  })

  it('valida sem prometer envio, preserva os campos e limpa o aviso ao editar', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByLabelText('Nome'), 'Agnaldo')
    await user.type(screen.getByLabelText('E-mail'), 'agnaldo@example.com')
    await user.type(screen.getByLabelText('Mensagem'), 'Quero conversar sobre um projeto.')
    await user.click(screen.getByRole('button', { name: 'Testar formulário' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Nenhuma mensagem foi enviada'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Quero conversar sobre um projeto.')
    await user.type(screen.getByLabelText('Nome'), ' Korb')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('valida e-mail ao sair do campo', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByLabelText('E-mail'), 'invalido')
    await user.tab()
    expect(await screen.findByRole('alert')).toHaveTextContent('Informe um e-mail válido.')
  })
})
