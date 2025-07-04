<!doctype html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta name="mobile-web-app-capable" content="yes">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Rastreamento</title>

    <!-- CSS -->
    <link rel="stylesheet" href="assets/css/reset.css">
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/font-awesome.min.css">
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/contrast.css">
    
    <link rel="shortcut icon" href="assets/images/favi-ect.png" />
</head>

<body>
    <!-- Menu de Acessibilidade -->
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
    
    <!-- Menu Principal -->
    <section id="menu">
        <a class="hamburger" tabindex="1"></a>
        <a class="logo" href="#"></a>
        
        <div class="menu oculto">
            <section>
                <h1>Rastreamento</h1>
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
    
    <!-- Conteúdo Principal -->
    <main>
        <div class="container">
            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb">
                <div id="trilha">
                    <a>Portal Correios</a>
                    <a>Rastreamento</a>
                </div>
            </nav>
            
            <!-- Título da Página -->
            <div class="d-flex flex-row justify-content-between" id="titulo-pagina">
                <h3>Rastreamento</h3>
            </div>

            <!-- Formulário -->
            <div class="jumbotron">
                <form id="form-rastreamento">
                    <!-- Campo de entrada -->
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

                    <!-- CAPTCHA -->
                    <div class="campos captcha">
                        <div class="campo">
                            <div class="controle">
                                <img id="captcha_image" src="api/securimage/securimage_show.php" alt="CAPTCHA Image">
                                
                                <!-- Controles de áudio -->
                                <div id="captcha_image_audio_div">
                                    <audio id="captcha_image_audio" preload="none" style="display: none">
                                        <source id="captcha_image_source_wav" src="api/securimage/securimage_play.php" type="audio/wav">
                                    </audio>
                                </div>
                                
                                <div id="captcha_image_audio_controls">
                                    <a tabindex="-1" class="captcha_play_button" href="api/securimage/securimage_play.php" onclick="return false">
                                        <i class="fa fa-volume-up" aria-hidden="true" style="width: 16px"></i>
                                        <img class="captcha_loading_image rotating" height="32" width="32"
                                             src="api/securimage/images/loading.png" alt="Loading audio" style="display: none">
                                    </a>
                                    
                                    <a tabindex="-1" style="border: 0" href="#" title="Refresh Image" id="captcha_refresh_btn">
                                        <i class="fa fa-refresh" aria-hidden="true" onclick="this.blur()"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Campo CAPTCHA -->
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
                </form>
            </div>
            
            <!-- Área de resultados -->
            <div id="tabs-rastreamento"></div>
            
            <br>
            
            <!-- Carrossel de banners -->
            <div class="bannersro">
                <div id="carouselExampleControls" class="carousel" data-ride="carousel" data-interval="10000">
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <a href="#seguro" target="_blank">
                                <picture>
                                    <source srcset="assets/images/banners/campanha_abril_1.png" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="assets/images/banners/campanha_abril_2.png" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="assets/images/banners/campanha_abril_3.png" media="(max-width: 994px)" class="banner-geral">
                                    <img src="assets/images/banners/campanha_abril_4.png" class="justify-content-center banner-geral" loading="lazy"/>
                                </picture>
                            </a>
                        </div>
                        <div class="carousel-item">
                            <a href="#celular" target="_blank">
                                <picture>
                                    <source srcset="assets/images/banners/dia_namorados1.png" media="(max-width: 480px)" class="banner-geral">
                                    <source srcset="assets/images/banners/dia_namorados2.png" media="(max-width: 770px)" class="banner-geral">
                                    <source srcset="assets/images/banners/dia_namorados3.png" media="(max-width: 994px)" class="banner-geral">
                                    <img src="assets/images/banners/dia_namorados4.png" class="justify-content-center banner-geral" loading="lazy"/>
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
        
        <!-- Modal de compartilhamento -->
        <div class="modal" id="modalshare" data-esc="">
            <section>
                <div class="social-media-modal noPrint">
                    <div class="social-media-modal-arrow" style="align-self: center; left: 0px;"></div>
                    <div id="msharebuttons" class="social-media-modal-wrapper" data-objeto=""></div>
                </div>
            </section>
        </div>
    </main>
    
    <!-- Rodapé -->
    <footer id="rodape">
        <div class="marca-gov">
            <img src="assets/images/marca-gov.png" loading="lazy"/>
        </div>
        <p>
            <div class="copyright"><strong>© Copyright 2025 Correios</strong></div>
        </p>
    </footer>
    
    <!-- Alertas e Loading -->
    <div id="alerta">
        <div class="msg"></div>
        <div class="act"></div>
    </div>
    <div id="loading"></div>
    
    <!-- Scripts -->
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/securimage.js"></script>
    <script src="assets/js/main.js"></script>
    
    <!-- Inicialização do CAPTCHA -->
    <script>
        // Inicializa o sistema de áudio do CAPTCHA
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof SecurimageAudio !== 'undefined') {
                captcha_image_audioObj = new SecurimageAudio({
                    audioElement: 'captcha_image_audio',
                    controlsElement: 'captcha_image_audio_controls'
                });
            }
        });
    </script>
</body>

</html>