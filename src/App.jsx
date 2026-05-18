import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { SURVEY_CONFIG } from "./surveyConfig";

const SCORE_MAP = {
  Excelente: 5,
  Bom: 4,
  "Razoável": 3,
  "Pouco útil": 2,
  "Inútil": 1,
};

const TIRE_APPLICATIONS = [
  "MA - Misto All Position",
  "UA - Urbano All Position",
  "RA - Regional All Position",
  "GT - Regional Tração",
  "OT - OTR",
  "GD - Regional Direcional",
  "MD - Misto Direcional",
  "MT - Misto Tração",
  "RL - Rodoviário Eixo Livre",
  "RT - Rodoviário Tração",
  "RD - Rodoviário Direcional",
];

const TRUCK_TYPES = [
  "Toco",
  "Truck",
  "Bitruck",
  "Cavalo mecânico",
  "Carreta",
  "Bitrem",
  "Rodotrem",
  "Vanderleia",
  "Outro",
];

const STORAGE_KEY = "pesquisa-caminhoneiro-web";
const REPORT_PASSWORD = "magnum123";

const emptyInterviewer = {
  nome: "",
};

const emptyRespondent = {
  nome: "",
  email: "",
  celular: "",
  tipoCaminhao: "",
  tipoPneu: "",
  aplicacaoPneu: "",
  fornecedorPrincipal: "",
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function Card({ children, title, subtitle, right }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #18181b 0%, #121214 100%)",
        border: "1px solid #27272a",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
      }}
    >
      {(title || subtitle || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            {title && (
              <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.2 }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  margin: "6px 0 0 0",
                  color: "#a1a1aa",
                  lineHeight: 1.5,
                  fontSize: 14,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function MetricCard({ title, value, subtitle = "" }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #09090b 0%, #111113 100%)",
        border: "1px solid #27272a",
        borderRadius: 20,
        padding: 18,
        minHeight: 110,
      }}
    >
      <div style={{ color: "#a1a1aa", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div>
      {subtitle ? (
        <div style={{ color: "#d4d4d8", fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function PrimaryButton({ children, onClick, full = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
        color: "white",
        border: "none",
        borderRadius: 16,
        padding: "14px 18px",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        width: full ? "100%" : "auto",
        boxShadow: "0 10px 20px rgba(220,38,38,0.25)",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#18181b" : "#0b0b0d",
        color: disabled ? "#666" : "#fafafa",
        border: "1px solid #3f3f46",
        borderRadius: 16,
        padding: "14px 18px",
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          color: "#d4d4d8",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%",
          height: 50,
          borderRadius: 16,
          border: "1px solid #3f3f46",
          background: "#09090b",
          color: "white",
          padding: "0 14px",
          fontSize: 15,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          color: "#d4d4d8",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          height: 50,
          borderRadius: 16,
          border: "1px solid #3f3f46",
          background: "#09090b",
          color: "white",
          padding: "0 14px",
          fontSize: 15,
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option} style={{ color: "white", background: "#09090b" }}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionBadge({ children }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.24)",
        color: "#fca5a5",
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function SimpleTable({ rows, hideInterviewer = false }) {
  if (!rows.length) {
    return (
      <div
        style={{
          background: "#09090b",
          border: "1px dashed #3f3f46",
          borderRadius: 18,
          padding: 20,
          color: "#a1a1aa",
        }}
      >
        Nenhuma pesquisa encontrada com os filtros aplicados.
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #27272a",
        borderRadius: 18,
        background: "#09090b",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ color: "#a1a1aa", textAlign: "left", borderBottom: "1px solid #27272a" }}>
            <th style={{ padding: "14px 12px" }}>Data</th>
            <th style={{ padding: "14px 12px" }}>Entrevistado</th>
            <th style={{ padding: "14px 12px" }}>Celular</th>
            <th style={{ padding: "14px 12px" }}>E-mail</th>
            <th style={{ padding: "14px 12px" }}>Medida</th>
            <th style={{ padding: "14px 12px" }}>Aplicação</th>
            <th style={{ padding: "14px 12px" }}>Tipo de caminhão</th>
            {!hideInterviewer && <th style={{ padding: "14px 12px" }}>Entrevistador</th>}
            <th style={{ padding: "14px 12px" }}>Média</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((record) => (
            <tr key={record.id} style={{ borderBottom: "1px solid #18181b" }}>
              <td style={{ padding: "14px 12px" }}>{record.createdAt}</td>
              <td style={{ padding: "14px 12px", fontWeight: 600 }}>{record.respondent.nome}</td>
              <td style={{ padding: "14px 12px" }}>{record.respondent.celular || "-"}</td>
              <td style={{ padding: "14px 12px" }}>{record.respondent.email || "-"}</td>
              <td style={{ padding: "14px 12px" }}>{record.respondent.tipoPneu || "-"}</td>
              <td style={{ padding: "14px 12px" }}>{record.respondent.aplicacaoPneu || "-"}</td>
              <td style={{ padding: "14px 12px" }}>{record.respondent.tipoCaminhao || "-"}</td>
              {!hideInterviewer && (
                <td style={{ padding: "14px 12px" }}>{record.interviewer?.nome || "Oculto"}</td>
              )}
              <td style={{ padding: "14px 12px", fontWeight: 700 }}>{record.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [interviewer, setInterviewer] = useState(emptyInterviewer);
  const [respondent, setRespondent] = useState(emptyRespondent);
  const [answers, setAnswers] = useState(Array(SURVEY_CONFIG.questions.length).fill(""));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [records, setRecords] = useState([]);
  const [reportPasswordInput, setReportPasswordInput] = useState("");
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [reportMode, setReportMode] = useState("geral");
  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [selectedApplication, setSelectedApplication] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [authUser, setAuthUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const QUESTIONS = SURVEY_CONFIG.questions;
  const OPTIONS = SURVEY_CONFIG.options;

  useEffect(() => {
    async function loadRecords() {
      try {
        const { data, error } = await supabase
          .from("pesquisas_caminhoneiro")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao carregar do Supabase:", error.message);
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try {
              setRecords(JSON.parse(saved));
            } catch {
              setRecords([]);
            }
          }
          return;
        }

        const formatted = (data || []).map((item) => ({
          id: item.id,
          interviewer: {
            nome: item.entrevistador_nome || "",
          },
          respondent: {
            nome: item.entrevistado_nome || "",
            email: item.entrevistado_email || "",
            celular: item.entrevistado_celular || "",
            tipoCaminhao: item.tipo_caminhao || "",
            tipoPneu: item.medida_pneu || "",
            aplicacaoPneu: item.aplicacao_pneu || "",
            fornecedorPrincipal: item.fornecedor_principal || "",
          },
          answers: item.respostas || [],
          suggestion: item.sugestao || "",
          average: item.media_geral ? Number(item.media_geral).toFixed(2) : "0.00",
          createdAt: item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "",
          authUserId: item.auth_user_id || null,
        }));

        setRecords(formatted);
      } catch (err) {
        console.error("Falha ao carregar registros:", err);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setRecords(JSON.parse(saved));
          } catch {
            setRecords([]);
          }
        }
      }
    }

    loadRecords();
  }, []);

  useEffect(() => {
    let mounted = true;

    const timeout = setTimeout(() => {
      if (mounted) setAuthLoading(false);
    }, 3000);

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erro ao carregar sessão:", error.message);
        }
        if (mounted) {
          setAuthUser(data?.session?.user ?? null);
          setAuthLoading(false);
        }
      } catch (err) {
        console.error("Falha ao carregar sessão:", err);
        if (mounted) setAuthLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert("Erro no login: " + error.message);
      return;
    }

    setScreen("home");
    alert("Login realizado com sucesso.");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Erro ao sair: " + error.message);
      return;
    }

    setAuthUser(null);
    setScreen("home");
    setReportUnlocked(false);
    setReportPasswordInput("");
    setSelectedInterviewer("");
    setSelectedApplication("");
    setSearchTerm("");
  }

  const visibleRecords = useMemo(() => {
    if (!authUser) return [];
    return records.filter((record) => record.authUserId === authUser.id);
  }, [records, authUser]);

  const progress = ((questionIndex + 1) / QUESTIONS.length) * 100;

  const interviewerGroups = useMemo(
    () => Array.from(new Set(visibleRecords.map((r) => r.interviewer?.nome || "Não informado"))).sort(),
    [visibleRecords]
  );

  const filteredRecords = useMemo(() => {
    return visibleRecords.filter((record) => {
      const matchesApplication = selectedApplication
        ? record.respondent.aplicacaoPneu === selectedApplication
        : true;

      const matchesSearch = searchTerm
        ? [
            record.respondent.nome,
            record.respondent.celular,
            record.respondent.email,
            record.respondent.tipoPneu,
            record.respondent.aplicacaoPneu,
            record.respondent.tipoCaminhao,
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      if (reportMode === "entrevistador") {
        const matchesInterviewer = selectedInterviewer
          ? (record.interviewer?.nome || "Não informado") === selectedInterviewer
          : true;
        return matchesApplication && matchesSearch && matchesInterviewer;
      }

      return matchesApplication && matchesSearch;
    });
  }, [visibleRecords, selectedApplication, selectedInterviewer, searchTerm, reportMode]);

  const dashboardSummary = useMemo(() => {
    const total = filteredRecords.length;
    const avg = total
      ? (
          filteredRecords.reduce((sum, record) => sum + Number(record.average || 0), 0) / total
        ).toFixed(2)
      : "0.00";

    const byApplication = {};
    filteredRecords.forEach((record) => {
      const key = record.respondent.aplicacaoPneu || "Não informado";
      byApplication[key] = (byApplication[key] || 0) + 1;
    });

    const topApplication = Object.entries(byApplication).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      avg,
      interviewers: new Set(filteredRecords.map((r) => r.interviewer?.nome || "Não informado")).size,
      topApplication: topApplication ? `${topApplication[0]} (${topApplication[1]})` : "-",
    };
  }, [filteredRecords]);

  const summary = useMemo(() => {
    return QUESTIONS.map((question, index) => {
      const selectedAnswers = filteredRecords.map((r) => r.answers[index]).filter(Boolean);
      const scores = selectedAnswers.map((a) => SCORE_MAP[a] || 0);
      const average = scores.length
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : "0.00";

      return {
        question,
        total: selectedAnswers.length,
        average,
        excelente: selectedAnswers.filter((a) => a === "Excelente").length,
        bom: selectedAnswers.filter((a) => a === "Bom").length,
        razoavel: selectedAnswers.filter((a) => a === "Razoável").length,
        poucoUtil: selectedAnswers.filter((a) => a === "Pouco útil").length,
        inutil: selectedAnswers.filter((a) => a === "Inútil").length,
      };
    });
  }, [filteredRecords, QUESTIONS]);

  function resetSurvey() {
    setInterviewer(emptyInterviewer);
    setRespondent(emptyRespondent);
    setAnswers(Array(SURVEY_CONFIG.questions.length).fill(""));
    setQuestionIndex(0);
    setSuggestion("");
  }

  function startSurvey() {
    if (!interviewer.nome.trim()) {
      alert("Preencha o nome do entrevistador.");
      return;
    }
    if (!respondent.nome.trim()) {
      alert("Preencha o nome do entrevistado.");
      return;
    }
    if (!respondent.aplicacaoPneu.trim()) {
      alert("Selecione a aplicação do pneu.");
      return;
    }
    setScreen("survey");
  }

  function nextQuestion() {
    if (!answers[questionIndex]) {
      alert("Escolha uma opção antes de continuar.");
      return;
    }

    if (questionIndex === QUESTIONS.length - 1) {
      setScreen("suggestion");
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  }

  function previousQuestion() {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
    }
  }

  async function finishSurvey() {
    const average = (
      answers.reduce((sum, answer) => sum + (SCORE_MAP[answer] || 0), 0) / QUESTIONS.length
    ).toFixed(2);

    const payload = {
      auth_user_id: authUser?.id || null,
      entrevistador_nome: interviewer.nome,
      entrevistado_nome: respondent.nome,
      entrevistado_email: respondent.email,
      entrevistado_celular: respondent.celular,
      tipo_caminhao: respondent.tipoCaminhao,
      medida_pneu: respondent.tipoPneu,
      aplicacao_pneu: respondent.aplicacaoPneu,
      fornecedor_principal: respondent.fornecedorPrincipal,
      respostas: answers,
      sugestao: suggestion,
      media_geral: Number(average),
      status: "concluida",
    };

    const { data, error } = await supabase
      .from("pesquisas_caminhoneiro")
      .insert([payload])
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar no Supabase: " + error.message);
      return;
    }

    const record = {
      id: data?.id || Date.now(),
      interviewer: {
        nome: interviewer.nome,
      },
      respondent,
      answers,
      suggestion,
      average,
      createdAt: data?.created_at
        ? new Date(data.created_at).toLocaleString("pt-BR")
        : new Date().toLocaleString("pt-BR"),
      authUserId: data?.auth_user_id || authUser?.id || null,
    };

    setRecords((prev) => {
      const updated = [record, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    alert(`Pesquisa salva com sucesso para ${respondent.nome}. Média geral: ${average}`);
    resetSurvey();
    setScreen("home");
  }

  function unlockReports() {
    if (reportPasswordInput !== REPORT_PASSWORD) {
      alert("Senha incorreta.");
      return;
    }
    setReportUnlocked(true);
  }

  function exportDetailedCsv() {
    if (!filteredRecords.length) {
      alert("Ainda não há respostas para exportar.");
      return;
    }

    const headers = [
      "Entrevistador",
      "Nome entrevistado",
      "E-mail entrevistado",
      "Celular",
      "Tipo de caminhão",
      "Medida do pneu",
      "Aplicação do pneu",
      "Fornecedor principal",
      "Data",
      "Sugestão",
      ...QUESTIONS.flatMap((q, i) => [`Pergunta ${i + 1}`, `Resposta ${i + 1}`, `Nota ${i + 1}`]),
    ];

    const rows = filteredRecords.map((record) => [
      reportMode === "geral" ? "Oculto" : record.interviewer?.nome || "",
      record.respondent.nome,
      record.respondent.email,
      record.respondent.celular,
      record.respondent.tipoCaminhao,
      record.respondent.tipoPneu,
      record.respondent.aplicacaoPneu,
      record.respondent.fornecedorPrincipal,
      record.createdAt,
      record.suggestion,
      ...QUESTIONS.flatMap((q, i) => [q, record.answers[i] || "", SCORE_MAP[record.answers[i]] || ""]),
    ]);

    downloadCsv("respostas_detalhadas.csv", [headers, ...rows]);
  }

  function exportSummaryCsv() {
    if (!filteredRecords.length) {
      alert("Ainda não há respostas para exportar.");
      return;
    }

    const rows = [
      ["Pergunta", "Total respostas", "Média", "Excelente", "Bom", "Razoável", "Pouco útil", "Inútil"],
      ...summary.map((item) => [
        item.question,
        item.total,
        item.average,
        item.excelente,
        item.bom,
        item.razoavel,
        item.poucoUtil,
        item.inutil,
      ]),
    ];

    downloadCsv("resumo_pesquisa.csv", rows);
  }

  function exportSuggestionsCsv() {
    const suggestions = filteredRecords.filter((r) => r.suggestion?.trim());

    if (!suggestions.length) {
      alert("Ainda não há sugestões para exportar.");
      return;
    }

    const rows = [
      [
        "Entrevistador",
        "Nome entrevistado",
        "Celular",
        "E-mail",
        "Tipo de caminhão",
        "Medida do pneu",
        "Aplicação do pneu",
        "Data",
        "Sugestão",
      ],
      ...suggestions.map((record) => [
        reportMode === "geral" ? "Oculto" : record.interviewer?.nome || "",
        record.respondent.nome,
        record.respondent.celular,
        record.respondent.email,
        record.respondent.tipoCaminhao,
        record.respondent.tipoPneu,
        record.respondent.aplicacaoPneu,
        record.createdAt,
        record.suggestion,
      ]),
    ];

    downloadCsv("sugestoes.csv", rows);
  }

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(239,68,68,0.12), transparent 28%), linear-gradient(180deg, #09090b 0%, #0f0f12 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        Carregando acesso...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(239,68,68,0.12), transparent 28%), linear-gradient(180deg, #09090b 0%, #0f0f12 100%)",
        color: "white",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 20, padding: "20px 0 8px 0" }}>
          <SectionBadge>MAGNUM TIRES • PESQUISA DIGITAL</SectionBadge>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {SURVEY_CONFIG.title}
          </h1>
          <p
            style={{
              color: "#a1a1aa",
              marginTop: 10,
              marginBottom: 0,
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 720,
            }}
          >
            {SURVEY_CONFIG.subtitle}
          </p>
          {authUser && (
            <p
              style={{
                color: "#fca5a5",
                marginTop: 10,
                marginBottom: 0,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Logado como: {authUser.email}
            </p>
          )}
        </div>

        {!authUser ? (
          <Card
            title="Entrar no sistema"
            subtitle="Use seu e-mail e senha de entrevistador para acessar a pesquisa."
          >
            <Field
              label="E-mail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              type="email"
            />

            <Field
              label="Senha"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              type="password"
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <PrimaryButton onClick={handleLogin}>Entrar</PrimaryButton>
            </div>
          </Card>
        ) : (
          <>
            {screen === "home" && (
              <>
                <Card>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 20,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <SectionBadge>PESQUISA + RELACIONAMENTO + APP</SectionBadge>

                      <h2
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: 30,
                          lineHeight: 1.1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Uma forma mais inteligente de abrir conversa com o caminhoneiro
                      </h2>

                      <p
                        style={{
                          color: "#d4d4d8",
                          fontSize: 16,
                          lineHeight: 1.7,
                          margin: 0,
                          maxWidth: 620,
                        }}
                      >
                        A pesquisa transforma a abordagem comercial em uma conversa útil,
                        consultiva e menos invasiva. Em vez de começar vendendo, começamos
                        ouvindo, entendendo a rotina do cliente e preparando o terreno para
                        a próxima fase com o aplicativo.
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 20,
                        }}
                      >
                        <PrimaryButton onClick={() => setScreen("identify")}>
                          Nova pesquisa
                        </PrimaryButton>

                        <SecondaryButton
                          onClick={() => {
                            setReportPasswordInput("");
                            setReportUnlocked(false);
                            setReportMode("geral");
                            setSelectedInterviewer("");
                            setSelectedApplication("");
                            setSearchTerm("");
                            setScreen("reports");
                          }}
                        >
                          Dashboard e relatórios
                        </SecondaryButton>

                        <SecondaryButton onClick={handleLogout}>Sair</SecondaryButton>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "linear-gradient(180deg, #101013 0%, #0b0b0d 100%)",
                        border: "1px solid #27272a",
                        borderRadius: 22,
                        padding: 20,
                      }}
                    >
                      <div style={{ display: "grid", gap: 14 }}>
                        <div
                          style={{
                            padding: 14,
                            borderRadius: 18,
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.18)",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>Abordagem mais leve</div>
                          <div style={{ color: "#d4d4d8", lineHeight: 1.5, fontSize: 14 }}>
                            A entrada acontece por uma pesquisa útil, e não por uma oferta direta.
                          </div>
                        </div>

                        <div
                          style={{
                            padding: 14,
                            borderRadius: 18,
                            background: "#09090b",
                            border: "1px solid #27272a",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>Dados para a fase 2</div>
                          <div style={{ color: "#d4d4d8", lineHeight: 1.5, fontSize: 14 }}>
                            Cada resposta ajuda a identificar interesse, perfil, dor e potencial
                            de relacionamento futuro.
                          </div>
                        </div>

                        <div
                          style={{
                            padding: 14,
                            borderRadius: 18,
                            background: "#09090b",
                            border: "1px solid #27272a",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>Valor antes da venda</div>
                          <div style={{ color: "#d4d4d8", lineHeight: 1.5, fontSize: 14 }}>
                            O aplicativo entra como solução para manutenção, controle e prevenção
                            em um dos maiores custos do caminhoneiro: o pneu.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Como essa estratégia funciona"
                  subtitle="A pesquisa abre relacionamento, organiza dados e cria uma ponte para o aplicativo."
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {[
                      ["01", "Apresentar", "Mostrar a força da Magnum de forma curta, clara e profissional."],
                      ["02", "Diagnosticar", "Entender se já conhece a marca, se já compra e qual o momento atual."],
                      ["03", "Pesquisar", "Aplicar o formulário e captar dados importantes para evolução da jornada."],
                      ["04", "Continuar", "Avançar para a fase 2 com mais contexto, mais permissão e mais chance de conexão."],
                    ].map(([n, t, d]) => (
                      <div
                        key={n}
                        style={{
                          background: "#09090b",
                          border: "1px solid #27272a",
                          borderRadius: 20,
                          padding: 18,
                        }}
                      >
                        <div style={{ color: "#fca5a5", fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                          {n}
                        </div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{t}</div>
                        <div style={{ color: "#d4d4d8", fontSize: 14, lineHeight: 1.5 }}>{d}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {visibleRecords.length > 0 && (
                  <Card title="Resumo rápido" subtitle="Indicadores da base do usuário logado.">
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                      }}
                    >
                      <MetricCard title="Pesquisas" value={visibleRecords.length} subtitle="Total da sua base" />
                      <MetricCard title="Entrevistadores" value={interviewerGroups.length} subtitle="Na sua base" />
                      <MetricCard
                        title="Aplicações"
                        value={new Set(visibleRecords.map((r) => r.respondent.aplicacaoPneu || "-")).size}
                        subtitle="Tipos mapeados"
                      />
                    </div>
                  </Card>
                )}
              </>
            )}

            {screen === "identify" && (
              <Card
                title="Nova pesquisa"
                subtitle="Preencha os dados abaixo antes de iniciar a entrevista."
              >
                <div
                  style={{
                    background: "linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 18,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Antes de começar</div>
                  <div style={{ color: "#d4d4d8", fontSize: 14, lineHeight: 1.6 }}>
                    Esta etapa organiza a entrevista e garante que os dados fiquem corretamente vinculados ao
                    entrevistador e ao perfil do caminhoneiro.
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(180deg, #111214 0%, #0b0b0d 100%)",
                      border: "1px solid #27272a",
                      borderRadius: 22,
                      padding: 20,
                    }}
                  >
                    <SectionBadge>QUEM APLICA</SectionBadge>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                        Dados do entrevistador
                      </div>
                      <div style={{ color: "#a1a1aa", fontSize: 14, lineHeight: 1.5 }}>
                        Identifique quem está realizando a pesquisa.
                      </div>
                    </div>

                    <Field
                      label="Nome do entrevistador *"
                      value={interviewer.nome}
                      onChange={(e) => setInterviewer({ ...interviewer, nome: e.target.value })}
                      placeholder="Digite o nome de quem está aplicando"
                    />
                  </div>

                  <div
                    style={{
                      background: "linear-gradient(180deg, #111214 0%, #0b0b0d 100%)",
                      border: "1px solid #27272a",
                      borderRadius: 22,
                      padding: 20,
                    }}
                  >
                    <SectionBadge>QUEM RESPONDE</SectionBadge>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                        Dados do entrevistado
                      </div>
                      <div style={{ color: "#a1a1aa", fontSize: 14, lineHeight: 1.5 }}>
                        Registre as informações principais para dar contexto à entrevista.
                      </div>
                    </div>

                    <Field
                      label="Nome do entrevistado *"
                      value={respondent.nome}
                      onChange={(e) => setRespondent({ ...respondent, nome: e.target.value })}
                      placeholder="Digite o nome do caminhoneiro"
                    />

                    <Field
                      label="Celular"
                      value={respondent.celular}
                      onChange={(e) =>
                        setRespondent({ ...respondent, celular: formatPhone(e.target.value) })
                      }
                      placeholder="(11) 99999-9999"
                    />

                    <Field
                      label="E-mail"
                      value={respondent.email}
                      onChange={(e) => setRespondent({ ...respondent, email: e.target.value })}
                      type="email"
                      placeholder="nome@exemplo.com"
                    />

                    <SelectField
                      label="Tipo de caminhão"
                      value={respondent.tipoCaminhao}
                      onChange={(e) => setRespondent({ ...respondent, tipoCaminhao: e.target.value })}
                      options={TRUCK_TYPES}
                    />

                    <Field
                      label="Medida do pneu"
                      value={respondent.tipoPneu}
                      onChange={(e) => setRespondent({ ...respondent, tipoPneu: e.target.value })}
                      placeholder="Ex.: 295/80R22.5"
                    />

                    <SelectField
                      label="Aplicação do pneu *"
                      value={respondent.aplicacaoPneu}
                      onChange={(e) =>
                        setRespondent({ ...respondent, aplicacaoPneu: e.target.value })
                      }
                      options={TIRE_APPLICATIONS}
                    />

                    <Field
                      label="Principal fornecedor hoje"
                      value={respondent.fornecedorPrincipal}
                      onChange={(e) =>
                        setRespondent({ ...respondent, fornecedorPrincipal: e.target.value })
                      }
                      placeholder="Ex.: marca ou fornecedor atual"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 20,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#a1a1aa", fontSize: 14 }}>
                    Campos com * são essenciais para iniciar a pesquisa.
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <SecondaryButton onClick={() => setScreen("home")}>Voltar</SecondaryButton>
                    <PrimaryButton onClick={startSurvey}>Iniciar pesquisa</PrimaryButton>
                  </div>
                </div>
              </Card>
            )}

            {screen === "survey" && (
              <Card
                title={`Pergunta ${questionIndex + 1} de ${QUESTIONS.length}`}
                subtitle="Escolha a opção que melhor representa a percepção do entrevistado."
                right={
                  <div
                    style={{
                      minWidth: 110,
                      textAlign: "right",
                      color: "#fca5a5",
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {Math.round(progress)}%
                  </div>
                }
              >
                <div
                  style={{
                    background: "#0b0b0d",
                    border: "1px solid #27272a",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ color: "#a1a1aa", fontSize: 14 }}>
                      Etapa atual da entrevista
                    </div>
                    <div style={{ color: "#d4d4d8", fontSize: 14, fontWeight: 700 }}>
                      {questionIndex + 1} / {QUESTIONS.length}
                    </div>
                  </div>

                  <div
                    style={{
                      height: 14,
                      background: "#1a1a1d",
                      borderRadius: 999,
                      overflow: "hidden",
                      border: "1px solid #27272a",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)",
                        transition: "width 0.3s ease",
                        boxShadow: "0 0 18px rgba(239,68,68,0.25)",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(180deg, #111214 0%, #0b0b0d 100%)",
                    border: "1px solid #27272a",
                    borderRadius: 24,
                    padding: 22,
                    marginBottom: 18,
                  }}
                >
                  <SectionBadge>PERGUNTA ATUAL</SectionBadge>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 26,
                      lineHeight: 1.45,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {QUESTIONS[questionIndex]}
                  </h3>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {OPTIONS.map((option) => {
                    const selected = answers[questionIndex] === option;

                    return (
                      <button
                        key={option}
                        onClick={() => {
                          const updated = [...answers];
                          updated[questionIndex] = option;
                          setAnswers(updated);
                        }}
                        style={{
                          textAlign: "left",
                          padding: 18,
                          borderRadius: 20,
                          border: selected ? "1px solid #ef4444" : "1px solid #3f3f46",
                          background: selected
                            ? "linear-gradient(180deg, rgba(239,68,68,0.20) 0%, rgba(127,29,29,0.16) 100%)"
                            : "linear-gradient(180deg, #0d0d10 0%, #09090b 100%)",
                          color: "white",
                          cursor: "pointer",
                          fontSize: 15,
                          fontWeight: selected ? 700 : 500,
                          boxShadow: selected ? "0 12px 24px rgba(127,29,29,0.22)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 999,
                              border: selected ? "5px solid #ef4444" : "2px solid #71717a",
                              background: selected ? "#fff" : "transparent",
                              flexShrink: 0,
                            }}
                          />
                          <div>{option}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 22,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#a1a1aa", fontSize: 14 }}>
                    Selecione uma opção para continuar.
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <SecondaryButton onClick={previousQuestion} disabled={questionIndex === 0}>
                      Anterior
                    </SecondaryButton>
                    <PrimaryButton onClick={nextQuestion}>Próxima</PrimaryButton>
                  </div>
                </div>
              </Card>
            )}

            {screen === "suggestion" && (
              <Card
                title="Sugestão final"
                subtitle="Registre aqui qualquer observação, melhoria ou funcionalidade sugerida."
              >
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 180,
                    borderRadius: 18,
                    border: "1px solid #3f3f46",
                    background: "#09090b",
                    color: "white",
                    padding: 16,
                    fontSize: 15,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                  <SecondaryButton onClick={() => setScreen("survey")}>Voltar</SecondaryButton>
                  <PrimaryButton onClick={finishSurvey}>Finalizar pesquisa</PrimaryButton>
                </div>
              </Card>
            )}

            {screen === "reports" && (
              <>
                {!reportUnlocked ? (
                  <Card
                    title="Acesso ao dashboard"
                    subtitle="Área protegida por senha para leitura dos seus resultados."
                  >
                    <Field
                      label="Senha de acesso"
                      value={reportPasswordInput}
                      onChange={(e) => setReportPasswordInput(e.target.value)}
                      type="password"
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <SecondaryButton onClick={() => setScreen("home")}>Voltar</SecondaryButton>
                      <PrimaryButton onClick={unlockReports}>Entrar</PrimaryButton>
                    </div>
                  </Card>
                ) : (
                  <>
                    <Card
                      title="Dashboard da pesquisa"
                      subtitle="Relatórios visuais filtrados apenas para o usuário logado."
                    >
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <SecondaryButton onClick={() => setScreen("home")}>Voltar</SecondaryButton>
                        <PrimaryButton onClick={exportDetailedCsv}>Exportar detalhado</PrimaryButton>
                        <SecondaryButton onClick={exportSummaryCsv}>Exportar resumo</SecondaryButton>
                        <SecondaryButton onClick={exportSuggestionsCsv}>Exportar sugestões</SecondaryButton>
                      </div>
                    </Card>

                    <Card
                      title="Filtros"
                      subtitle="Refine a visualização por modo, entrevistador, aplicação ou lead."
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 16,
                        }}
                      >
                        <SelectField
                          label="Modo de visualização"
                          value={reportMode}
                          onChange={(e) => {
                            setReportMode(e.target.value);
                            if (e.target.value === "geral") setSelectedInterviewer("");
                          }}
                          options={["geral", "entrevistador"]}
                        />
                        {reportMode === "entrevistador" && (
                          <SelectField
                            label="Entrevistador"
                            value={selectedInterviewer}
                            onChange={(e) => setSelectedInterviewer(e.target.value)}
                            options={interviewerGroups}
                          />
                        )}
                        <SelectField
                          label="Aplicação do pneu"
                          value={selectedApplication}
                          onChange={(e) => setSelectedApplication(e.target.value)}
                          options={TIRE_APPLICATIONS}
                        />
                        <Field
                          label="Buscar lead"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Nome, celular, e-mail ou medida"
                        />
                      </div>
                    </Card>

                    <Card
                      title="Indicadores"
                      subtitle="Leitura rápida dos principais números da sua base filtrada."
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: 12,
                        }}
                      >
                        <MetricCard title="Pesquisas filtradas" value={dashboardSummary.total} subtitle="Base atual" />
                        <MetricCard title="Média geral" value={dashboardSummary.avg} subtitle="Das respostas filtradas" />
                        <MetricCard
                          title="Entrevistadores ativos"
                          value={dashboardSummary.interviewers}
                          subtitle="Na sua base"
                        />
                        <MetricCard title="Aplicação mais frequente" value={dashboardSummary.topApplication} />
                      </div>
                    </Card>

                    <Card
                      title={reportMode === "geral" ? "Leads entrevistados" : "Minhas entrevistas"}
                      subtitle="Tabela consolidada das entrevistas do usuário logado."
                    >
                      <SimpleTable rows={filteredRecords} hideInterviewer={false} />
                    </Card>

                    <Card
                      title="Resumo por pergunta"
                      subtitle="Consolidação das respostas das suas entrevistas."
                    >
                      {summary.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            borderTop: index === 0 ? "none" : "1px solid #27272a",
                            padding: "16px 0",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 8, lineHeight: 1.5 }}>
                            {item.question}
                          </div>
                          <div style={{ color: "#d4d4d8", fontSize: 14, lineHeight: 1.7 }}>
                            Média: {item.average} | Total: {item.total} | Excelente: {item.excelente} | Bom: {item.bom} | Razoável: {item.razoavel} | Pouco útil: {item.poucoUtil} | Inútil: {item.inutil}
                          </div>
                        </div>
                      ))}
                    </Card>

                    <Card
                      title="Sugestões captadas"
                      subtitle="Lista das observações abertas registradas nas suas entrevistas."
                    >
                      {filteredRecords.filter((r) => r.suggestion?.trim()).length === 0 && (
                        <div
                          style={{
                            background: "#09090b",
                            border: "1px dashed #3f3f46",
                            borderRadius: 18,
                            padding: 20,
                            color: "#a1a1aa",
                          }}
                        >
                          Ainda não há sugestões registradas com os filtros atuais.
                        </div>
                      )}

                      {filteredRecords
                        .filter((r) => r.suggestion?.trim())
                        .map((record) => (
                          <div
                            key={record.id}
                            style={{
                              borderTop: "1px solid #27272a",
                              padding: "16px 0",
                            }}
                          >
                            <div style={{ fontWeight: 700 }}>{record.respondent.nome}</div>
                            <div style={{ color: "#a1a1aa", fontSize: 13, margin: "6px 0 8px" }}>
                              Entrevistador: {record.interviewer?.nome || "-"} • {record.createdAt}
                            </div>
                            <div style={{ color: "#d4d4d8", fontSize: 14, marginBottom: 8 }}>
                              Aplicação: {record.respondent.aplicacaoPneu || "-"} • Medida: {record.respondent.tipoPneu || "-"} • Caminhão: {record.respondent.tipoCaminhao || "-"}
                            </div>
                            <div style={{ lineHeight: 1.7 }}>{record.suggestion}</div>
                          </div>
                        ))}
                    </Card>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}