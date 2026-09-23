# Portfólio Agnaldo Korb

Portfólio pessoal para apresentar projetos, formação acadêmica, cursos e certificados, com canais de contato por e-mail e WhatsApp. Interface em português, adaptada para desktop e dispositivos móveis.

[Acessar o portfólio](https://agnaldo.dev.br) · [GitHub do autor](https://github.com/Agnaldokorb)

## Funcionalidades

- Página inicial com apresentação e até três projetos em destaque.
- Listagem de projetos publicados, detalhes por slug e links para os projetos online.
- Galeria circular com WebGL nos detalhes dos projetos, navegação por arraste, botões e teclado. Uma imagem ou preferência por movimento reduzido utiliza apresentação estática; falhas de renderização/carregamento acionam uma alternativa com imagens comuns.
- Página Formação com cursos em andamento e concluídos, instituição, carga horária e certificados que abrem em nova aba.
- Formulário de contato com validação, Cloudflare Turnstile e envio por uma Supabase Edge Function integrada ao Resend.
- Botão flutuante do WhatsApp com mensagem inicial e alternância de tons de verde.
- Fundo animado com Three.js, menu mobile e rodapé com a marca NovoCode.
- Introdução opcional aos projetos: apresentação de seis segundos, contagem de cinco a zero e opção de pular. A conclusão é registrada em `sessionStorage`; a preferência por movimento reduzido evita a introdução na navegação do aplicativo.
- Efeito de inclinação na introdução por ponteiro ou sensores do celular, quando disponíveis e autorizados.
- Estados de carregamento, erro e conteúdo vazio; página para rotas e projetos inexistentes.

## Tecnologias

| Área | Tecnologias utilizadas |
| --- | --- |
| Interface | React 19, JavaScript, Vite 8 |
| Estilos e componentes | Tailwind CSS 4, shadcn/ui com Base UI, fonte Geist |
| Navegação | React Router |
| Formulário | React Hook Form, Zod, resolvers |
| Dados | Supabase JavaScript SDK e PostgreSQL |
| Contato | Supabase Edge Functions, Deno/TypeScript, Resend e Cloudflare Turnstile |
| Efeitos gráficos | Three.js e OGL |
| Ícones | Lucide React e React Icons |
| Qualidade | Vitest 5, Testing Library, jsdom, cobertura V8 e ESLint |

As versões exatas estão em `package-lock.json`. O frontend usa JavaScript/JSX; a função de contato usa TypeScript. Prisma não faz parte da implementação atual. GSAP e Motion permanecem nas dependências e nos componentes da galeria orbital anterior; a página de detalhes utiliza atualmente a galeria circular OGL.

## Arquitetura

```text
React → serviços de projetos/cursos → API do Supabase → PostgreSQL

React → token do Turnstile → Edge Function send-contact
                              ├─ verifica token, hostname e action
                              └─ envia e-mail pelo Resend
```

Os conteúdos são administrados pelo Table Editor do Supabase. Não há painel administrativo nem fluxo de login no frontend. A função de contato encaminha a mensagem por e-mail; seu código não grava contatos em uma tabela.

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Apresentação e projetos em destaque |
| `/projetos` | Projetos publicados |
| `/projetos/:slug` | Detalhes, preview e galeria do projeto |
| `/formacao` | Formação, cursos e certificados |
| `/contato` | Formulário e canais de contato |
| Demais endereços | Página não encontrada |

As páginas são carregadas com `React.lazy` e `Suspense`. O fundo tem carregamento separado e é compartilhado por todas as páginas.

## Executar localmente

### Pré-requisitos

- Node.js 22.12 ou superior dentro da versão 22, ou Node.js 24. Essas versões atendem aos requisitos das versões de Vite e Vitest instaladas.
- npm e Git.
- Projeto Supabase com as tabelas, permissões e políticas necessárias.
- Para envio real de contato: Turnstile, Resend e a função `send-contact` configurados.

```bash
git clone https://github.com/Agnaldokorb/repositorio-react-vite.git
cd repositorio-react-vite
npm ci
```

Copie `.env.example` para `.env.local`. No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Preencha os valores:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
VITE_TURNSTILE_SITE_KEY=SUA_SITE_KEY
```

| Variável | Finalidade |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publicável usada pelo frontend |
| `VITE_TURNSTILE_SITE_KEY` | Chave pública do widget Turnstile |

Variáveis com prefixo `VITE_` são incorporadas ao frontend. Não coloque nelas chaves secretas, `service_role`, a chave do Resend ou o segredo do Turnstile. `.env.local` é ignorado pelo Git.

```bash
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. Reinicie o servidor após modificar as variáveis de ambiente.

Sem URL/chave do Supabase, o módulo do cliente lança um erro de configuração. Sem a site key do Turnstile, o formulário informa indisponibilidade e bloqueia o envio.

## Preparação do banco de dados

**O repositório ainda não inclui migrações SQL nem um script completo de criação das tabelas.** Clonar e instalar as dependências não provisiona o banco. As tabelas abaixo representam o contrato esperado pelos serviços e componentes, não uma exportação do schema remoto.

### `public.projects`

| Campo | Tipo esperado / uso |
| --- | --- |
| `id` | Identificador único, usado como desempate na ordenação |
| `slug` | Texto único usado na URL dos detalhes |
| `title`, `summary`, `description` | Textos do projeto |
| `technologies` | Array de textos, por exemplo `React`, `JavaScript` |
| `cover_path` | URL HTTPS direta da capa, ou `NULL` |
| `gallery_images` | Array JSONB de imagens, ou `[]` |
| `preview_url` | URL HTTPS do projeto publicado, ou `NULL` |
| `published` | Booleano: somente `true` deve ser público |
| `featured` | Booleano para destaque na página inicial |
| `sort_order` | Inteiro: valores menores aparecem primeiro |

Exemplo de cadastro, depois de provisionar a tabela:

```sql
insert into public.projects (
  slug, title, summary, description, technologies,
  published, featured, sort_order
)
values (
  'meu-projeto',
  'Meu projeto',
  'Resumo do projeto.',
  'Descrição do problema e da solução desenvolvida.',
  array['React', 'JavaScript', 'Tailwind CSS', 'Supabase'],
  true,
  true,
  1
);
```

No Table Editor, preencha `gallery_images` com links reais:

```json
[
  {
    "src": "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/imagens/inicio.png",
    "alt": "Tela inicial do projeto",
    "label": "Página inicial"
  },
  {
    "src": "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/imagens/contato.png",
    "alt": "Formulário de contato do projeto",
    "label": "Contato"
  }
]
```

Use links diretos de imagens, não páginas `/blob/` do GitHub. O servidor das imagens precisa permitir CORS para uso como textura WebGL. O campo `subtitle` de cadastros antigos não é utilizado pela galeria circular atual.

### `public.courses`

| Campo | Tipo esperado / uso |
| --- | --- |
| `id` | Identificador único |
| `title` | Nome do curso ou formação |
| `institution` | Instituição de ensino |
| `description` | Descrição do aprendizado |
| `status` | `in_progress` ou `completed` |
| `workload_hours` | Número inteiro positivo de horas, ou `NULL` |
| `completed_at` | Data de conclusão, ou `NULL` |
| `certificate_image_url` | Link HTTPS direto da imagem do certificado, ou `NULL` |
| `published` | Booleano que controla a publicação |
| `sort_order` | Inteiro para ordenar os cursos |

Para cursos em andamento, mantenha a data de conclusão e o certificado como `NULL`. Cursos concluídos sem imagem mostram uma mensagem de certificado indisponível. As imagens são exibidas sem recorte e podem ser abertas em nova aba.

### Permissões

Configure RLS nas duas tabelas e conceda aos clientes somente a leitura necessária, com política que permita consultar registros com `published = true`. O filtro `.eq('published', true)` no frontend não substitui uma política no banco.

Os serviços ordenam os resultados por `sort_order` e depois por `id`. Consulte o schema e as políticas do projeto Supabase antes de replicar a aplicação em outro ambiente: eles não foram exportados neste repositório.

## Configurar o envio de contato

O código da função está em `supabase/functions/send-contact/index.ts`. Sua publicação é independente do build do Vite.

1. Configure um domínio de envio verificado no Resend.
2. Configure um widget Turnstile para os hostnames utilizados pelo site.
3. Cadastre os secrets abaixo nas Edge Functions do Supabase.
4. Publique a função com o nome `send-contact`.
5. Configure a função pública sem exigir um JWT de usuário (`Verify JWT` desativado). O frontend atual envia a chave publicável no cabeçalho `apikey`, mas não envia um token de login.
6. Confira `allowedOrigins` e `allowedHostnames` no código antes de publicar em outro domínio.

| Secret da Edge Function | Conteúdo |
| --- | --- |
| `RESEND_API_KEY` | Chave secreta do Resend |
| `TURNSTILE_SECRET_KEY` | Segredo do widget Turnstile |
| `CONTACT_FROM_EMAIL` | Remetente autorizado pelo domínio verificado |
| `CONTACT_TO_EMAIL` | Destinatário das mensagens |

O endpoint é `/functions/v1/send-contact`. Ele aceita `POST` com JSON contendo `name`, `email`, `message` e `turnstileToken`; também responde ao preflight `OPTIONS`.

A função valida os campos, a origem e a resposta do Turnstile, exigindo `action: contact` e um hostname permitido. O e-mail usa destinatário fixo e `reply_to` com o endereço informado pelo visitante. A resposta de sucesso indica aceitação para envio, não confirmação de entrega na caixa postal.

**Contato em desenvolvimento:** o código permite as origens `http://localhost:5173` e `http://localhost:4173`, mas `allowedHostnames` contém apenas `agnaldo.dev.br` e `www.agnaldo.dev.br`. Para testar envio real localmente, configure também o hostname de desenvolvimento no Turnstile e na validação da função, preferencialmente em ambiente separado. Apenas aceitar a origem CORS não é suficiente.

O repositório não contém `supabase/config.toml`; configurações de publicação, secrets e verificação de JWT precisam ser conferidas no ambiente remoto.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera o frontend em `dist/` |
| `npm run preview` | Serve o build localmente para conferência |
| `npm run lint` | Verifica JavaScript e JSX com ESLint |
| `npm test` | Testes em modo de observação |
| `npm run test:run` | Executa os testes uma vez |
| `npm run test:coverage` | Gera cobertura no terminal e em `coverage/index.html` |

## Testes

A suíte utiliza Vitest, jsdom e Testing Library. Há testes de navegação, projetos, preview, galeria, introdução, formação, certificados, hooks, serviços e validação/envio do contato.

Os testes simulam Supabase, Turnstile e requisições externas. A suíte não comprova entrega real de e-mail, políticas RLS do banco remoto ou renderização WebGL. Interações gráficas, permissões de sensores, certificados remotos e layout devem ser conferidos em navegador desktop e mobile.

A cobertura exclui os próprios testes, `src/test`, `src/main.jsx`, `src/components/ui` e `src/data`. Assim, seu percentual não representa todo o código do projeto. A Edge Function TypeScript também não está incluída na cobertura do frontend.

```bash
npm run test:run
npm run lint
npm run build
```

## Estrutura

```text
public/                     Ícones e arquivos públicos
src/
  assets/                   Imagens, certificados e marca NovoCode
  components/
    education/              Cards de cursos e certificados
    layout/                 Header, footer, fundo e WhatsApp
    projects/               Cards, galeria, preview e introdução
    ui/                     Componentes de interface e galeria OGL
    unlumen-ui/             Componentes da galeria orbital anterior
  data/                     Dados locais antigos; não são a fonte das páginas atuais
  hooks/                    Consulta de projetos e cursos
  lib/                      Cliente Supabase e utilitários
  pages/                    Páginas das rotas
  schemas/                  Validação do formulário
  services/                 Acesso a dados e envio de contato
  test/                     Configuração, fixtures e simulações do navegador
  App.jsx                   Rotas e layout compartilhado
  index.css                 Tema, estilos e animações
  main.jsx                  Inicialização e BrowserRouter
supabase/
  functions/send-contact/   Função de envio de e-mail
```

O alias `@` aponta para `src/`. Os arquivos de teste ficam junto aos componentes, hooks, páginas e serviços correspondentes.

## Publicação

Configure as variáveis `VITE_` antes de gerar o build. Alterar as variáveis depois de gerar `dist/` exige um novo build.

```bash
npm ci
npm run build
npm run preview
```

Publique o conteúdo de `dist/` em uma hospedagem estática. Não publique `.env.local`, `node_modules` ou chaves secretas. A função de contato continua hospedada separadamente no Supabase.

Como a navegação usa `BrowserRouter`, o servidor precisa retornar `index.html` para rotas como `/formacao` e `/projetos/meu-projeto`. Em Apache com `mod_rewrite`, um exemplo de `.htaccess` na raiz publicada é:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Esse arquivo não está versionado atualmente. Preserve a configuração que já funciona na hospedagem. Para incluí-lo em builds futuros do Vite, ele pode ser colocado em `public/.htaccess`. Em outros servidores, configure a regra equivalente de fallback da SPA.

O fundo Three.js pode gerar aviso de chunk acima de 500 kB. O aviso não impede o build, mas o desempenho deve ser avaliado em dispositivos móveis. O carregamento separado não elimina o custo do fundo, que está presente em todas as páginas.

## Personalização

| Alteração | Local |
| --- | --- |
| Projetos, previews e imagens | Table Editor → `projects` |
| Formação e certificados | Table Editor → `courses` |
| Número e mensagem do WhatsApp | `src/components/layout/WhatsAppButton.jsx` |
| Cores e animação do WhatsApp | `src/index.css` |
| Marca no rodapé | `src/components/layout/Footer.jsx` e `src/assets/img/novocode/` |
| Navegação | `src/components/layout/Header.jsx` e `Footer.jsx` |
| Título, descrição e favicon | `index.html` e `public/` |
| Destinatário/remetente do contato | Secrets da Edge Function |
| Domínios autorizados no contato | `supabase/functions/send-contact/index.ts` e painel do Turnstile |

## Autor

**Agnaldo Korb** — [Portfólio](https://agnaldo.dev.br) · [GitHub](https://github.com/Agnaldokorb) · [E-mail](mailto:contato@agnaldo.dev.br)

O repositório não possui um arquivo de licença. Consulte o autor antes de reutilizar o código, as marcas ou os certificados.
