# Minha Central

Portal pessoal de acesso a aplicativos, com visual Premium e layout responsivo.

## Versão atual

- Tela inicial com cartões dos aplicativos.
- Cadastro, edição, ativação/desativação e exclusão de atalhos.
- Validação de URL e abertura dos links em nova aba.
- Persistência local usando `localStorage`.
- Interface adaptável a celulares e computadores.

## Arquivos

- `index.html`: estrutura das telas.
- `style.css`: identidade visual e responsividade.
- `app.js`: cadastro e gerenciamento dos aplicativos.

## Como testar

Abra `index.html` em um navegador ou publique os três arquivos em uma hospedagem estática.

Os três aplicativos iniciais são modelos. Acesse **Gerenciar aplicativos**, edite cada um e informe seu endereço publicado.

## Próxima etapa: Supabase

A autenticação e a persistência em nuvem ainda não estão habilitadas nesta versão. Antes de adicionar credenciais, criaremos o projeto Supabase e configuraremos autenticação, tabelas e políticas RLS. Não coloque chaves secretas no código do navegador.

## Observação sobre armazenamento

Nesta versão, os cadastros ficam no armazenamento local do navegador e não são sincronizados entre dispositivos. A limpeza dos dados do navegador pode removê-los; por isso, essa versão serve como protótipo funcional antes da integração com Supabase.
