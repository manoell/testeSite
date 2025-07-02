/**
 *
 * @param {string} id
 */

let numAbertos = 0
let inPopstate = false
const desktop = window.matchMedia('(min-width: 1024px)').matches

const abre = id => {
  const m = document.getElementById(id)
  escModal(m)
  const aFechar = m.querySelector('a.fechar')
  if (aFechar) {
    aFechar.addEventListener('click', fecha)
  }
  m.classList.add('aberto')
  m.addEventListener('click', modalClick)
  const s = document.querySelector(`#${id} > section`)
  if (s) {
    s.addEventListener('click', sectionClick)
  }
  document.body.classList.add('modal-aberto')
  numAbertos++
  if (inPopstate || desktop) return
  const pars = new URLSearchParams(window.location.hash.substr(1))
  pars.set('mc', numAbertos.toString())
  if (desktop) return
  window.history.pushState(null, null, '#' + pars)
}

const modalClick = ev => {
  const m = ev.currentTarget
  fecha()
}

const sectionClick = ev => {
  ev.stopPropagation()
}

const fecha = () => {
  if (numAbertos == 0) {
    escModal(null)
    return
  }
  const abertos = [...document.querySelectorAll('.modal.aberto')]
  const ultimo = abertos.pop()
  ultimo.classList.remove('aberto')
  numAbertos--
  if (numAbertos == 0) {
    escModal(null)
    document.body.classList.remove('modal-aberto')
  }
  escModal(abertos.pop())
  if (inPopstate || desktop) return
  window.history.back()
}

const teclaEsc = ev => {
  if (ev.key == 'Escape') {
    fecha()
  }
}

const escModal = m => {
  if (!m || !m.dataset.hasOwnProperty('esc')) {
    document.body.removeEventListener('keydown', teclaEsc)
  } else {
    document.body.addEventListener('keydown', teclaEsc)
  }
}

window.addEventListener('popstate', ev => {
  if (desktop) return
  inPopstate = true
  const pars = new URLSearchParams(window.location.hash.substr(1))
  const mc = parseFloat(pars.get('mc'))
  if (isNaN(mc) || mc < numAbertos) fecha()
  inPopstate = false
})

export { abre, fecha }