import { com_AE, COM_OBITO, SEM_AE, refem, vitimizacao, danos_colaterais } from './dados.js';

document.addEventListener('DOMContentLoaded', () => {

    const todosOsDados = [...com_AE, ...COM_OBITO, ...SEM_AE];

    document.getElementById('total-ocorrencias').textContent = todosOsDados.length;
    document.getElementById('total-com-obito').textContent = COM_OBITO.length;
    document.getElementById('total-com-ae').textContent = com_AE.length;
    document.getElementById('total-sem-ae').textContent = SEM_AE.length;

    const tabelaCorpo = document.getElementById('tabela-corpo');
    todosOsDados.forEach(ocorrencia => {
        const linha = document.createElement('tr');

        const dataFormatada = ocorrencia.data ? new Date(ocorrencia.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
        
        linha.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${ocorrencia.localizacao || 'N/A'}</td>
            <td>${ocorrencia.bairro || 'N/A'}</td>
            <td>${ocorrencia.aisp || 'N/A'}</td>
            <td>${ocorrencia.tipo || 'N/A'}</td>
            <td>${ocorrencia.descricao || 'N/A'}</td>
        `;
        tabelaCorpo.appendChild(linha);
    });

    const buscaInput = document.getElementById('tabela-busca');
    buscaInput.addEventListener('input', () => {
        const termoBusca = buscaInput.value.toLowerCase();
        const linhas = tabelaCorpo.getElementsByTagName('tr');

        Array.from(linhas).forEach(linha => {
            const textoLinha = linha.textContent.toLowerCase();
            if (textoLinha.includes(termoBusca)) {
                linha.style.display = ""; // Mostra a linha
            } else {
                linha.style.display = "none"; // Esconde a linha
            }
        });
    });
    
    const printButton = document.getElementById('print-btn');
    printButton.addEventListener('click', () => {
        window.print();
    });
});