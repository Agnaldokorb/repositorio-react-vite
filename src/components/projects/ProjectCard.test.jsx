import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProjectCard from './ProjectCard'
import { project } from '@/test/fixtures'


const card = (data) => <MemoryRouter><ProjectCard project={data} /></MemoryRouter>

describe('Cartão de projeto', () => {
  it('apresenta capa, tecnologias e endereço de detalhes', () => {
    render(card(project))
    expect(screen.getByRole('img', { name: /Capa do projeto/ })).toHaveAttribute('src', project.cover_path)
    expect(screen.getByRole('link', { name: /Ver projeto:/ })).toHaveAttribute('href', '/projetos/portfolio')
    expect(screen.getByRole('list', { name: 'Tecnologias utilizadas' })).toHaveTextContent('React')
  })

  it('usa alternativa quando não há capa', () => {
    render(card({ ...project, cover_path: null }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Capa indisponível')).toBeInTheDocument()
  })

  it('trata imagem quebrada e permite carregar uma nova URL', () => {
    const { rerender } = render(card(project))
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Capa indisponível')).toBeInTheDocument()
    rerender(card({ ...project, cover_path: 'https://example.com/nova.webp' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/nova.webp')
  })

  it.each([
  'http://example.com/capa.webp',
  'javascript:alert(1)',
  'imagem.webp',
])('mostra alternativa para URL inválida: %s', (coverPath) => {
  render(
    card({
      ...project,
      cover_path: coverPath,
    }),
  )

  expect(screen.queryByRole('img')).not.toBeInTheDocument()

  expect(
    screen.getByText('Capa indisponível'),
  ).toBeInTheDocument()
})

it('aceita URL HTTPS com espaços nas extremidades', () => {
  render(
    card({
      ...project,
      cover_path: '  https://example.com/capa.webp  ',
    }),
  )

  expect(
    screen.getByRole('img', {
      name: `Capa do projeto ${project.title}`,
    }),
  ).toHaveAttribute('src', 'https://example.com/capa.webp')
})
})
