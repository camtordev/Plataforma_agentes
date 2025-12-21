import { useEffect } from "react";

function validateCode(code, mustInclude = [], mustIncludeAny = []) {
  const txt = (code || "").toLowerCase();
  const missing = [];

  for (const token of mustInclude) {
    if (!txt.includes(String(token).toLowerCase())) missing.push(token);
  }

  if (mustIncludeAny.length > 0) {
    const okAny = mustIncludeAny.some((t) =>
      txt.includes(String(t).toLowerCase())
    );
    if (!okAny) missing.push(`Uno de: ${mustIncludeAny.join(" / ")}`);
  }

  return { ok: missing.length === 0, missing };
}

export default function TutorialLevelModal({
  level,
  tab,
  setTab,
  progress,
  setProgress,
  onClose,
  onToast,
  onCompleteLevel,
}) {
  // ✅ 1) Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Asegurar que el draft exista al abrir
  useEffect(() => {
    if (!level) return;
    setProgress((p) => {
      const hasDraft = (p.drafts || {})[level.id];
      if (hasDraft) return p;
      return {
        ...p,
        drafts: {
          ...(p.drafts || {}),
          [level.id]: level.activity?.starter || "",
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?.id]);

  if (!level) return null;

  const draft =
    (progress.drafts || {})[level.id] || level.activity?.starter || "";
  const practiceDone = !!progress.codePassed?.[level.id];
  const quizDone = !!progress.quizPassed?.[level.id];

  function setAnswer(qIndex, optionIndex) {
    setProgress((p) => ({
      ...p,
      answers: {
        ...(p.answers || {}),
        [level.id]: {
          ...((p.answers || {})[level.id] || {}),
          [qIndex]: optionIndex,
        },
      },
    }));
  }

  function checkCode() {
    const rules = level.activity?.rules || {
      mustInclude: [],
      mustIncludeAny: [],
    };
    const out = validateCode(draft, rules.mustInclude, rules.mustIncludeAny);

    setProgress((p) => ({
      ...p,
      codeChecked: { ...(p.codeChecked || {}), [level.id]: true },
      codePassed: { ...(p.codePassed || {}), [level.id]: out.ok },
      codeMissing: { ...(p.codeMissing || {}), [level.id]: out.missing },
    }));

    onToast?.(
      out.ok
        ? "✅ Práctica validada"
        : "❌ Aún faltan requisitos en la práctica"
    );
    if (out.ok) setTab("QUIZ");
  }

  function checkQuiz() {
    const ans = progress.answers?.[level.id] || {};
    const total = level.quiz.length;
    let correct = 0;

    for (let i = 0; i < total; i++) {
      if (ans[i] === level.quiz[i].correct) correct++;
    }

    const passed = correct === total;

    setProgress((p) => ({
      ...p,
      quizChecked: { ...(p.quizChecked || {}), [level.id]: true },
      quizPassed: { ...(p.quizPassed || {}), [level.id]: passed },
    }));

    onToast?.(
      passed
        ? "✅ Quiz aprobado"
        : `❌ Quiz: ${correct}/${total}. Revisa teoría y vuelve a intentar.`
    );
    if (!passed) setTab("TEORIA");
  }

  function resetQuiz() {
    setProgress((p) => ({
      ...p,
      answers: { ...(p.answers || {}), [level.id]: {} },
      quizChecked: { ...(p.quizChecked || {}), [level.id]: false },
      quizPassed: { ...(p.quizPassed || {}), [level.id]: false },
    }));
  }

  function restorePractice() {
    setProgress((p) => ({
      ...p,
      drafts: {
        ...(p.drafts || {}),
        [level.id]: level.activity?.starter || "",
      },
      codeChecked: { ...(p.codeChecked || {}), [level.id]: false },
      codePassed: { ...(p.codePassed || {}), [level.id]: false },
      codeMissing: { ...(p.codeMissing || {}), [level.id]: [] },
    }));
  }

  function complete() {
    if (!practiceDone || !quizDone) {
      onToast?.("❗ Para completar: Práctica validada + Quiz aprobado.");
      return;
    }
    onCompleteLevel?.(level);
  }

  return (
    // ✅ 2) El overlay ahora scrollea (NO el fondo). overscroll-contain evita “pasar” el scroll al body.
    <div
      className="fixed inset-0 z-50 bg-black/60 overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Centrado con espacio arriba/abajo, y click dentro NO cierra */}
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        {/* ✅ max-h para que el modal no exceda la pantalla; layout flex-col para scrollear el cuerpo */}
        <div
          className="w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header fijo */}
          <div className="p-5 border-b border-zinc-800 flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="text-xs text-zinc-500">Nivel {level.level}</div>
              <div className="text-xl font-bold text-white">{level.title}</div>
              <div className="text-sm text-zinc-400 mt-1">{level.summary}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={complete}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
              >
                Completar nivel
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-zinc-700"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Tabs + checklist fijo */}
          <div className="px-5 pt-4 shrink-0">
            <div className="inline-flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {[
                { key: "TEORIA", label: "Teoría" },
                { key: "PRACTICA", label: "Práctica" },
                { key: "GUIA_WORKSPACE", label: "Guía en Workspace" },
                { key: "QUIZ", label: "Quiz" },
              ].map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={[
                      "px-4 py-2 text-sm font-semibold",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-zinc-300 hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="text-xs text-zinc-500">Práctica</div>
                <div className="text-sm text-zinc-200 font-semibold">
                  {practiceDone ? "✅ Validada" : "⬜ Pendiente"}
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="text-xs text-zinc-500">Quiz</div>
                <div className="text-sm text-zinc-200 font-semibold">
                  {quizDone ? "✅ Aprobado" : "⬜ Pendiente"}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ CUERPO SCROLLEABLE */}
          <div className="p-5 overflow-y-auto min-h-0 flex-1">
            {/* TEORÍA */}
            {tab === "TEORIA" && (
              <div className="grid lg:grid-cols-3 gap-4">
                {/* OBJETIVOS DE APRENDIZAJE */}
                {level.learningObjectives &&
                  level.learningObjectives.length > 0 && (
                    <div className="lg:col-span-3 bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-800/50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🎯</span>
                        <div className="text-white font-bold text-lg">
                          Objetivos de Aprendizaje
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 mb-4">
                        Al completar este nivel, serás capaz de:
                      </p>
                      <ul className="space-y-2">
                        {level.learningObjectives.map((obj, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-zinc-200"
                          >
                            <span className="text-blue-400 font-bold mt-0.5 shrink-0">
                              ✓
                            </span>
                            <span className="text-sm leading-relaxed">
                              {obj}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {level.theoryCards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                  >
                    <div className="text-white font-bold mb-2">
                      {card.title}
                    </div>
                    <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                      {card.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {(level.diagram?.image || level.diagram?.ascii) && (
                  <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-white font-bold mb-2">
                      {level.diagram.title || "Diagrama"}
                    </div>
                    {level.diagram.image ? (
                      <div className="flex justify-center items-center bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                        <img
                          src={level.diagram.image}
                          alt={level.diagram.title || "Diagrama"}
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    ) : (
                      <pre className="text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto whitespace-pre">
                        {level.diagram.ascii}
                      </pre>
                    )}
                  </div>
                )}
                {level.observationCard && (
                  <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-white font-bold mb-2">
                      {level.observationCard.title || "Observation"}
                    </div>
                    {level.observationCard.description && (
                      <p className="text-sm text-zinc-400 mb-3">
                        {level.observationCard.description}
                      </p>
                    )}

                    {level.observationCard.fields?.length > 0 && (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 mb-3">
                        <div className="text-xs text-zinc-500 mb-2">Campos</div>
                        <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                          {level.observationCard.fields.map((f, i) => (
                            <li key={i}>
                              <span className="text-zinc-100 font-semibold">
                                {f.name}
                              </span>
                              : <span className="text-zinc-400">{f.type}</span>{" "}
                              — {f.meaning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {level.observationCard.example && (
                      <pre className="text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto whitespace-pre">
                        {level.observationCard.example}
                      </pre>
                    )}

                    {level.observationCard.notes?.length > 0 && (
                      <div className="mt-3 text-sm text-zinc-400">
                        <div className="text-zinc-200 font-semibold mb-1">
                          Notas
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          {level.observationCard.notes.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* CHECKLIST (si existe) */}
                {level.checklist?.length > 0 && (
                  <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-white font-bold mb-2">
                      Checklist antes de avanzar
                    </div>
                    <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                      {level.checklist.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* MINI EJERCICIO GUIADO (si existe) */}
                {level.guidedExercise && (
                  <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-white font-bold mb-2">
                      {level.guidedExercise.title || "Mini ejercicio guiado"}
                    </div>
                    {level.guidedExercise.goal && (
                      <p className="text-sm text-zinc-400 mb-3">
                        {level.guidedExercise.goal}
                      </p>
                    )}

                    {level.guidedExercise.steps?.length > 0 && (
                      <ol className="list-decimal pl-5 text-zinc-300 space-y-1">
                        {level.guidedExercise.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    )}

                    {level.guidedExercise.quickCheck && (
                      <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                        <div className="text-xs text-zinc-500 mb-1">
                          Auto-check rápido
                        </div>
                        <div className="text-sm text-zinc-200">
                          {level.guidedExercise.quickCheck}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="lg:col-span-3 grid lg:grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-white font-bold mb-2">
                      {level.codeExampleTitle}
                    </div>
                    <pre className="text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto">
                      {level.codeExample}
                    </pre>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-white font-bold mb-2">
                      Glosario rápido
                    </div>
                    <div className="space-y-2">
                      {(level.glossary || []).map((g, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                        >
                          <div className="text-zinc-100 font-semibold">
                            {g.term}
                          </div>
                          <div className="text-sm text-zinc-400">{g.def}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setTab("PRACTICA")}
                      className="mt-3 w-full px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500"
                    >
                      Ir a práctica
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PRÁCTICA */}
            {tab === "PRACTICA" && (
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-white font-bold">
                    {level.activity.title}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">
                    {level.activity.prompt}
                  </div>

                  <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <div className="text-xs text-zinc-500 mb-2">Tips</div>
                    <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                      {level.activity.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-white font-bold mb-2">
                    Editor (interactivo)
                  </div>

                  <textarea
                    value={draft}
                    onChange={(e) =>
                      setProgress((p) => ({
                        ...p,
                        drafts: {
                          ...(p.drafts || {}),
                          [level.id]: e.target.value,
                        },
                      }))
                    }
                    spellCheck={false}
                    className="w-full h-60 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={checkCode}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500"
                    >
                      Validar práctica
                    </button>

                    <button
                      onClick={restorePractice}
                      className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 hover:border-zinc-700"
                    >
                      Restaurar
                    </button>

                    <button
                      onClick={() => setTab("QUIZ")}
                      className="ml-auto px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 hover:border-zinc-700"
                    >
                      Ir al quiz →
                    </button>
                  </div>

                  {progress.codeChecked?.[level.id] &&
                    !progress.codePassed?.[level.id] && (
                      <div className="mt-3 text-sm text-red-200 bg-red-900/20 border border-red-800 rounded-lg p-3">
                        <div className="font-semibold mb-1">
                          Faltan requisitos:
                        </div>
                        <ul className="list-disc pl-5">
                          {(progress.codeMissing?.[level.id] || []).map(
                            (m, i) => (
                              <li key={i}>{m}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {progress.codePassed?.[level.id] && (
                    <div className="mt-3 text-sm text-emerald-200 bg-emerald-900/20 border border-emerald-800 rounded-lg p-3">
                      ✅ Práctica validada correctamente.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GUÍA EN WORKSPACE */}
            {tab === "GUIA_WORKSPACE" && level.workspacePractice && (
              <div className="space-y-6">
                {/* Objetivo de la práctica */}
                <div className="bg-gradient-to-br from-purple-950/40 to-blue-950/40 border border-purple-800/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-white font-bold text-lg">
                      Objetivo de la Práctica
                    </h3>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {level.workspacePractice.objective}
                  </p>
                </div>

                {/* Código del agente */}
                {level.workspacePractice.agentCode && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💻</span>
                        <span className="text-white font-semibold text-sm">
                          Código del{" "}
                          {level.workspacePractice.agentName || "Agente"}
                        </span>
                      </div>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm text-zinc-300 font-mono">
                      <code>{level.workspacePractice.agentCode}</code>
                    </pre>
                  </div>
                )}

                {/* Explicación del comportamiento */}
                {level.workspacePractice.explanation && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📖</span>
                      <h4 className="text-white font-semibold">
                        Cómo funciona este agente
                      </h4>
                    </div>
                    <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {level.workspacePractice.explanation}
                    </div>
                  </div>
                )}

                {/* Instrucciones paso a paso */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📋</span>
                    <h4 className="text-white font-semibold">Instrucciones</h4>
                  </div>
                  <ol className="space-y-3">
                    {level.workspacePractice.instructions.map(
                      (instruction, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-zinc-300 text-sm leading-relaxed pt-0.5">
                            {instruction}
                          </span>
                        </li>
                      )
                    )}
                  </ol>
                </div>

                {/* Botón para ir al Workspace */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => (window.location.href = "/workspace")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="text-xl">🚀</span>
                    Ir al Workspace
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ */}
            {tab === "QUIZ" && (
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-white font-bold">Quiz del nivel</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    Debes acertar todas. Si fallas, vuelve a teoría y reintenta.
                  </div>

                  <div className="mt-3 flex gap-3 flex-wrap">
                    <button
                      onClick={checkQuiz}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500"
                    >
                      Revisar quiz
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 hover:border-zinc-700"
                    >
                      Reiniciar respuestas
                    </button>
                    <button
                      onClick={() => setTab("TEORIA")}
                      className="ml-auto px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 hover:border-zinc-700"
                    >
                      ← Volver a teoría
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-white font-bold">Preguntas</div>

                  {/* Aquí ya se ve todo porque el BODY completo es scrollable */}
                  <div className="mt-3 space-y-4">
                    {level.quiz.map((qq, qi) => {
                      const chosen = (progress.answers?.[level.id] || {})[qi];
                      const checked = !!progress.quizChecked?.[level.id];
                      const isCorrect = chosen === qq.correct;

                      return (
                        <div
                          key={qi}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                        >
                          <div className="text-zinc-100 font-semibold">
                            {qi + 1}. {qq.q}
                          </div>

                          <div className="mt-2 space-y-2">
                            {qq.options.map((opt, oi) => (
                              <label
                                key={oi}
                                className="flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`${level.id}-${qi}`}
                                  checked={chosen === oi}
                                  onChange={() => setAnswer(qi, oi)}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>

                          {checked && (
                            <div
                              className={[
                                "mt-2 text-sm rounded-md p-2 border",
                                isCorrect
                                  ? "text-emerald-200 bg-emerald-900/20 border-emerald-800"
                                  : "text-red-200 bg-red-900/20 border-red-800",
                              ].join(" ")}
                            >
                              {isCorrect ? "✅ Correcto" : "❌ Incorrecto"} —{" "}
                              {qq.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-zinc-400">
                Para completar este nivel necesitas:
                <span className="text-zinc-200 font-semibold">
                  {" "}
                  Práctica validada
                </span>{" "}
                y{" "}
                <span className="text-zinc-200 font-semibold">
                  Quiz aprobado
                </span>
                .
              </div>
              <button
                onClick={complete}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
              >
                Completar nivel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
