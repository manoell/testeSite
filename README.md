# Estrutura do Projeto

```
│   index.php
│
├───app
│       .htaccess
│       api.js
│       carrossel.css
│       constants.js
│       controle.php
│       high-contrast.js
│       index.css
│       index.js
│       index.php
│       irParaArchor.js
│       resultado.php
│       templates.js
│       utils.js
│
├───core
│   │   .htaccess
│   │   index.php
│   │
│   ├───js
│   │       botoes.js
│   │       index.php
│   │       rastroGeral.js
│   │       rastroMulti.js
│   │       rastroUnico.js
│   │
│   ├───securimage
│   │   │   AHGBold.ttf
│   │   │   securimage.css
│   │   │   securimage.js
│   │   │   securimage.php
│   │   │   securimage_show.php
│   │   │
│   │   └───images
│   │           loading.png
│   │
│   └───templates
│       │   index.php
│       │
│       └───bunker
│           │   index.php
│           │
│           ├───css
│           │       acessibilidade.css
│           │       alerta.css
│           │       botoes.css
│           │       bunker.css
│           │       cores.css
│           │       footer.css
│           │       forms.css
│           │       menu.css
│           │       modal.css
│           │       suggest.css
│           │       tabelas-bunker.css
│           │       tabelas.css
│           │       tabs-antonio.css
│           │
│           ├───img
│           │   │   alto-contraste-blue.svg
│           │   │   arrow-down.svg
│           │   │   arrow-left.svg
│           │   │   arrow-right-black.svg
│           │   │   arrow-up.svg
│           │   │   bg-amarelo.svg
│           │   │   close-blue.svg
│           │   │   close-brown.svg
│           │   │   entrar.svg
│           │   │   favi-ect.png
│           │   │   libras.svg
│           │   │   loading-dark.svg
│           │   │   logo-ect.svg
│           │   │   marcador-blue.svg
│           │   │   menu-open.svg
│           │   │   menu.svg
│           │   │   ouvidoria.png
│           │   │
│           │   └───rodape
│           │           marca-gov.png
│           │
│           └───js
│                   acessibilidade.js
│                   alerta.js
│                   botoes.js
│                   bunker.js
│                   events.js
│                   forms.js
│                   menu.js
│                   modal.js
│                   tabs.js
│                   validacoes-padrao.js
│
├───lib
│   │   .htaccess
│   │
│   ├───animate
│   │       animate.min.css
│   │
│   ├───bootstrap
│   │   ├───css
│   │   │       bootstrap.min.css
│   │   │
│   │   └───js
│   │           bootstrap.bundle.min.js
│   │
│   ├───font-awesome
│   │   ├───css
│   │   │       font-awesome.min.css
│   │   │
│   │   └───fonts
│   │           fontawesome-webfont.eot
│   │           fontawesome-webfont.ttf
│   │           fontawesome-webfont.woff
│   │           fontawesome-webfont.woff2
│   │
│   ├───jquery
│   │       jquery.min.js
│   │
│   ├───jquery-mask
│   │       jquery.mask.min.js
│   │
│   └───jquery-maskedinput
│           jquery.maskedinput.min.js
│
└───static
    │   .htaccess
    │   index.php
    │
    ├───css
    │       global.css
    │       index.php
    │       reset.min.css
    │
    ├───js
    │       acessaDados.js
    │       global.js
    │       index.php
    │
    ├───rastreamento-internet
    │   │   index.php
    │   │
    │   ├───banners
    │   │       campanha_abril_1.png
    │   │       campanha_abril_2.png
    │   │       campanha_abril_3.png
    │   │       campanha_abril_4.png
    │   │       dia_namorados1.png
    │   │       dia_namorados2.png
    │   │       dia_namorados3.png
    │   │       dia_namorados4.png
    │   │
    │   ├───estilos
    │   │       contrast.css
    │   │       rastroMulti.css
    │   │       rastroUnico.css
    │   │
    │   └───imgs
    │       │   correios-sf.png
    │       │   encomenda0.png
    │       │   encomenda1.png
    │       │   encomenda2.png
    │       │   encomenda3.png
    │       │   encomenda4.png
    │       │   encomenda5.png
    │       │   encomenda6.png
    │       │   encomenda7.png
    │       │   encomenda8.png
    │       │   encomenda9.png
    │       │
    │       └───novos
    │               agencia-relogio-stroke.svg
    │               bandeira-brasil-stroke.svg
    │               caixa-visto-stroke.svg
    │               caixa-x-stroke.svg
    │               caminhao-correndo-stroke.svg
    │               documento-encaminhar-stroke.svg
    │               documento-verificar-stroke.svg
    │               documento-visto-stroke.svg
    │               fatura-relogio-stroke.svg
    │               fatura-visto-stroke.svg
    │               postagem-stroke.svg
    │
    └───svg
            index.php
            seta_next_cinza.svg
            seta_preview_cinza.svg
```

## Descrição dos Diretórios

- **`app/`** - Contém os arquivos principais da aplicação web
- **`core/`** - Núcleo do sistema com funcionalidades JavaScript e CAPTCHA
- **`lib/`** - Bibliotecas externas (Bootstrap, jQuery, Font Awesome, etc.)
- **`static/`** - Recursos estáticos (CSS, JS, imagens, banners)

## Principais Funcionalidades

- Sistema de rastreamento de encomendas
- Interface web responsiva
- Funcionalidades de acessibilidade
- Sistema CAPTCHA para segurança
- Templates customizáveis
