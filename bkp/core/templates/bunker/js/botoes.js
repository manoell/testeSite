import * as menu from './menu.js';

const abreDropdown = ev => {
  ev.stopPropagation();
  fechaDropdowns();
  menu.fecha(ev);
  const b = ev.currentTarget;
  const d = b.parentNode.querySelector('div');
  const rect = b.getBoundingClientRect();
  const y = (rect.top + rect.bottom) / 2;
  const x = (rect.left + rect.right) / 2;
  if (y < window.innerHeight / 2) {
    d.style.top = '0';
    d.style.bottom = 'auto';
  } else {
    d.style.top = 'auto';
    d.style.bottom = '0';
  }
  if (x < window.innerWidth / 2) {
    d.style.left = '0';
    d.style.right = 'auto';
  } else {
    d.style.left = 'auto';
    d.style.right = '0';
  }
  d.classList.add('aberto');
};

const fechaDropdown = ev => {
  ev.stopPropagation();
  const b = ev.currentTarget;
  setTimeout(() => {
    b.parentNode.classList.remove('aberto');
  }, 100);
};

const fechaDropdowns = () => {
  document.querySelectorAll('.buttons > div.aberto').forEach(dd => dd.classList.remove('aberto'));
};

const registraDropdowns = () => {
  document.querySelectorAll('.buttons > button, .buttons > a.button').forEach(b => {
    b.addEventListener('click', abreDropdown);
  });

  document.querySelectorAll('.buttons > div > button, .buttons > div > a.button').forEach(b => {
    b.addEventListener('click', fechaDropdown);
  });
};

document.body.addEventListener('click', fechaDropdowns);

const observer = new MutationObserver(() => {
  registraDropdowns();
  const botoesDocados = document.querySelector('button.novo,button.next,a.button.novo,a.button.next');
  observer.disconnect();
  if (botoesDocados) {
    document.body.classList.add('botoes-docados');
  } else {
    document.body.classList.remove('botoes-docados');
  }
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
});
observer.observe(document.body, { attributes: true, childList: true, subtree: true });

registraDropdowns();

if (document.querySelector('button.novo, a.button.novo, button.next, a.button.next')) {
  document.getElementById('regiao-botoes').classList.remove('oculta');
}

export { fechaDropdowns };