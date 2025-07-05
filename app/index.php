<?php
// Gerar timestamp único para evitar cache
$timestamp = time();
$version = "v" . $timestamp;

// Headers anti-cache para a página HTML
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
?>
<!doctype html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta name="mobile-web-app-capable" content="yes">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <!-- Meta tags anti-cache -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <title>Rastreamento</title>

    <!-- TODAS AS BIBLIOTECAS AGORA SÃO LOCAIS - SEM CDNs EXTERNOS -->
    
    <!-- Animate.css - VERSÃO LOCAL -->
    <link href="../lib/animate/animate.min.css?<?php echo $version; ?>" rel="stylesheet">
    
    <!-- Bootstrap 4.6.2 - VERSÃO LOCAL -->
    <link rel="stylesheet" href="../lib/bootstrap/css/bootstrap.min.css?<?php echo $version; ?>">
    
    <!-- Font Awesome - VERSÃO LOCAL -->
    <link rel="stylesheet" href="../lib/font-awesome/css/font-awesome.min.css?<?php echo $version; ?>">

    <!-- CSS LOCAIS COM TIMESTAMP -->
    <link rel='stylesheet' href="../static/css/reset.min.css?<?php echo $version; ?>">
    <link rel="shortcut icon" href="../core/templates/bunker/img/favi-ect.png?<?php echo $version; ?>" />
    <link rel="stylesheet" href="../core/templates/bunker/css/bunker.css?<?php echo $version; ?>">
    <link rel="stylesheet" href="../static/css/global.css?<?php echo $version; ?>">
    <link rel="stylesheet" href="../static/rastreamento-internet/estilos/rastroUnico.css?<?php echo $version; ?>">
    <link rel="stylesheet" href="../static/rastreamento-internet/estilos/rastroMulti.css?<?php echo $version; ?>">
    <link rel="stylesheet" href="../static/rastreamento-internet/estilos/contrast.css?<?php echo $version; ?>">
    
    <!-- Arquivos locais da pasta /app/ -->
    <link rel="stylesheet" href="index.css?<?php echo $version; ?>">
    <link rel="stylesheet" href="carrossel.css?<?php echo $version; ?>">
</head>

<body>
    <section id="acessibilidade">
        <a tabindex="1">Acessibilidade</a>
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
        
        <div class="menu">
            <section>
                <h1>Rastreamento <!-- <?php echo $version; ?> --></h1>
            </section>
            
            <a href="#">Rastreamento em outros países</a>
            <a href="#">Perguntas frequentes</a>
            <a href="#">Busca Agências</a>
            <a href="#">Central de Atendimento</a>
            <a href="#">Prazo de Guarda Objetos Nacionais</a>
            <a href="#">Prazo de Guarda Objetos Internacionais</a>
            <a href="#">Restrição de Entrega por CEP</a>
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
                            <div class="mensagem"></div>
                        </div>
                    </div>

                    <div class="campos captcha">
                        <div class="campo">
                            <div class="controle">
                                <img id="captcha_image"
                                    src="../core/securimage/securimage_show.php?<?php echo $timestamp; ?>"
                                    alt="CAPTCHA Image">
                                <div id="captcha_image_audio_div">
                                    <audio id="captcha_image_audio" preload="none" style="display: none">
                                        <source id="captcha_image_source_wav"
                                                src="../core/securimage/securimage_play.php?<?php echo $timestamp; ?>"
                                                type="audio/wav">
                                    </audio>
                                </div>
                                <div id="captcha_image_audio_controls">
                                    <a tabindex="-1" class="captcha_play_button"
                                       href="../core/securimage/securimage_play.php?<?php echo $timestamp; ?>"
                                       onclick="return false">
                                        <i class="fa fa-volume-up" aria-hidden="true" style="width: 16px"></i>
                                        <img class="captcha_loading_image rotating" height="32" width="32"
                                             src="../core/securimage/images/loading.png?<?php echo $timestamp; ?>"
                                             alt="Loading audio"
                                             style="display: none">
                                    </a>
                                    <noscript>Enable Javascript for audio controls</noscript>
                                    <p>
                                        <script type="text/javascript" src="../core/securimage/securimage.js?<?php echo $version; ?>"></script>
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
                        <div class="campo">
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
            <div id="tabs-rastreamento" class="oculto">
				<div id="ver-rastro-unico" style="display: block;">
				<div id="cabecalho-rastro" class="d-flex justify-content-between">
					<ul class="cabecalho-rastro">                
						<div class="arrow-dashed justify-content-start">
							<div class="circle">
								<img class="circle-logo" src="../static/rastreamento-internet/imgs/correios-sf.png?<?php echo $timestamp; ?>" width="35px" height="35px">
							</div>
						</div>
						<div class="cabecalho-content">
							<p class="text text-content">PREVISÃO DE ENTREGA</p>                    	

						<p class="text text-content">1 a 5 dias úteis após pagamento confirmado</p><p class="text text-content"></p></div>                                                
					</ul>        
					<div class="share-bar noPrint">
						<a title="Compartilhar" class="btn btn-light">
							<i class="fa fa-share-alt" aria-hidden="true"></i>
						</a>
					</div>
				</div>		


				<ul class="ship-steps">
					<li class="step">

				<div class="arrow-current">
					<div class="circle">
					<img class="circle-img" src="../static/rastreamento-internet/imgs/novos/fatura-relogio-stroke.svg?<?php echo $timestamp; ?>">            
					</div>
				</div>


				<div class="step-content">
					<p class="text text-head">Importação autorizada  pela autoridade competente - aguardando pagamento</p>
					<p class="text text-content">CURITIBA - PR</p>
					  <p class="text text-head"><a href="#btnRealizarPagamento"><u>REALIZAR PAGAMENTO</u></a></p>
					<p class="text text-content"></p>
				</div>

			</li><li class="step">

				<div class="arrow-current">
					<div class="circle">
					<img class="circle-img" src="../static/rastreamento-internet/imgs/novos/bandeira-brasil-stroke.svg?<?php echo $timestamp; ?>">            
					</div>
				</div>


				<div class="step-content">
					<p class="text text-head">Objeto recebido pelos Correios do Brasil</p>
					<p class="text text-content">CURITIBA - PR</p>

					<p class="text text-content"></p>
				</div>

			</li><li class="step">

				<div class="arrow-current">
					<div class="circle">
					<img class="circle-img" src="../static/rastreamento-internet/imgs/novos/documento-visto-stroke.svg?<?php echo $timestamp; ?>">            
					</div>
				</div>


				<div class="step-content">
					<p class="text text-head">Análise concluída - importação autorizada</p>
					<p class="text text-content">CURITIBA - PR</p>
					  <p class="text text-head"></p>
					<p class="text text-content"></p>
				</div>

			</li><li class="step">

				<div class="arrow-current">
					<div class="circle">
					<img class="circle-img" src="../static/rastreamento-internet/imgs/novos/documento-encaminhar-stroke.svg?<?php echo $timestamp; ?>">            
					</div>
				</div>


				<div class="step-content">
					<p class="text text-head">Informações enviadas para análise da autoridade aduaneira/órgãos anuentes</p>
					<p class="text text-content">CURITIBA - PR</p>
					  <p class="text text-head"></p>
					<p class="text text-content"></p>
				</div>

			</li><li class="step">

				<div class="arrow-none">
					<div class="circle">
					<img class="circle-img" src="../static/rastreamento-internet/imgs/novos/postagem-stroke.svg?<?php echo $timestamp; ?>">            
					</div>
				</div>


				<div class="step-content">
					<p class="text text-head">Objeto postado</p>
					<p class="text text-content">CHINA</p>

					<p class="text text-content"></p>
				</div>

			</li>
				</ul>

					</div>



					</div>
            <br>
            <div class="bannersro">
                <div id="carouselExampleControls" class="carousel" data-ride="carousel" data-interval="10000">
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <a href="#seguro" target="_blank">
                                <picture>
                                    <source srcset="../static/rastreamento-internet/banners/campanha_abril_1.png?<?php echo $version; ?>" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/campanha_abril_2.png?<?php echo $version; ?>" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/campanha_abril_3.png?<?php echo $version; ?>" media="(max-width: 994px)" class="banner-geral">
                                    <img src="../static/rastreamento-internet/banners/campanha_abril_4.png?<?php echo $version; ?>" class="justify-content-center banner-geral" loading="lazy"/>
                                </picture>
                            </a>
                        </div>
                        <div class="carousel-item">
                            <a href="#celular" target="_blank">
                                <picture>
                                    <source srcset="../static/rastreamento-internet/banners/dia_namorados1.png?<?php echo $version; ?>" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/dia_namorados2.png?<?php echo $version; ?>" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="../static/rastreamento-internet/banners/dia_namorados3.png?<?php echo $version; ?>" media="(max-width: 994px)" class="banner-geral">
                                    <img src="../static/rastreamento-internet/banners/dia_namorados4.png?<?php echo $version; ?>" class="justify-content-center banner-geral" loading="lazy"/>
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
        <div class="marca-gov">
            <img src="../core/templates/bunker/img/rodape/marca-gov.png?<?php echo $timestamp; ?>" loading="lazy"/>
        </div>
        <p>
        <div class="copyright"><strong>© Copyright 2025 Correios</strong></div>
        </p>
    </footer>
    
    <div id="alerta">
        <div class="msg"></div>
        <div class="act"></div>
    </div>
    <div id="loading"></div>
    
    <!-- SCRIPTS LOCAIS COM TIMESTAMP ANTI-CACHE -->

    <!-- jQuery 3.7.1 - VERSÃO LOCAL -->
    <script src="../lib/jquery/jquery.min.js?<?php echo $version; ?>"></script>

    <!-- jQuery Mask 1.14.16 - VERSÃO LOCAL -->
    <script src="../lib/jquery-mask/jquery.mask.min.js?<?php echo $version; ?>"></script>

    <!-- Bootstrap 4.6.2 JS - VERSÃO LOCAL -->
    <script src="../lib/bootstrap/js/bootstrap.bundle.min.js?<?php echo $version; ?>"></script>

    <!-- jQuery Masked Input 1.4.1 - VERSÃO LOCAL -->
    <script src="../lib/jquery-maskedinput/jquery.maskedinput.min.js?<?php echo $version; ?>"></script>

    <!-- SCRIPTS LOCAIS DO PROJETO -->
    <script defer type="module" src="../core/templates/bunker/js/bunker.js?<?php echo $version; ?>"></script>
    <script type="module" src="../static/js/global.js?<?php echo $version; ?>"></script>

    <!-- MÓDULOS OTIMIZADOS COM TIMESTAMP -->
    <script type="module" src="constants.js?<?php echo $version; ?>"></script>
    <script type="module" src="templates.js?<?php echo $version; ?>"></script>
    <script type="module" src="utils.js?<?php echo $version; ?>"></script>
    <script type="module" src="api.js?<?php echo $version; ?>"></script>
    <script type="module" src="index.js?<?php echo $version; ?>"></script>
    <script type="module" src="irParaArchor.js?<?php echo $version; ?>"></script>
    <script type="module" src="high-contrast.js?<?php echo $version; ?>"></script>

    <!-- SCRIPTS CUSTOMIZADOS -->
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
                    showLoadingFor(1);
                });
            }
            
            // Event listener para o botão volume-up
            const volumeBtn = document.querySelector('.captcha_play_button');
            if (volumeBtn) {
                volumeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showLoadingFor(10);
                    showCaptchaLoadingFor(1);
                });
            }
        });
    </script>

</body>

</html>