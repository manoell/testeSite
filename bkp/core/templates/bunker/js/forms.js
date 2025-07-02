import { validacoesPadrao } from './validacoes-padrao.js';

const registrados = new Set();
const validacoes = new Map(validacoesPadrao.map(v => [v.sel, v]));

const registra = f => {
  if (f.tagName == 'FORM') {
    f.noValidate = true;
    f.addEventListener('submit', ev => {
      ev.preventDefault();
    });
  }
  registrados.add(f);
  const observer = new MutationObserver(() => {
    avaliaRegistrados();
  });
  f.observer = observer;
  observer.observe(f, { attributes: true, childList: true, subtree: true });
  avaliaForm(f);
};

const avaliaRegistrados = () => {
  for (let f of registrados) {
    avaliaForm(f);
  }
};

const updateValidListener = ev => {
  if (ev && ev.type == 'keydown' && ev.key != 'Enter') return;
  updateValid(ev.currentTarget);
};

const updateValid = cur => {
  let ctnMsg;
  if (['radio', 'checkbox'].includes(cur.type)) {
    ctnMsg = cur.parentNode.parentNode.parentNode.querySelector('.mensagem');
  } else {
    ctnMsg = cur.parentNode.parentNode.querySelector('.mensagem');
  }
  if (ctnMsg) {
    ctnMsg.textContent = cur.validationMessage || cur.mensagemPadrao;
  }
  if (cur.validationMessage) {
    cur.classList.add('invalid');
  } else {
    cur.classList.remove('invalid');
  }
};

const avaliaForm = f => {
  [...f.querySelectorAll('input, select, textarea, form')].filter(el => !el.hasOwnProperty('mensagemPadrao')).
    forEach(el => {
      const ctnMsg = el.parentNode.parentNode.querySelector('.mensagem');
      if (!ctnMsg) {
        el.mensagemPadrao = '';
        return;
      }
      el.mensagemPadrao = ctnMsg.textContent;
    });
  for (let [sel, v] of validacoes.entries()) {
    [...f.querySelectorAll(sel)].filter(el => !el.avaliadoForm).forEach(el => {
      if (v.ini) v.ini(el);
      el.avaliadoForm = true;
      el.removeAttribute('pattern');
      el.addEventListener('blur', ev => {
        const cur = ev.currentTarget;
        let validade = v.val(cur, ev);
        if (validade == undefined) validade = '';
        cur.setCustomValidity(validade);
      });
      el.addEventListener('keydown', ev => {
        if (ev.key != 'Enter') return;
        const cur = ev.currentTarget;
        let validade = v.val(cur, ev);
        if (validade == undefined) validade = '';
        cur.setCustomValidity(validade);
      });
    });
  }
  f.querySelectorAll('input, select, textarea, form').forEach(el => {
    el.addEventListener('blur', updateValidListener);
    el.addEventListener('keydown', updateValidListener);
    f.observer.disconnect();
    if (el.required) {
      el.parentNode.parentNode.classList.add('required');
    } else {
      el.parentNode.parentNode.classList.remove('required');
    }
    f.observer.observe(f, { attributes: true, childList: true, subtree: true });
  });
};

/**
 *
 * @param {string} seletor
 * @param {Function} validacao
 * @param {?Function} ini
 */
const adicionaValidacao = (seletor, validacao, ini = null) => {
  validacoes.set(seletor, { sel: seletor, val: validacao, ini: ini });
};

/**
 *
 * @param {Element} f
 */
const reportaInvalidos = f => {
  let erro = false;
  for (let [sel, v] of validacoes.entries()) {
    [...f.querySelectorAll(sel)].forEach(el => {
      let validade = v.val(el);
      if (validade == undefined) validade = '';
      el.setCustomValidity(validade);
    });
  }
  f.querySelectorAll(':invalid').forEach(el => {
    erro = true;
    updateValid(el);
  });
  return erro;
};

/**
 *
 * @param {HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement}  el
 * @param {string} msg
 */
const setValidade = (el, msg = '') => {
  if (!msg) msg = '';
  el.setCustomValidity(msg);
  updateValid(el);
  if (msg == '') {
    el.classList.remove('invalid');
  }
};

/**
 *
 * @param {HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} el
 */
const valido = el => {
  return el.checkValidity();
};

/**
 *
 * @param {HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} el
 * @param {string} msg
 */
const setMensagem = (el, msg = '') => {
  const ctnMsg = el.parentNode.parentNode.querySelector('.mensagem');
  if (!ctnMsg) return;
  ctnMsg.textContent = msg;
};

/**
 *
 * @param {HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} el
 */
const oculta = el => {
  el.parentNode.parentNode.classList.add('oculto');
};

/**
 *
 * @param {HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} el
 */
const mostra = el => {
  el.parentNode.parentNode.classList.remove('oculto');
};

/**
 *
 * @param {Element} f
 * @param {string} url
 */
const post = async (f, url) => {
  const fd = new FormData(f);
  const res = await fetch(url, {
    method: 'POST',
    body: fd,
  });
  const r = await res.json();
  if (r.erro) throw r.mensagem;
  return r;
};

/**
 *
 * @param {Element} f
 * @param {string} url
 * @param {boolean|null} text
 */
const get = async (f, url, text = false) => {
  const fd = new FormData(f);
  const qs = new URLSearchParams(fd);
  const res = await fetch(`${url}?${qs.toString()}`);
  if (!text) {
    const r = await res.json();
    if (r.erro) throw new Error(r.mensagem);
    return r;
  }
  return await res.text();
};

const autoHeight = e => {
  let cur = e.currentTarget || e;
  cur.style.height = 'auto';
  cur.style.height = `${cur.scrollHeight + 8}px`;
};

export {
  registra,
  adicionaValidacao,
  reportaInvalidos,
  setValidade,
  valido,
  setMensagem,
  post,
  get,
  mostra,
  oculta,
  autoHeight,
};