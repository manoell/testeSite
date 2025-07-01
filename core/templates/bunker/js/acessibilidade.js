import {
    enterClick
} from './events.js';

const menu = document.querySelector('#acessibilidade a');
const dd = document.querySelector('#acess-drop-down');
const close = document.querySelector('#acess-drop-down .close');

const toggle = () => {
    menu.classList.toggle('aberto');
    dd.classList.toggle('aberto');
};

const abre = () => {
    menu.classList.add('aberto');
    dd.classList.add('aberto');
};

const fecha = () => {
    menu.classList.remove('aberto');
    dd.classList.remove('aberto');
};

if (menu) {
    menu.addEventListener('click', ev => {
        ev.stopPropagation();
        toggle();
    });
    dd.addEventListener('click', ev => ev.stopPropagation());
    document.body.addEventListener('click', () => fecha());
    close.addEventListener('click', () => fecha());

    enterClick(menu);
    enterClick(dd);
    enterClick(close);

}