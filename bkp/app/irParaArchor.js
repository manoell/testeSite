const irPara = (function() {

    const module = {};

    module.jumpTo = (archor) => {
        document.getElementById(archor).scrollIntoView(true);
        module.fechaMenuAcessibilidade();
        if (archor === 'menu') {
            module.abreMenuLateral();
        }
    }

    module.fechaMenuAcessibilidade = () => {
        const menu = document.querySelector('#acessibilidade a');
        const dd = document.querySelector('#acess-drop-down');
        menu.classList.remove('aberto');
        dd.classList.remove('aberto');
    }

    module.abreMenuLateral = () => {
        const hambuguer = document.querySelector('#menu .hamburger');
        const ctn = document.querySelector('#menu > .menu');
        hambuguer.classList.add('aberto');
        ctn.classList.remove('oculto');
        document.body.classList.add('menu-aberto');
    }

    return {
        jumpTo: module.jumpTo,
        fechaMenuAcessibilidade: module.fechaMenuAcessibilidade,
        abreMenuLateral: module.abreMenuLateral
    }

})();