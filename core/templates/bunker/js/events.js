/**
 * Dispara o evento de click em um elemento caso caso o foco esteja sobre ele.
 * @param {Element} el
 */

const enterClick = el => {
    el.addEventListener('keydown', ev => {
        if (ev.key == 'Enter') {
            ev.preventDefault();
            el.dispatchEvent(new Event('click'));
        }
    });
};

export {
    enterClick
};