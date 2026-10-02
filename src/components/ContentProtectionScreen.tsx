import React, { useState } from 'react';
import { AppState, ContentCategoryRule, UrlTestRecord } from '../types';
import { ShieldAlert, Lock, Plus, Trash2, CheckCircle2, XCircle, AlertTriangle, Search, History, HelpCircle, ShieldCheck, Flame } from 'lucide-react';

interface ContentProtectionScreenProps {
  state: AppState;
  onToggleCategory: (categoryId: string) => void;
  onAddCustomKeyword: (keyword: string) => void;
  onRemoveCustomKeyword: (keyword: string) => void;
  onRunUrlTest: (url: string) => void;
  onClearUrlHistory: () => void;
}

export const ContentProtectionScreen: React.FC<ContentProtectionScreenProps> = ({
  state,
  onToggleCategory,
  onAddCustomKeyword,
  onRemoveCustomKeyword,
  onRunUrlTest,
  onClearUrlHistory,
}) => {
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [testUrlInput, setTestUrlInput] = useState('');
  const [lastTestResult, setLastTestResult] = useState<UrlTestRecord | null>(null);

  const handleAddKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeywordInput.trim().toLowerCase();
    if (!trimmed) return;
    onAddCustomKeyword(trimmed);
    setNewKeywordInput('');
  };

  const handleUrlTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = testUrlInput.trim();
    if (!url) return;

    // Execute URL Test logic
    let status: 'allowed' | 'blocked' | 'unverified' | 'error' = 'allowed';
    let matchedRule: string | undefined = undefined;

    // Check URL syntax validity
    let parsedUrl: URL | null = null;
    try {
      const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      parsedUrl = new URL(formattedUrl);
    } catch {
      status = 'error';
      matchedRule = 'Formato de URL inválido ou sintaxe incorreta';
    }

    if (status !== 'error') {
      const fullText = url.toLowerCase();

      // Check custom keywords first
      for (const kw of state.customKeywords) {
        if (fullText.includes(kw.toLowerCase())) {
          status = 'blocked';
          matchedRule = `Palavra-chave personalizada: "${kw}"`;
          break;
        }
      }

      // Check active category rules if not blocked yet
      if (status !== 'blocked') {
        for (const cat of state.contentCategories) {
          if (cat.active) {
            for (const term of cat.defaultKeywords) {
              if (fullText.includes(term.toLowerCase())) {
                status = 'blocked';
                matchedRule = `Categoria: ${cat.name} (termo "${term}")`;
                break;
              }
            }
          }
          if (status === 'blocked') break;
        }
      }

      // Check for unverified status (neutral domain without protocol or path)
      if (status === 'allowed' && (!parsedUrl?.hostname || !parsedUrl.hostname.includes('.'))) {
        status = 'unverified';
        matchedRule = 'Domínio genérico não verificado completamente';
      }
    }

    const testRecord: UrlTestRecord = {
      id: `ut_${Date.now()}`,
      url: url,
      status: status,
      matchedRule: matchedRule || 'Nenhuma regra de bloqueio identificada',
      timestamp: Date.now(),
    };

    setLastTestResult(testRecord);
    onRunUrlTest(url);
  };

  const activeCategoriesCount = state.contentCategories.filter((c) => c.active).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck color="var(--primary-strawberry)" size={26} />
          Proteção de Conteúdo e Filtros de Segurança
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Configure restrições de categorias, palavras-chave personalizadas e teste diagnósticos da barreira de URLs.
        </p>

        {/* Reach and Limitations Disclaimer Banner */}
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--subtle-bg)',
            border: '1px solid var(--subtle-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <HelpCircle size={16} color="var(--accent-diamond)" />
            Esclarecimento Importante sobre Alcance e Limitações do Filtro:
          </div>
          <div>
            Esta aplicação web StrawHat gerencia as políticas e executa verificações reais em suas páginas internas e no testador de URLs. O bloqueio nativo em tempo real em navegadores externos (Chrome, Edge, Firefox) e outros aplicativos do sistema operacional necessita do módulo nativo Android (AccessibilityService e DeviceAdmin).
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} color="var(--accent-gold)" />
          Categorias de Restrição Configuráveis ({activeCategoriesCount} ativas)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {state.contentCategories.map((cat: ContentCategoryRule) => (
            <div
              key={cat.id}
              style={{
                background: 'var(--card-bg)',
                border: `1.5px solid ${cat.active ? 'var(--primary-strawberry)' : 'var(--subtle-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{cat.icon}</span>
                  <button
                    className={`btn ${cat.active ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => onToggleCategory(cat.id)}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    {cat.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  {cat.name}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0.75rem 0' }}>
                  {cat.description}
                </p>

                {/* Default Terms Tags */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <strong>Termos monitorados:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                    {cat.defaultKeywords.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          background: 'var(--subtle-bg)',
                          border: '1px solid var(--subtle-border)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Prohibited Keywords */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color="#e53e3e" />
          Palavras-Chave Personalizadas ({state.customKeywords.length} cadastradas)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Adicione termos específicos que deseja proibir na busca e navegação.
        </p>

        <form onSubmit={handleAddKeywordSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Ex: aposta, cassino, jogo, adult..."
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Adicionar Termo
          </button>
        </form>

        {state.customKeywords.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Nenhuma palavra-chave personalizada adicionada ainda.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {state.customKeywords.map((kw) => (
              <div
                key={kw}
                style={{
                  background: 'var(--badge-bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>🚫 {kw}</span>
                <button
                  onClick={() => onRemoveCustomKeyword(kw)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e53e3e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Remover termo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ETAPA 5: URL Barrier Tester Panel */}
      <div className="card" style={{ border: '2px solid var(--primary-strawberry)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={22} color="var(--primary-strawberry)" />
          Testador de Barreira URL (Diagnóstico de Filtro)
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Insira uma URL abaixo para verificar se ela seria permitida, bloqueada por regra ativa ou se há erro de formato.
        </p>

        {/* URL Test Form */}
        <form onSubmit={handleUrlTestSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            placeholder="Ex: https://cassino-online.com/bet ou https://youtube.com"
            value={testUrlInput}
            onChange={(e) => setTestUrlInput(e.target.value)}
            style={{ flex: 1, minWidth: '260px', fontSize: '0.95rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
            <Search size={18} /> Executar Teste de Barreira
          </button>
        </form>

        {/* Test Result Display Box */}
        {lastTestResult && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background:
                lastTestResult.status === 'blocked'
                  ? 'rgba(229, 62, 62, 0.12)'
                  : lastTestResult.status === 'allowed'
                  ? 'rgba(56, 161, 105, 0.12)'
                  : lastTestResult.status === 'error'
                  ? 'rgba(221, 107, 32, 0.12)'
                  : 'var(--subtle-bg)',
              border: `2px solid ${
                lastTestResult.status === 'blocked'
                  ? '#e53e3e'
                  : lastTestResult.status === 'allowed'
                  ? '#38a169'
                  : lastTestResult.status === 'error'
                  ? '#dd6b20'
                  : 'var(--subtle-border)'
              }`,
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {lastTestResult.status === 'blocked' && <XCircle size={28} color="#e53e3e" />}
              {lastTestResult.status === 'allowed' && <CheckCircle2 size={28} color="#38a169" />}
              {lastTestResult.status === 'error' && <AlertTriangle size={28} color="#dd6b20" />}
              {lastTestResult.status === 'unverified' && <HelpCircle size={28} color="var(--text-secondary)" />}

              <div>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                  {lastTestResult.status === 'blocked' && '🚫 URL BLOQUEADA PELA BARREIRA'}
                  {lastTestResult.status === 'allowed' && '✅ URL PERMITIDA'}
                  {lastTestResult.status === 'error' && '⚠️ ERRO: FORMATO DE URL INVÁLIDO'}
                  {lastTestResult.status === 'unverified' && '❓ URL NÃO VERIFICADA'}
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  URL Testada: <code>{lastTestResult.url}</code>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
              <strong>Resultado Detalhado:</strong> {lastTestResult.matchedRule}
            </div>
          </div>
        )}

        {/* Protection Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--subtle-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--subtle-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Categorias Ativas</div>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{activeCategoriesCount} ativas</strong>
          </div>

          <div style={{ background: 'var(--subtle-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--subtle-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Palavras-Chave Personalizadas</div>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{state.customKeywords.length} termos</strong>
          </div>

          <div style={{ background: 'var(--subtle-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--subtle-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Bloqueios de Acesso Impróprio</div>
            <strong style={{ fontSize: '1.1rem', color: '#e53e3e' }}>{state.blockedAccessCount} detectados</strong>
          </div>
        </div>

        {/* Local Test History Log Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={18} color="var(--accent-gold)" />
              Histórico Local das Últimas Tentativas de Teste
            </h4>
            {state.urlTestHistory.length > 0 && (
              <button className="btn btn-secondary" onClick={onClearUrlHistory} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                Limpar Histórico
              </button>
            )}
          </div>

          {state.urlTestHistory.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Nenhum teste de URL executado recentemente.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--subtle-bg)', borderBottom: '2px solid var(--subtle-border)' }}>
                    <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--text-primary)' }}>Data/Hora</th>
                    <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--text-primary)' }}>URL Testada</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center', color: 'var(--text-primary)' }}>Status</th>
                    <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--text-primary)' }}>Motivo / Regra</th>
                  </tr>
                </thead>
                <tbody>
                  {state.urlTestHistory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--subtle-border)' }}>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>
                        {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td style={{ padding: '0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.url}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              item.status === 'blocked'
                                ? 'rgba(229, 62, 62, 0.15)'
                                : item.status === 'allowed'
                                ? 'rgba(56, 161, 105, 0.15)'
                                : 'var(--subtle-bg)',
                            color:
                              item.status === 'blocked'
                                ? '#e53e3e'
                                : item.status === 'allowed'
                                ? '#38a169'
                                : 'var(--text-secondary)',
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{item.matchedRule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
