<!doctype html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta name="mobile-web-app-capable" content="yes">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Rastreamento</title>
    <!-- Script Ruxit comentado para evitar interferência -->
    <!-- <script type="text/javascript" src="../ruxitagentjs_ICA7NVfgqrux_10315250519065025.js" data-dtconfig="rid=RID_1261318018|rpid=-1436449472|domain=correios.com.br|reportUrl=/rb_bf62475kpy|app=1076fce661cc53ae|cuc=88037dhn|owasp=1|mel=100000|featureHash=ICA7NVfgqrux|lastModification=1750775729968|srsr=10000|tp=500,50,0|rdnt=1|uxrgce=1|agentUri=/ruxitagentjs_ICA7NVfgqrux_10315250519065025.js"></script> -->
    
    <!-- CDN corrigida -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />
    
    <!-- Todos os caminhos corrigidos para ../ (subir uma pasta da /app/ para a raiz) -->
    <link rel="stylesheet" href="../lib/font-awesome/css/font-awesome.min.css?v2.21.011">
    <link rel="stylesheet" href="../lib/bootstrap4/css/bootstrap.min.css?v2.21.011" id="bootstrap-css">
    <link rel='stylesheet prefetch' href="../static/css/reset.min.css?v2.21.011">
    <link rel="shortcut icon" href="../core/templates/bunker/img/favi-ect.png" />
    <link rel="stylesheet" href="../core/templates/bunker/css/bunker.css?v2.21.011">
    <link rel="stylesheet" href="../static/css/global.css?v2.21.011">

    <!-- <link rel="stylesheet" href="../lib/fontawesome/font-awesome.min.css'> -->

    <link rel="stylesheet" href="../static/rastreamento-internet/estilos/rastroUnico.css?v2.21.011">
    <link rel="stylesheet" href="../static/rastreamento-internet/estilos/rastroMulti.css?v2.21.011">
    <link rel="stylesheet" href="../static/rastreamento-internet/estilos/contrast.css?v2.21.011">
    
    <!-- Arquivos locais da pasta /app/ (sem ../) -->
    <link rel="stylesheet" href="index.css?v2.21.011">
    <link rel="stylesheet" href="carrossel.css?v2.21.011">
</head>

<!-- CLASSE "oculto" REMOVIDA -->
<body>
    <section id="acessibilidade">
        <a tabindex="1">Acessibilidade</a>
        <!--    <a class="idioma">Português</a>-->
    </section>
    <div id="acess-drop-down">
        <header>
            <a class="close" tabindex="1"></a>
        </header>
        <section>
            <a tabindex="1" href="javascript:irPara.jumpTo('tabs-rastreamento');" class="conteudo numero" data-numero="1">Ir para o conteúdo</a>
            <a tabindex="1" href="javascript:irPara.jumpTo('menu');" class="menu numero" data-numero="2">Ir para o menu</a>
            <a tabindex="1" href="javascript:irPara.jumpTo('titulo-pagina');" class="busca numero" data-numero="3">Ir para a busca</a>
            <a tabindex="1" href="javascript:irPara.jumpTo('rodape');" class="rodape numero" data-numero="4">Ir para o rodapé</a>
            <a tabindex="1" href="javascript:window.toggleContrast();irPara.fechaMenuAcessibilidade()" class="contraste">Alto contraste</a>
            <a tabindex="1" href="https://vlibras.gov.br" class="libras">Libras</a>
            <a tabindex="1" class="saiba-mais">Saiba mais sobre acessibilidade</a>
        </section>
    </div>
    
    <section id="menu">
		<a class="hamburger" tabindex="1"></a>
		<a class="logo" href="#"></a>
		
	</section>
    
    <main>
        <input type="hidden" id="documento" name="documento" value="">
        <div class="container">
            <nav aria-label="breadcrumb">
                <div id="trilha">
                    <a>Portal Correios</a>
                    <a>Rastreamento</a>
                </div>
            </nav>
            <form>
                <div class="d-flex flex-row justify-content-between" id="titulo-pagina">
                    <h3>Rastreamento</h3>
                </div>

                <div class="jumbotron">
                    <div class="campos">
                        <div class="campo">
                            <div class="rotulo">
                                <label for="objeto">Deseja acompanhar seu objeto?<br>Digite seu CPF/CNPJ <span style="font-weight: bold">ou</span> código* de rastreamento.</label>
                            </div>
                            <div class="controle linhas align-items-center">
                                <input type="text" id="objeto" name="objeto" class="form-control"
                                       placeholder="AA123456785BR" value="" required>
                            </div>
                            <div style="margin-top: 1em"> * limite de 20 objetos</div>
                            <div class="mensagem"></div>
                        </div>
                    </div>

                    <div class="campos captcha">
                        <div class="campo">
                            <div class="controle">
                                <!-- Caminhos do captcha corrigidos -->
                                <img id="captcha_image"
                                    src="../core/securimage/securimage_show.php"
                                    alt="CAPTCHA Image">
                                <div id="captcha_image_audio_div">
                                    <audio id="captcha_image_audio" preload="none" style="display: none">
                                        <source id="captcha_image_source_wav"
                                                src="../core/securimage/securimage_play.php?id=745127474"
                                                type="audio/wav">
                                    </audio>
                                </div>
                                <div id="captcha_image_audio_controls">
                                    <a tabindex="-1" class="captcha_play_button"
                                       href="../core/securimage/securimage_play.php?id=73745"
                                       onclick="return false">
                                        <i class="fa fa-volume-up" aria-hidden="true" style="width: 16px"></i>
                                        <img class="captcha_loading_image rotating" height="32" width="32"
                                             src="../core/securimage/images/loading.png"
                                             alt="Loading audio"
                                             style="display: none">
                                    </a>
                                    <noscript>Enable Javascript for audio controls</noscript>
                                    <p>
                                        <script type="text/javascript" src="../core/securimage/securimage.js"></script>
                                        <script type="text/javascript">
                                            captcha_image_audioObj = new SecurimageAudio(
                                                { audioElement: 'captcha_image_audio',
                                                    controlsElement: 'captcha_image_audio_controls'
                                                });
                                        </script>

                                        <a tabindex="-1" style="border: 0" href="#" title="Refresh Image"
                                           id="captcha_refresh_btn">
                                            <i class="fa fa-refresh" aria-hidden="true" onclick="this.blur()"></i>
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <!--                <div class="campos">-->
                        <div class="campo"> <!--  style="border: solid 1px;" -->
                            <div class="rotulo">
                                <label for="captcha">Digite o texto contido na imagem</label>
                            </div>
                            <div class="controle">
                                <input type="text" name="captcha" id="captcha" autocomplete="off" class="form-control">
                                <button type="button" id="b-pesquisar" name="b-pesquisar" class="btn btn-primary botao-principal">Consultar</button>
                            </div>
                            <div class="mensagem"></div>
                        </div>
                    </div>
                </div>
                <button hidden type="button" id="b-invoked" name="b-invoked"></button>
            </form>
            <div id="tabs-rastreamento"></div>
            <br>
            <div class="bannersro">
                <div id="carouselExampleControls" class="carousel" data-ride="carousel" data-interval="10000">
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <a href="https://www.correios.com.br/central-de-informacoes/boletim-aos-clientes/mensagens-falsas-sobre-encomendas" target="_blank">
                                <picture>
                                    <!-- Caminhos das imagens corrigidos -->
                                    <source srcset="../static/rastreamento-internet/banners/alerta-golpe1.png?ver=v2.21.011" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/alerta-golpe2.png?ver=v2.21.011" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/alerta-golpe3.png?ver=v2.21.011" media="(max-width: 994px)" class="banner-geral">
                                    <img src="../static/rastreamento-internet/banners/alerta-golpe4.png?ver=v2.21.011" class="justify-content-center banner-geral"/>
                                </picture>
                            </a>
                        </div>
                        <div class="carousel-item ">
                            <a href="https://www.correios.com.br/atendimento/balcao-do-cidadao/seguros" target="_blank">
                                <picture>
                                    <source srcset="../static/rastreamento-internet/banners/campanha_abril_1.png?ver=v2.21.011" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/campanha_abril_2.png?ver=v2.21.011" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/campanha_abril_3.png?ver=v2.21.011" media="(max-width: 994px)" class="banner-geral">
                                    <img src="../static/rastreamento-internet/banners/campanha_abril_4.png?ver=v2.21.011" class="justify-content-center banner-geral"/>
                                </picture>
                            </a>
                        </div>
                        <div class="carousel-item ">
                            <a href="https://www.correioscelular.com.br" target="_blank">
                                <picture>
                                    <source srcset="../static/rastreamento-internet/banners/dia_namorados1.png?ver=v2.21.011" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/dia_namorados2.png?ver=v2.21.011" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/dia_namorados3.png?ver=v2.21.011" media="(max-width: 994px)" class="banner-geral">
                                    <img src="../static/rastreamento-internet/banners/dia_namorados4.png?ver=v2.21.011" class="justify-content-center banner-geral"/>
                                </picture>
                            </a>
                        </div>
                        <div class="carousel-item ">
                            <a href="https://www.correios.com.br/atendimento/ferramentas/aplicativo-dos-correios" target="_blank">
                                <picture>
                                    <source srcset="../static/rastreamento-internet/banners/loja_correios_1.png?ver=v2.21.011" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/loja_correios_2.png?ver=v2.21.011" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/loja_correios_3.png?ver=v2.21.011" media="(max-width: 994px)" class="banner-geral">
                                    <img src="../static/rastreamento-internet/banners/loja_correios_4.png?ver=v2.21.011" class="justify-content-center banner-geral"/>
                                </picture>
                            </a>
                        </div>
                    </div>
                    <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="modal" id="modalshare" data-esc="">
            <section>
                <div class="social-media-modal noPrint">
                    <div class="social-media-modal-arrow" style="align-self: center; left: 0px;"></div>
                    <div id="msharebuttons" class="social-media-modal-wrapper" data-objeto=""></div>
                </div>
            </section>
        </div>

        <div id="regiao-botoes" class="oculta"></div>
    </main>
	
	<!-- In&#237;cio do rodap&#233; -->
    <footer>
        <!-- Div repons&#225;vel pelo portlet de rodap&#233; -->
        <div id="portal-footer-wrapper"></div>
        <div id="portal-footer">



            <div id="rodape-content">
                <div class="fim-pagina">
                    <div class="largura-maxima">
                        <div class="marca-gov">
                            <img src="../core/templates/bunker/img/rodape/marca-gov.png" alt="Imagem com a logo dos Correios e do Governo Federal" />
                        </div>
                        <div class="copyright">
                            <span>© Copyright 2025 Correios</span>
                        </div>
                        <div class="cnpj-rodape">
                            <span>CNPJ 34.028.316/0001-03</span>
                        </div>
                    </div>
                </div>
			</div>
        </div>
    </footer>
    <!-- Fim do rodap&#233; -->
    
    <div id="alerta">
        <div class="msg"></div>
        <div class="act"></div>
    </div>
    <div id="loading"></div>
    
    <script>
        var RAIZ = '/opt/sistemas/';
        var SITE = 'https://rastreamento.correios.com.br/';
        var APP_HTTP = 'https://rastreamento.correios.com.br/app/';
        var APP = '/opt/sistemas/app/';
        var APP_FILES = '../static/'; // Corrigido para ../static/
        var msg = {"AUTENTICACAO_NECESSARIA":"\u00c9 necess\u00e1ria a autentica\u00e7\u00e3o, aperte o bot\u00e3o entrar","AGUARDE":"Aguarde...","AGUARDE_ENVIO_EMAIL":"Enviando Email...","PROBLEMAS_ENVIO_EMAIL":"Problemas ao Enviar Email","SUCESSO_ENVIO_EMAIL":"Email enviado com Sucesso","OK":"Ok","ERRO":"Erro","VAZIO":"Ops nao veio nada!","RETORNO_INEXPERADO":"Ops algo aconteceu!","ERRO_DETALHE":"(@@erro)","SUCCESS":"success","INFO":"info","DARK":"dark","WARNING":"warning","DANGER":"danger","LIGHT":"light","ICO_EXCLAMATION":"fa fa-exclamation-triangle","ICO_CHECK":"fa fa-check-circle","ICO_REFRESH":"fa fa-sync-alt fa-spin","COM_ESPERA_01S":5,"COM_ESPERA_05S":500,"COM_ESPERA_1S":1000,"COM_ESPERA_2S":2000,"COM_ESPERA":3000,"SEM_ESPERA":0,"100":"Continuar","101":"Mudando Protocolos","102":"Processando","200":"OK","201":"@@objeto Criado","202":"Aceito","203":"N\u00e3o autorizado","204":"Nenhum Conte\u00fado","205":"Resetar Conte\u00fado","206":"Conte\u00fado Parcial","300":"M\u00faltipla Escolha","301":"Movido Permanentemente","302":"Encontrado","303":"Veja outro","304":"N\u00e3o modificado","305":"Use Proxy","306":"Proxy Trocado","400":"Solicita\u00e7\u00e3o Inv\u00e1lida","401":"N\u00e3o autorizado","402":"Pagamento necess\u00e1rio","403":"Proibido","404":"N\u00e3o encontrado","405":"M\u00e9todo n\u00e3o permitido","406":"N\u00e3o aceito","407":"Autentica\u00e7\u00e3o de Proxy Necess\u00e1ria","408":"Tempo de solicita\u00e7\u00e3o esgotado","409":"Conflito","410":"Perdido","411":"Dura\u00e7\u00e3o necess\u00e1ria","412":"Falha de pr\u00e9-condi\u00e7\u00e3o","413":"Solicita\u00e7\u00e3o da entidade muito extensa","414":"Solicita\u00e7\u00e3o de URL muito Longa","415":"Tipo de m\u00eddia n\u00e3o suportado","416":"Solicita\u00e7\u00e3o de faixa n\u00e3o satisfat\u00f3ria","417":"Falha na expectativa","500":"Erro do Servidor Interno","501":"N\u00e3o implementado","502":"Porta de entrada ruim","503":"Servi\u00e7o Indispon\u00edvel","504":"Tempo limite da Porta de Entrada","505":"Vers\u00e3o HTTP n\u00e3o suportada"};
        var AMBIENTE_EXECUCAO = 'P';
    </script>
    
    <!-- Todos os scripts com caminhos corrigidos -->
    <script defer type="module" src="../core/templates/bunker/js/bunker.js?3"></script>
    <script type="module" src="../static/js/global.js"></script>

    <!-- JQUERY -->
    <script src="../lib/jquery/jquery.js"></script>
    <!-- <script src="../lib/jquery/jquery.min.js"></script> -->
    <script src="../lib/jquery/js/jquery.mask.min.js"></script>

    <!-- MAPA Leaflet -->
    <!-- <script src="../lib/leaflet/leaflet.js"></script>
         <script src="../lib/leaflet/leaflet-src.js"></script>
        <script src="../lib/leaflet/leaflet-realtime.js"></script> -->

    <!-- Bootstrap -->
    <script src="../lib/bootstrap4/js/bootstrap.bundle.js"></script>

    <!-- JQUERY MASKINPUT -->
    <script src="../lib/maskedinput-1.3.1/dist/jquery.maskedinput.min.js"></script>

    <!-- Inicio Google Analytics -->

    <!-- <script>
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        ga('create', 'UA-564464-1', 'auto');
        ga('send', 'pageview');
    </script> -->
    <!-- Fim Google Analytics -->
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-J59GSF3WW5"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-J59GSF3WW5');
    </script> -->
    <!-- Fim Global site tag (gtag.js) - Google Analytics -->
    
    <!--<script src="../core/js/rastroMulti.js?--><?//= CSSJSV ?><!--"></script>-->
    <!--<script type="module" src="../core/js/rastroUnico.js?--><?//= CSSJSV ?><!--"></script>-->
    
    <!-- Scripts locais da pasta /app/ -->
    <script type="module" src="index.js?v2.21.011"></script>
    <script src="./irParaArchor.js"></script>
    <script src="./high-contrast.js"></script>

</body>

</html>