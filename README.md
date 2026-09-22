# cadastrar novo projeto.
```sql
insert into public.projects (
  slug,
  title,
  summary,
  description,
  technologies,
  published,
  featured,
  sort_order
)
values (
  'Slug',
  'Titulo',
  'Summary',
  'Description',
  array['React', 'JavaScript', 'Tailwind CSS', 'Supabase'],
  true,
  true,
  1
);
```

## 2. Cadastre as imagens pelo painel
Abra Table Editor → projects, encontre o projeto desejado e edite a coluna gallery_images.
Use esta estrutura, substituindo os links de exemplo pelos links reais das suas imagens:

```json
[
  {
    "src": "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/imagens/inicio.png",
    "alt": "Página inicial do projeto exibida no computador",
    "label": "Página inicial",
    "subtitle": "Apresentação e navegação principal"
  },
  {
    "src": "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/imagens/projetos.png",
    "alt": "Tela de listagem dos projetos",
    "label": "Projetos",
    "subtitle": "Organização dos trabalhos publicados"
  },
  {
    "src": "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/imagens/contato.png",
    "alt": "Formulário de contato do projeto",
    "label": "Contato",
    "subtitle": "Envio de mensagens pelo formulário"
  }
]
```