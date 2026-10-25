# Minha Central Premium

Aplicação estática para GitHub Pages, com autenticação Supabase e cadastro de atalhos sincronizado na tabela `public.central_apps`.

## Arquivos
- `index.html`: interface e formulário de autenticação.
- `style.css`: identidade visual responsiva.
- `app.js`: login/cadastro Supabase, leitura e gravação dos atalhos.
- `.nojekyll`: desativa processamento Jekyll no GitHub Pages.

## Configuração Supabase
O `app.js` contém o Project URL e a chave pública publishable. É apropriado usar uma chave pública no navegador desde que as políticas RLS estejam habilitadas e corretamente configuradas. Nunca colocar uma `service_role` ou secret key no frontend.

A tabela esperada é `public.central_apps`, com `id`, `user_id`, `name`, `description`, `url`, `icon`, `color`, `active` e `created_at`. A tabela deve ter RLS habilitado e políticas para que usuários autenticados leiam, insiram, atualizem e excluam apenas registros com `user_id = auth.uid()`.

## Publicação
Envie os cinco arquivos diretamente à raiz do repositório GitHub Pages, substituindo os arquivos anteriores. Depois aguarde a publicação e atualize a página. Ao criar uma conta, o Supabase pode exigir confirmação por e-mail, dependendo das configurações de Auth do projeto.

## Observações
- O projeto Supabase é compartilhado com outros aplicativos, mas os registros desta aplicação ficam na tabela separada `central_apps`.
- Os links dos aplicativos são salvos na nuvem por usuário autenticado.
- O login é independente dos logins dos outros aplicativos; não há SSO nesta versão.
- Se já havia atalhos guardados no mesmo navegador, os links locais válidos podem ser migrados para a conta na primeira carga se a tabela ainda estiver vazia.
