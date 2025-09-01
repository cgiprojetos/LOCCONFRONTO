import { com_AE, COM_OBITO, SEM_AE, refem, vitimizacao, danos_colaterais} from './dados.js';

export function initializeChatbot(todosOsDados) {
    
    // Pega os elementos do HTML
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatLog = document.getElementById('chat-log');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // Variável para controlar o estado da conversa
    let chatState = 'IDLE'; // Estados: IDLE, MENU_PRINCIPAL, SUBMENU_OBITO, AGUARDANDO_CIDADE, etc.
    let tempAisp1 = null; // Variável temporária para comparações

    // Funções de controle do chat
    openChatBtn.addEventListener('click', () => {
        chatContainer.style.display = 'flex';
        if (chatState === 'IDLE') {
            iniciarConversa();
        }
    });
    closeChatBtn.addEventListener('click', () => chatContainer.style.display = 'none');

    // --- FUNÇÕES DE INTERFACE DO CHAT ---

    function adicionarMensagem(texto, tipo) {
        const div = document.createElement('div');
        div.className = tipo;
        div.innerHTML = texto.replace(/\n/g, '<br>');
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // --- FLUXO DE CONVERSA DO CHATBOT ---

    // 1. Início da Conversa
    function iniciarConversa() {
        adicionarMensagem("Olá! Sou o assistente de dados. Para começar, digite 'menu'.", 'bot-message');
        chatState = 'AGUARDANDO_INICIO';
    }

    // 2. Menu Principal
    function mostrarMenuPrincipal() {
        const menuTexto = `Por favor, digite o número da categoria que você deseja consultar:
1. Ocorrências COM Agente Envolvido
2. Ocorrências SEM Agente Envolvido
3. Ocorrências com ÓBITO
4. Outras Consultas (Refém, etc.)`;
        adicionarMensagem(menuTexto, 'bot-message');
        chatState = 'MENU_PRINCIPAL';
    }

    // 3. Submenus com Perguntas Específicas
    function mostrarSubMenuComObito() {
        const menuTexto = `Você selecionou 'Ocorrências com ÓBITO'. Digite o número da sua pergunta:
1. Contar óbitos por cidade
2. Comparar óbitos entre duas AISPs
3. Voltar ao menu principal`;
        adicionarMensagem(menuTexto, 'bot-message');
        chatState = 'SUBMENU_OBITO';
    }

    // --- CÉREBRO DO BOT: Processa a entrada do usuário com base no estado ---
    function processarInput(texto) {
        const input = texto.trim();

        switch (chatState) {
            case 'AGUARDANDO_INICIO':
                if (input.toLowerCase() === 'menu') {
                    mostrarMenuPrincipal();
                } else {
                    adicionarMensagem("Por favor, digite 'menu' para ver as opções.", 'bot-message');
                }
                break;

            case 'MENU_PRINCIPAL':
                if (input === '1') {
                    // Resposta direta para "Com Agente"
                    adicionarMensagem(`Existem ${com_AE.length} ocorrências com envolvimento/lesão de agentes.`, 'bot-message');
                    setTimeout(mostrarMenuPrincipal, 1000);
                } else if (input === '2') {
                    // Resposta direta para "Sem Agente"
                    adicionarMensagem(`Existem ${SEM_AE.length} ocorrências sem envolvimento/lesão de agentes.`, 'bot-message');
                    setTimeout(mostrarMenuPrincipal, 1000);
                } else if (input === '3') {
                    mostrarSubMenuComObito();
                } else if (input === '4') {
                    adicionarMensagem("As consultas sobre reféns, prioridades e danos colaterais ainda não estão disponíveis.", 'bot-message');
                    setTimeout(mostrarMenuPrincipal, 1000);
                } else {
                    adicionarMensagem("Opção inválida. Por favor, digite um número de 1 a 4.", 'bot-message');
                }
                break;

            case 'SUBMENU_OBITO':
                if (input === '1') {
                    adicionarMensagem("Por favor, digite o nome da cidade:", 'bot-message');
                    chatState = 'AGUARDANDO_CIDADE_OBITO';
                } else if (input === '2') {
                    adicionarMensagem("Digite a primeira AISP (ex: AISP 05):", 'bot-message');
                    chatState = 'AGUARDANDO_AISP1_COMPARA';
                } else if (input === '3') {
                    mostrarMenuPrincipal();
                } else {
                    adicionarMensagem("Opção inválida. Por favor, digite 1, 2 ou 3.", 'bot-message');
                }
                break;

            case 'AGUARDANDO_CIDADE_OBITO':
                const cidade = input;
                const ocorrencias = COM_OBITO.filter(item => item.localizacao.toLowerCase().includes(cidade.toLowerCase()));
                adicionarMensagem(`Encontrei ${ocorrencias.length} ocorrência(s) com óbito em ${cidade}.`, 'bot-message');
                setTimeout(mostrarMenuPrincipal, 1000);
                break;

            case 'AGUARDANDO_AISP1_COMPARA':
                tempAisp1 = input.toUpperCase();
                adicionarMensagem(`Ok, a primeira é ${tempAisp1}. Agora digite a segunda AISP (ex: AISP 11):`, 'bot-message');
                chatState = 'AGUARDANDO_AISP2_COMPARA';
                break;
            
            case 'AGUARDANDO_AISP2_COMPARA':
                const aisp2_nome = input.toUpperCase();
                const aisp1_nome = tempAisp1;
                
                const aisp1_obitos = COM_OBITO.filter(d => d.aisp.toUpperCase().includes(aisp1_nome)).length;
                const aisp2_obitos = COM_OBITO.filter(d => d.aisp.toUpperCase().includes(aisp2_nome)).length;

                const resposta = `Comparativo de Óbitos:
                - ${aisp1_nome}: ${aisp1_obitos}
                - ${aisp2_nome}: ${aisp2_nome}`;
                
                adicionarMensagem(resposta, 'bot-message');
                tempAisp1 = null; // Limpa a variável temporária
                setTimeout(mostrarMenuPrincipal, 1000);
                break;
        }
    }

    // Função para lidar com o envio da pergunta
    function handleUserInput() {
        const pergunta = chatInput.value;
        if (pergunta.trim() === "") return;

        adicionarMensagem(pergunta, 'user-message');
        chatInput.value = "";

        // Processa a entrada do usuário
        processarInput(pergunta);
    }

    // Eventos para enviar a pergunta
    chatSendBtn.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleUserInput();
        }
    });
}