import React, { useState } from 'react';
import { AppState, DailyUsageRecord } from '../types';
import { BarChart3, Flame, Coins, Sprout, ShieldAlert, History, Calendar, CheckCircle2, AlertTriangle, HelpCircle, Info } from 'lucide-react';
import { formatMinutesToHoursMin } from '../utils/timeUtils';

interface StatsScreenProps {
  state: AppState;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ state }) => {
  const stats = state.userStats;

  // Convert dailyUsageHistory object to array ordered Monday (1) to Sunday (0)
  const historyList: DailyUsageRecord[] = Object.values(state.dailyUsageHistory || {}).sort((a, b) => {
    // Sort Monday (1) to Saturday (6), then Sunday (0)
    const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return orderA - orderB;
  });

  // Default selected day is today or first available
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultSelected = historyList.find((h) => h.date === todayStr) || historyList[0] || null;
  const [selectedDay, setSelectedDay] = useState<DailyUsageRecord | null>(defaultSelected);

  // Compute Weekly Metrics
  const activeDaysWithData = historyList.filter((h) => h.hasRealData);
  const totalWeeklyMinutes = historyList.reduce((sum, h) => sum + (h.hasRealData ? h.timeUsedMinutes : 0), 0);
  const daysWithDataCount = Math.max(1, activeDaysWithData.length);
  const dailyAverageMinutes = Math.round(totalWeeklyMinutes / daysWithDataCount);

  const daysWithinLimitCount = activeDaysWithData.filter((h) => h.timeUsedMinutes <= h.dailyLimitMinutes).length;
  const daysExceedingLimitCount = activeDaysWithData.filter((h) => h.timeUsedMinutes > h.dailyLimitMinutes).length;

  // Max value for bar scaling (minimum 120 mins)
  const maxMinutesInChart = Math.max(
    120,
    ...historyList.map((h) => Math.max(h.timeUsedMinutes, h.dailyLimitMinutes))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div className="card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 color="var(--primary-strawberry)" size={24} />
          Estatísticas Semanais de Tempo de Tela e Disciplina
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Acompanhe o gráfico diário de uso de Segunda a Domingo, comparando o uso real com o limite configurado.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--badge-bg)', borderRadius: 'var(--radius-md)', color: '#dd6b20' }}>
            <Flame size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sequência / Recorde</div>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {state.streakDays} dias <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Recorde: {stats.maxStreakDays}d)</span>
            </strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--subtle-bg)', borderRadius: 'var(--radius-md)', color: 'var(--foliage-green)' }}>
            <BarChart3 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Semanal / Média</div>
            <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {formatMinutesToHoursMin(totalWeeklyMinutes)} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Média: {formatMinutesToHoursMin(dailyAverageMinutes)}/dia)</span>
            </strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--subtle-bg)', borderRadius: 'var(--radius-md)', color: '#38a169' }}>
            <CheckCircle2 size={28} color="#38a169" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dias Dentro do Limite</div>
            <strong style={{ fontSize: '1.2rem', color: '#38a169' }}>
              {daysWithinLimitCount} de {activeDaysWithData.length} dias registrados
            </strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--subtle-bg)', borderRadius: 'var(--radius-md)', color: 'var(--primary-strawberry)' }}>
            <AlertTriangle size={28} color="var(--primary-strawberry)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dias Acima do Limite</div>
            <strong style={{ fontSize: '1.2rem', color: 'var(--primary-strawberry)' }}>
              {daysExceedingLimitCount} dias ultrapassados
            </strong>
          </div>
        </div>
      </div>

      {/* Weekly Bar Chart Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={20} color="var(--primary-strawberry)" />
            Gráfico de Tempo de Tela (Segunda a Domingo)
          </h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Clique em uma barra para ver os detalhes do dia
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#38a169' }} />
            <span style={{ color: 'var(--text-primary)' }}>Limite Respeitado</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e53e3e' }} />
            <span style={{ color: 'var(--text-primary)' }}>Limite Ultrapassado</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--subtle-border)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Sem Registros no App</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '16px', height: '2px', background: '#dd6b20' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Linha de Limite do Dia</span>
          </div>
        </div>

        {/* Bars Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.75rem',
            alignItems: 'end',
            minHeight: '220px',
            padding: '1rem 0.5rem',
            background: 'var(--subtle-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--subtle-border)',
          }}
        >
          {historyList.map((day) => {
            const isSelected = selectedDay?.date === day.date;
            const usagePercent = Math.min(100, (day.timeUsedMinutes / maxMinutesInChart) * 100);
            const limitPercent = Math.min(100, (day.dailyLimitMinutes / maxMinutesInChart) * 100);

            const isOver = day.hasRealData && day.timeUsedMinutes > day.dailyLimitMinutes;
            const isOk = day.hasRealData && day.timeUsedMinutes <= day.dailyLimitMinutes;

            let barColor = 'var(--subtle-border)';
            if (isOk) barColor = '#38a169';
            if (isOver) barColor = '#e53e3e';

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay(day)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--badge-bg)' : 'transparent',
                  border: isSelected ? '2px solid var(--primary-strawberry)' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Hours Label above bar */}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', height: '18px' }}>
                  {day.hasRealData ? formatMinutesToHoursMin(day.timeUsedMinutes) : '—'}
                </div>

                {/* Bar Box */}
                <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                  {/* Limit Reference Line */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `${limitPercent}%`,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: '#dd6b20',
                      zIndex: 2,
                    }}
                    title={`Limite: ${formatMinutesToHoursMin(day.dailyLimitMinutes)}`}
                  />

                  {/* Main Usage Bar */}
                  <div
                    style={{
                      width: '70%',
                      maxWidth: '36px',
                      height: day.hasRealData ? `${Math.max(6, usagePercent)}%` : '10%',
                      background: barColor,
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      opacity: day.hasRealData ? 1 : 0.4,
                      transition: 'height 0.4s ease',
                    }}
                  />
                </div>

                {/* Day Label */}
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
                    {day.dayName.slice(0, 3)}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {day.date.slice(8, 10)}/{day.date.slice(5, 7)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details Panel */}
        {selectedDay && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              background: 'var(--subtle-bg)',
              border: '1px solid var(--subtle-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Detalhes de {selectedDay.dayName} ({selectedDay.date})
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedDay.hasRealData ? (
                    <span style={{ color: '#38a169', fontWeight: 700 }}>● Registros Ativos do StrawHat App</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>○ Nenhum tempo de tela registrado neste dia</span>
                  )}
                </div>
              </div>

              {selectedDay.hasRealData && (
                <div
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: selectedDay.timeUsedMinutes <= selectedDay.dailyLimitMinutes ? 'rgba(56, 161, 105, 0.15)' : 'rgba(229, 62, 62, 0.15)',
                    color: selectedDay.timeUsedMinutes <= selectedDay.dailyLimitMinutes ? '#38a169' : '#e53e3e',
                  }}
                >
                  {selectedDay.timeUsedMinutes <= selectedDay.dailyLimitMinutes ? '✔ Limite Respeitado' : '✖ Limite Ultrapassado'}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--card-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--subtle-border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tempo de Uso Real:</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {selectedDay.hasRealData ? formatMinutesToHoursMin(selectedDay.timeUsedMinutes) : '0 min'}
                </strong>
              </div>

              <div style={{ background: 'var(--card-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--subtle-border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Limite Configurado:</div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {formatMinutesToHoursMin(selectedDay.dailyLimitMinutes)}
                </strong>
              </div>

              <div style={{ background: 'var(--card-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--subtle-border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Diferença / Saldo:</div>
                <strong
                  style={{
                    fontSize: '1.1rem',
                    color: selectedDay.timeUsedMinutes <= selectedDay.dailyLimitMinutes ? '#38a169' : '#e53e3e',
                  }}
                >
                  {selectedDay.timeUsedMinutes <= selectedDay.dailyLimitMinutes
                    ? `-${formatMinutesToHoursMin(selectedDay.dailyLimitMinutes - selectedDay.timeUsedMinutes)} de folga`
                    : `+${formatMinutesToHoursMin(selectedDay.timeUsedMinutes - selectedDay.dailyLimitMinutes)} acima`}
                </strong>
              </div>
            </div>

            {/* Apps breakdown */}
            {selectedDay.appsBreakdown && selectedDay.appsBreakdown.length > 0 && (
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Divisão de Uso por Aplicativo no Dia:
                </strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedDay.appsBreakdown.map((app) => (
                    <div
                      key={app.name}
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--subtle-border)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {app.name}: <strong>{formatMinutesToHoursMin(app.minutes)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transparency note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--subtle-bg)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
          <Info size={16} color="var(--accent-diamond)" />
          <span>
            <strong>Nota de Transparência de Dados:</strong> O StrawHat registra o uso ativo capturado no aplicativo. Dias sem utilização ou sem dados gravados no banco local são exibidos como "Sem Registros".
          </span>
        </div>
      </div>

      {/* Sales History Log Table */}
      <div className="card">
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <History size={20} color="var(--accent-gold)" />
          Histórico de Vendas de Morangos
        </h4>

        {state.salesHistory.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Nenhuma venda registrada ainda. Colha frutos e venda-os no inventário!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--subtle-bg)', borderBottom: '2px solid var(--subtle-border)' }}>
                  <th style={{ padding: '0.65rem', textAlign: 'left', color: 'var(--text-primary)' }}>Data/Hora</th>
                  <th style={{ padding: '0.65rem', textAlign: 'left', color: 'var(--text-primary)' }}>Fruto</th>
                  <th style={{ padding: '0.65rem', textAlign: 'center', color: 'var(--text-primary)' }}>Raridade</th>
                  <th style={{ padding: '0.65rem', textAlign: 'center', color: 'var(--text-primary)' }}>Quantidade</th>
                  <th style={{ padding: '0.65rem', textAlign: 'right', color: 'var(--text-primary)' }}>Moedas Obtidas</th>
                </tr>
              </thead>
              <tbody>
                {state.salesHistory.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--subtle-border)' }}>
                    <td style={{ padding: '0.65rem', color: 'var(--text-secondary)' }}>
                      {new Date(sale.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.65rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sale.fruitName}</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: 'var(--text-primary)' }}>{sale.rarity.toUpperCase()}</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', color: 'var(--text-primary)' }}>{sale.quantity}</td>
                    <td style={{ padding: '0.65rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      +{sale.totalCoins} moedas
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

