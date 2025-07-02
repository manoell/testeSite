<!doctype html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta name="mobile-web-app-capable" content="yes">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Rastreamento</title>

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
        <a class="logo" href="https://www.correios.com.br"></a>
        <a class="pesquisar"></a>
        <a class="entrar" href="../core/seguranca/entrar.php"></a>
        
        <div class="menu">
            <section>
                <h1>Rastreamento <!-- 1.4.6.013 - v2.21.011 --></h1>
                <a href="../core/seguranca/entrar.php">Entrar</a>
            </section>
            
            <a href="http://globaltracktrace.ptc.post/gtt.web/Search.aspx" target="_blank">Rastreamento em outros países</a>
            <a href="https://www.correios.com.br/acesso-a-informacao/perguntas-frequentes">Perguntas frequentes</a>
            <a href="https://mais.correios.com.br/app/index.php" target="_blank">Busca Agências</a>
            <a href="https://www.correios.com.br/falecomoscorreios/central-de-atendimento" target="_blank">Central de Atendimento</a>
            <a href="https://www.correios.com.br/receber/prazo-de-guarda" target="_blank">Prazo de Guarda Objetos Nacionais</a>
            <a href="https://www.correios.com.br/receber/prazo-de-guarda-objetos-internacionais" target="_blank">Prazo de Guarda Objetos Internacionais</a>
            <a href="https://www2.correios.com.br/sistemas/precosPrazos/restricaoentrega/" target="_blank">Restrição de Entrega por CEP</a>
        </div>
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
    
    <footer id="rodape">
        <div class="recipiente largura-maxima">
            <div class="rodape-links">
                <h2>Fale Conosco</h2>
                <ul class="lista-icone">
                    <li>
                        <a href="https://faleconosco.correios.com.br/faleconosco/app/index.php" target="_blank">
                            <!-- Caminhos das imagens do rodapé corrigidos -->
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/monitor.png">
                            <span>Registro de Manifestações</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/falecomoscorreios/central-de-atendimento" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/duvida.png">
                            <span>Central de Atendimento</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://faleconosco.correios.com.br/faleconosco/app/cadastro/contrate/index.php" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/negocios.png">
                            <span>Soluções para o seu negócio</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://faleconosco.correios.com.br/faleconosco/app/cadastro/suporte/index.php" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/headset.png">
                            <span>Suporte ao cliente com contrato</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/falecomoscorreios/ouvidoria" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/ouvidoria.png">
                            <span>Ouvidoria</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/falecomoscorreios/canais-de-denuncia" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/denuncia.png">
                            <span>Denúncia</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="rodape-links">
                <h2>Sobre os Correios</h2>
                <ul class="lista-icone">
                    <li>
                        <a href="https://www.correios.com.br/acesso-a-informacao/institucional/identidade-corporativa" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/identidade.png">
                            <span>Identidade corporativa</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/educacao-e-cultura" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/educação.png">
                            <span>Educação e cultura</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/acesso-a-informacao/servidores/arquivos/codigo-de-conduta-etica-dos-correios.pdf" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/código ética.png">
                            <span>Código de ética</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/acesso-a-informacao/institucional/publicacoes/processos-de-contas-anuais" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/Transparência.png">
                            <span>Transparência e prestação de contas</span>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.correios.com.br/falecomoscorreios/politica-de-privacidade-e-cookies" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/cadeado.png">
                            <span>Política de Privacidade e Notas Legais</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="rodape-links">
                <h2>Outros Sites</h2>
                <ul class="lista-icone">
                    <li>
                        <a href="http://shopping.correios.com.br/wbm/store/script/store.aspx?cd_company=ErZW8Dm9i54=" target="_blank">
                            <img class="icones-link" src="../core/templates/bunker/img/rodape/loja correios.png">
                            <span>Loja online dos Correios</span>
                        </a>
                    </li>
                    <!--            <li>-->
                    <!--                <a href="https://www.gov.br/mcom/pt-br" target="_blank">-->
                    <!--                    <img class="icones-link" src="--><?//= SITE ?><!--core/templates/bunker/img/rodape/governo-federal.png">-->
                    <!--                    <span>Ministério das Comunicações</span>-->
                    <!--                </a>-->
                    <!--            </li>-->
                </ul>
            </div>
        </div>
        
        <div class="marca-gov">
            <!--                <img src="--><?//= SITE ?><!--core/templates/bunker/img/marca-gov.png"/>-->
        </div>
        <p>
        <div class="copyright">© Copyright 2025 Correios</div>
        </p>
    </footer>
    
    <div id="alerta">
        <div class="msg"></div>
        <div class="act"></div>
    </div>
    <div id="loading"></div>
    
    <!-- SEÇÃO DE SCRIPTS - SUBSTITUIR A PARTE ATUAL -->
	<!-- Localizar esta seção no final do arquivo app/index.php (antes do </body>) -->

	<!-- Todos os scripts com caminhos corrigidos -->
	<script defer type="module" src="../core/templates/bunker/js/bunker.js?3"></script>
	<script type="module" src="../static/js/global.js"></script>

	<!-- JQUERY -->
	<script src="../lib/jquery/jquery.js"></script>
	<script src="../lib/jquery/js/jquery.mask.min.js"></script>

	<!-- Bootstrap -->
	<script src="../lib/bootstrap4/js/bootstrap.bundle.js"></script>

	<!-- JQUERY MASKINPUT -->
	<script src="../lib/maskedinput-1.3.1/dist/jquery.maskedinput.min.js"></script>

	<!-- 🆕 NOVOS MÓDULOS OTIMIZADOS - ADICIONAR ESTAS LINHAS -->
	<script type="module" src="constants.js?v2.21.011"></script>
	<script type="module" src="templates.js?v2.21.011"></script>
	<script type="module" src="utils.js?v2.21.011"></script>
	<script type="module" src="api.js?v2.21.011"></script>

	<!-- 🔄 SCRIPTS OTIMIZADOS - SUBSTITUIR OS ORIGINAIS -->
	<script type="module" src="index.js?v2.21.011"></script>
	<script type="module" src="irParaArchor.js?v2.21.011"></script>
	<script type="module" src="high-contrast.js?v2.21.011"></script>

	<!-- Manter os scripts existentes no final (loading, etc.) -->
	<script>
		// Função para mostrar loading por tempo específico
		function showLoadingFor(seconds) {
			const loading = document.getElementById('loading');
			loading.classList.add('visivel');
			
			setTimeout(() => {
				loading.classList.remove('visivel');
			}, seconds * 1000);
		}

		// Função para mostrar imagem de loading do captcha por tempo específico
		function showCaptchaLoadingFor(seconds) {
			const captchaLoading = document.querySelector('.captcha_loading_image');
			if (captchaLoading) {
				captchaLoading.style.visibility = 'visible';
				
				setTimeout(() => {
					captchaLoading.style.visibility = 'hidden';
				}, seconds * 1000);
			}
		}

		// Event listener para o botão refresh
		document.addEventListener('DOMContentLoaded', function() {
			const refreshBtn = document.getElementById('captcha_refresh_btn');
			if (refreshBtn) {
				refreshBtn.addEventListener('click', function(e) {
					e.preventDefault();
					showLoadingFor(1); // Mostra loading por 1 segundo
					// A funcionalidade do refresh agora é gerenciada pelo sistema otimizado
				});
			}
			
			// Event listener para o botão volume-up
			const volumeBtn = document.querySelector('.captcha_play_button');
			if (volumeBtn) {
				volumeBtn.addEventListener('click', function(e) {
					e.preventDefault();
					showLoadingFor(10); // Mostra loading por 10 segundos
					showCaptchaLoadingFor(1); // Mostra imagem loading por 1 segundo
				});
			}
		});
	</script>

</body>

</html>