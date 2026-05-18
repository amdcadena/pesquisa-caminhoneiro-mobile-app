export const SURVEY_CONFIG = {
  id: "pesquisa-caminhoneiro",

  title: "Pesquisa do Caminhoneiro",
  subtitle:
    "Coleta estruturada para avaliar o interesse no aplicativo, mapear perfil do entrevistado e consolidar informações úteis para análise comercial e de produto.",

  home: {
    topBadge: "PESQUISA + RELACIONAMENTO + APP",
    headline: "Uma forma mais inteligente de abrir conversa com o caminhoneiro",
    description:
      "A pesquisa transforma a abordagem comercial em uma conversa útil, consultiva e menos invasiva. Em vez de começar vendendo, começamos ouvindo, entendendo a rotina do cliente e preparando o terreno para a próxima fase com o aplicativo.",

    strategyTitle: "Como essa estratégia funciona",
    strategySubtitle:
      "A pesquisa abre relacionamento, organiza dados e cria uma ponte para o aplicativo.",

    cards: [
      {
        title: "Abordagem mais leve",
        text: "A entrada acontece por uma pesquisa útil, e não por uma oferta direta.",
      },
      {
        title: "Dados para a fase 2",
        text: "Cada resposta ajuda a identificar interesse, perfil, dor e potencial de relacionamento futuro.",
      },
      {
        title: "Valor antes da venda",
        text: "O aplicativo entra como solução para manutenção, controle e prevenção em um dos maiores custos do caminhoneiro: o pneu.",
      },
    ],

    steps: [
      {
        number: "01",
        title: "Apresentar",
        text: "Mostrar a força da Magnum de forma curta, clara e profissional.",
      },
      {
        number: "02",
        title: "Diagnosticar",
        text: "Entender se já conhece a marca, se já compra e qual o momento atual.",
      },
      {
        number: "03",
        title: "Pesquisar",
        text: "Aplicar o formulário e captar dados importantes para evolução da jornada.",
      },
      {
        number: "04",
        title: "Continuar",
        text: "Avançar para a fase 2 com mais contexto, mais permissão e mais chance de conexão.",
      },
    ],

    summaryTitle: "Resumo rápido",
    summarySubtitle: "Indicadores da base do usuário logado.",
  },

  identify: {
    title: "Nova pesquisa",
    subtitle: "Preencha os dados abaixo antes de iniciar a entrevista.",
    introTitle: "Antes de começar",
    introText:
      "Esta etapa organiza a entrevista e garante que os dados fiquem corretamente vinculados ao entrevistador e ao perfil do caminhoneiro.",

    interviewerBadge: "QUEM APLICA",
    interviewerTitle: "Dados do entrevistador",
    interviewerText: "Identifique quem está realizando a pesquisa.",
    interviewerNameLabel: "Nome do entrevistador *",
    interviewerNamePlaceholder: "Digite o nome de quem está aplicando",

    respondentBadge: "QUEM RESPONDE",
    respondentTitle: "Dados do entrevistado",
    respondentText:
      "Registre as informações principais para dar contexto à entrevista.",

    respondentNameLabel: "Nome do entrevistado *",
    respondentNamePlaceholder: "Digite o nome do caminhoneiro",

    phoneLabel: "Celular",
    phonePlaceholder: "(11) 99999-9999",

    emailLabel: "E-mail",
    emailPlaceholder: "nome@exemplo.com",

    truckTypeLabel: "Tipo de caminhão",
    tireSizeLabel: "Medida do pneu",
    tireSizePlaceholder: "Ex.: 295/80R22.5",

    tireApplicationLabel: "Aplicação do pneu *",

    supplierLabel: "Principal fornecedor hoje",
    supplierPlaceholder: "Ex.: marca ou fornecedor atual",

    footerText: "Campos com * são essenciais para iniciar a pesquisa.",
    backButton: "Voltar",
    startButton: "Iniciar pesquisa",
  },

  survey: {
    subtitle: "Escolha a opção que melhor representa a percepção do entrevistado.",
    progressLabel: "Etapa atual da entrevista",
    currentQuestionBadge: "PERGUNTA ATUAL",
    footerText: "Selecione uma opção para continuar.",
    previousButton: "Anterior",
    nextButton: "Próxima",
  },

  suggestion: {
    title: "Sugestão final",
    subtitle:
      "Registre aqui qualquer observação, melhoria ou funcionalidade sugerida.",
    backButton: "Voltar",
    finishButton: "Finalizar pesquisa",
  },

  reports: {
    accessTitle: "Acesso ao dashboard",
    accessSubtitle: "Área protegida por senha para leitura dos seus resultados.",
    passwordLabel: "Senha de acesso",
    accessButton: "Entrar",

    dashboardTitle: "Dashboard da pesquisa",
    dashboardSubtitle:
      "Relatórios visuais filtrados apenas para o usuário logado.",

    filtersTitle: "Filtros",
    filtersSubtitle:
      "Refine a visualização por modo, entrevistador, aplicação ou lead.",

    indicatorsTitle: "Indicadores",
    indicatorsSubtitle:
      "Leitura rápida dos principais números da sua base filtrada.",

    tableTitleGeneral: "Leads entrevistados",
    tableTitleUser: "Minhas entrevistas",
    tableSubtitle:
      "Tabela consolidada das entrevistas do usuário logado.",

    summaryTitle: "Resumo por pergunta",
    summarySubtitle: "Consolidação das respostas das suas entrevistas.",

    suggestionsTitle: "Sugestões captadas",
    suggestionsSubtitle:
      "Lista das observações abertas registradas nas suas entrevistas.",

    emptySuggestions:
      "Ainda não há sugestões registradas com os filtros atuais.",

    backButton: "Voltar",
    exportDetailedButton: "Exportar detalhado",
    exportSummaryButton: "Exportar resumo",
    exportSuggestionsButton: "Exportar sugestões",
  },

  auth: {
    loginTitle: "Entrar no sistema",
    loginSubtitle:
      "Use seu e-mail e senha de entrevistador para acessar a pesquisa.",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    loginButton: "Entrar",
    loadingText: "Carregando acesso...",
    loggedAsPrefix: "Logado como:",
  },

  buttons: {
    newSurvey: "Nova pesquisa",
    reports: "Dashboard e relatórios",
    logout: "Sair",
  },

  metrics: {
    surveys: "Pesquisas",
    interviewers: "Entrevistadores",
    applications: "Aplicações",
    filteredSurveys: "Pesquisas filtradas",
    average: "Média geral",
    activeInterviewers: "Entrevistadores ativos",
    topApplication: "Aplicação mais frequente",
  },

  options: ["Excelente", "Bom", "Razoável", "Pouco útil", "Inútil"],

  questions: [
    "Seria útil ter um aplicativo voltado à manutenção de pneus?",
    "O que você acha da possibilidade de acompanhar a pressão dos pneus pelo aplicativo?",
    "O que você acha de ter o controle do desgaste dos pneus dentro do aplicativo?",
    "O quanto seria útil receber alertas relacionados à manutenção preventiva?",
    "O que você acha de contar com uma lista rápida de checagem dos pneus antes das viagens?",
    "O quanto seria útil registrar no aplicativo as trocas e os rodízios dos pneus?",
    "Como você vê a possibilidade de receber uma versão do aplicativo para testes e uso, sem custos?",
    "O quanto seria útil contar com o apoio de um profissional para orientar e tirar dúvidas sobre pneus?",
    "O quanto você considera importante o uso das redes sociais para orientar caminhoneiros com vídeos e dicas sobre pneus?",
  ],
};