
import React from 'react';
import { RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { useEventManager } from '@/hooks/useEventManager';

const CompletedDemands = () => {
  const { 
    getActiveEvents, 
    getCompletedDemands, 
    updateDemand, 
    deleteDemand,
    isLoading 
  } = useEventManager();
  
  const activeEvents = getActiveEvents();
  const completedDemands = getCompletedDemands();

  const handleRestore = async (id: string) => {
    try {
      await updateDemand(id, { isCompleted: false });
    } catch (error) {
      console.error('Erro ao restaurar demanda:', error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente esta demanda? Esta ação não pode ser desfeita.')) {
      try {
        await deleteDemand(id);
      } catch (error) {
        console.error('Erro ao excluir demanda:', error);
      }
    }
  };

  const groupedDemands = activeEvents.reduce((acc, event) => {
    const eventDemands = completedDemands.filter(demand => demand.eventId === event.id);
    if (eventDemands.length > 0) {
      acc[event.id] = {
        event,
        demands: eventDemands
      };
    }
    return acc;
  }, {} as Record<string, { event: any, demands: any[] }>);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="glass rounded-xl p-8">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Carregando demandas concluídas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      
      <div className="pt-24 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Demandas Concluídas</h1>
          <p className="text-blue-200/70">Gerencie suas demandas concluídas organizadas por evento</p>
        </div>

        {Object.keys(groupedDemands).length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-green-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma demanda concluída</h3>
              <p className="text-blue-200/70">
                As demandas concluídas aparecerão aqui organizadas por evento
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedDemands).map(({ event, demands }) => (
              <div key={event.id} className="glass rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center overflow-hidden">
                    {event.logo ? (
                      <img src={event.logo} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-green-300 font-bold text-sm">
                          {event.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium text-lg">{event.name}</h3>
                    <p className="text-blue-200/70 text-sm">
                      {demands.length} demanda{demands.length !== 1 ? 's' : ''} concluída{demands.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {demands.map((demand) => (
                    <div key={demand.id} className="glass-card rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <h4 className="text-white font-medium">{demand.title}</h4>
                          </div>
                          <p className="text-blue-200/70 text-sm mb-2">{demand.subject}</p>
                          <p className="text-blue-300 text-xs">
                            Concluída em: {demand.date.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleRestore(demand.id)}
                            className="glass-button p-2 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            <RotateCcw size={14} className="text-blue-300" />
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete(demand.id)}
                            className="glass-button p-2 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 size={14} className="text-red-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedDemands;
