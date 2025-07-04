/**
 * events.js - Utilitários de Eventos Otimizados
 * Versão otimizada: simplificado, melhor performance
 */

/**
 * Dispara evento de click quando Enter é pressionado
 * @param {Element} element - Elemento alvo
 */
const enterClick = element => {
    if (!element) return;
    
    element.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            element.dispatchEvent(new Event('click'));
        }
    });
};

export { enterClick };