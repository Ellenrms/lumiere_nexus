import { Card } from "@/components/ui/Card";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: 'Pacientes Ativos', value: '124', icon: Users, change: '+12%' },
    { label: 'Agendamentos Hoje', value: '8', icon: Calendar, change: '4 pendentes' },
    { label: 'Faturamento Mês', value: 'R$ 42.500', icon: TrendingUp, change: '+18.2%' },
    { label: 'Tempo Médio Proc.', value: '45 min', icon: Clock, change: '-5 min' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-page-title text-ebony">Dashboard Overview</h1>
          <p className="text-sm text-mid-gray">Bem-vinda ao seu centro de controle Lumière</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-mahogany uppercase tracking-widest">Sexta-feira, 3 de Abril</p>
          <p className="text-lg font-serif italic text-bronze">Nexus Lab AI Edition</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} variant="premium" className="group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-chrome rounded-lg group-hover:bg-sand transition-colors">
                <stat.icon size={20} className="text-bronze" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-sans text-mid-gray uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-serif text-ebony mt-1">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <Card variant="premium" className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif text-ebony">Próximos Atendimentos</h2>
            <button className="text-bronze hover:text-ebony transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-sand/30 transition-all border border-transparent hover:border-sand group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-mahogany font-serif">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ebony">Maria Clara Gonçalves</p>
                    <p className="text-xs text-mid-gray italic">Botox - Região Frontal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ebony">14:30</p>
                  <p className="text-[10px] uppercase text-bronze font-bold">Confirmado</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 border-t border-sand text-sm font-medium text-mid-gray hover:text-bronze transition-colors">
            Ver agenda completa
          </button>
        </Card>

        {/* Quick Actions / Revenue Insights */}
        <Card variant="premium" className="bg-ebony text-chrome border-none shadow-xl">
          <h2 className="text-lg font-serif mb-6">Análise Rápida</h2>
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-chrome/40 uppercase tracking-widest mb-1">Destaque do Dia</p>
              <p className="text-sm leading-relaxed text-chrome/80">
                O procedimento de <span className="text-champagne font-bold">Harmonização Facial</span> teve um aumento de 25% na procura esta semana.
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full flex justify-between items-center p-4 rounded-xl bg-bronze text-white hover:bg-bronze/90 transition-all">
                <span className="text-sm font-medium">Novo Agendamento</span>
                <ArrowUpRight size={18} />
              </button>
              <button className="w-full flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                <span className="text-sm font-medium">Cadastrar Paciente</span>
                <Users size={18} className="text-champagne" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
