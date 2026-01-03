// Máscara de telefone para WhatsApp
function aplicarMascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    
    input.value = valor;
}

// Validação de e-mail
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validação de telefone
function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
}

// Limpar mensagens de erro
function limparErros() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
    });
    
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
    });
}

// Mostrar erro em campo específico
function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    const errorSpan = document.getElementById(campoId + '-error');
    
    if (campo) {
        campo.classList.add('error');
        campo.setAttribute('aria-invalid', 'true');
    }
    
    if (errorSpan) {
        errorSpan.textContent = mensagem;
    }
}

// Validação do formulário
function validarFormulario(nome, email, whatsapp) {
    let valido = true;
    limparErros();
    
    // Validação do nome
    if (!nome || nome.trim().length < 3) {
        mostrarErro('nome', 'Por favor, informe seu nome completo');
        valido = false;
    }
    
    // Validação do e-mail
    if (!email || !validarEmail(email)) {
        mostrarErro('email', 'Por favor, informe um e-mail válido');
        valido = false;
    }
    
    // Validação do WhatsApp
    if (!whatsapp || !validarTelefone(whatsapp)) {
        mostrarErro('whatsapp', 'Por favor, informe um WhatsApp válido');
        valido = false;
    }
    
    return valido;
}

// URL do Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0PvL9-ru5JpML2COsQTbd4NV0NM1oyEs5UbMQhYejqgTJzmilv514ohch7YYNLp4vNg/exec';

// Enviar formulário para Google Apps Script
function enviarFormulario(dados) {
    // Criar URLSearchParams para enviar os dados no formato que o Google Apps Script espera
    const params = new URLSearchParams();
    params.append('nome', dados.nome);
    params.append('email', dados.email);
    params.append('whatsapp', dados.whatsapp);
    params.append('timestamp', dados.timestamp);
    
    // Enviar para o Google Apps Script usando POST
    return fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necessário para evitar problemas de CORS com Google Apps Script
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
    .then(() => {
        // Com no-cors, não temos acesso à resposta, mas assumimos sucesso se não houver erro
        console.log('Dados enviados com sucesso para Google Sheets:', dados);
        return {
            success: true,
            message: 'Cadastro realizado com sucesso!'
        };
    })
    .catch(error => {
        console.error('Erro ao enviar formulário:', error);
        throw new Error('Não foi possível enviar os dados. Por favor, tente novamente.');
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Máscara de telefone
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function() {
            aplicarMascaraTelefone(this);
        });
        
        whatsappInput.addEventListener('blur', function() {
            if (this.value && !validarTelefone(this.value)) {
                mostrarErro('whatsapp', 'Por favor, informe um WhatsApp válido');
            }
        });
    }
    
    // Validação em tempo real do e-mail
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validarEmail(this.value)) {
                mostrarErro('email', 'Por favor, informe um e-mail válido');
            } else {
                limparErros();
            }
        });
    }
    
    // Validação em tempo real do nome
    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.addEventListener('blur', function() {
            if (this.value && this.value.trim().length < 3) {
                mostrarErro('nome', 'Por favor, informe seu nome completo');
            } else {
                limparErros();
            }
        });
    }
    
    // Submit do formulário
    const form = document.getElementById('capture-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            
            if (validarFormulario(nome, email, whatsapp)) {
                const submitBtn = form.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                
                // Desabilitar botão e mostrar loading
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
                
                try {
                    const dados = {
                        nome: nome,
                        email: email,
                        whatsapp: whatsapp,
                        timestamp: new Date().toISOString()
                    };
                    
                    await enviarFormulario(dados);
                    
                    // Sucesso
                    submitBtn.textContent = '✓ Cadastro realizado!';
                    submitBtn.style.backgroundColor = 'var(--sucesso)';
                    
                    // Limpar formulário após 2 segundos
                    setTimeout(() => {
                        form.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                        limparErros();
                    }, 2000);
                    
                } catch (error) {
                    console.error('Erro ao enviar formulário:', error);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    alert('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
                }
            }
        });
    }
    
    // Scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#privacidade') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Offset para header fixo se houver
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Lazy loading do vídeo (carregar apenas quando visível)
    const video = document.getElementById('main-video');
    if (video && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Vídeo já está carregado via src, mas podemos adicionar lógica aqui se necessário
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        observer.observe(video);
    }
});

