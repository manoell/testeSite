const ctn = document.querySelector('#alerta');
const ctnMsg = document.querySelector('#alerta .msg');
const ctnAct = document.querySelector('#alerta .act');
let timer;

const abre = (msg, seg = 3600, ...acoes) => {
    clearTimeout(timer);
    if (!seg) seg = 3600;
    ctnMsg.textContent = msg;
    ctnAct.innerHTML = '';
    acoes.forEach(act => {
        if (typeof act == 'string') {
            const a = document.createElement('a');
            a.textContent = act;
            a.addEventListener('click', fecha);
            ctnAct.appendChild(a);
            return;
        }
        if (!Array.isArray(act)) throw 'alerta: ação inválida';
        const a = document.createElement('a');
        a.textContent = act[0];
        if (typeof act[1] == 'string') {
            a.href = act[1];
            if (act[2]) {
                a.target = '_blank';
            }
            a.addEventListener('click', fecha);
            ctnAct.appendChild(a);
            return;
        }
        a.addEventListener('click', () => {
            fecha();
            act[1]();
        });
        ctnAct.appendChild(a);
    });
    ctnAct.style.display = ctnAct.childNodes.length ? 'flex' : 'none';
    ctn.style.bottom = -(ctn.offsetHeight) + 'px';
    setTimeout(() => {
        //ctn.style.bottom = '5vh';
        ctn.classList.add('aberto');
        timer = setTimeout(fecha, 1000 * seg);
    }, 0);
};

const abreOK = (msg, seg = 3600) => {
    abre(msg, seg, 'OK');
};



const fecha = () => {
    clearTimeout(timer);
    setTimeout(() => {
        ctn.style.bottom = -(ctn.offsetHeight) + 'px';
        ctn.classList.remove('aberto');
    }, 0);
};

export {
    abre,
    fecha,
    abreOK
};