import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import SummaryIndicators from '@/components/SummaryIndicators';
import EventRow from '@/components/EventRow';
import EventForm from '@/components/EventForm';
import DemandForm from '@/components/DemandForm';
import { useSupabaseEventManager } from '@/hooks/useSupabaseEventManager';
import { Event, Demand, EventFormData, DemandFormData } from '@/types';

const Dashboard = () => {
  const {
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventPriority,
    addDemand,
    updateDemand,
    deleteDemand,
    getActiveEvents,
    getActiveDemands,
    getCompletedDemands,
    isLoading
  } = useSupabaseEventManager();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const activeEvents = getActiveEvents();
  const activeDemands = getActiveDemands();
  const completedDemands = getCompletedDemands();

  const handleEventSubmit = async (data: EventFormData) => {
    try {
      if (editingEvent) {
        // Para edição, só atualizar os campos que foram fornecidos
        const updateData: Partial<Event> = {
          name: data.name,
          date: data.date
        };
        
        // Só atualizar logo se um novo arquivo foi fornecido
        if (data.logo) {
          updateData.logo = URL.createObjectURL(data.logo);
        }
        
        await updateEvent(editingEvent.id, updateData);
        setEditingEvent(null);
      } else {
        await addEvent({
          name: data.name,
          date: data.date,
          logo: data.logo ? URL.createObjectURL(data.logo) : undefined,
          isArchived: false,
          isPriority: false
        });
      }
      setShowEventForm(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleDemandSubmit = async (data: DemandFormData) => {
    try {
      if (editingDemand) {
        await updateDemand(editingDemand.id, data);
        setEditingDemand(null);
      } else {
        await addDemand({
          ...data,
          eventId: selectedEventId,
          isCompleted: false,
          isArchived: false
        });
      }
      setShowDemandForm(false);
    } catch (error) {
      console.error('Erro ao salvar demanda:', error);
    }
  };

  const handleAddDemand = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDemandForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleEditDemand = (demand: Demand) => {
    setEditingDemand(demand);
    setShowDemandForm(true);
  };

  const handleArchiveEvent = async (id: string) => {
    try {
      await updateEvent(id, { isArchived: true });
    } catch (error) {
      console.error('Erro ao arquivar evento:', error);
    }
  };

  const handleCompleteDemand = async (id: string) => {
    try {
      await updateDemand(id, { isCompleted: true });
    } catch (error) {
      console.error('Erro ao completar demanda:', error);
    }
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const closeDemandForm = () => {
    setShowDemandForm(false);
    setEditingDemand(null);
    setSelectedEventId('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="glass rounded-xl p-8">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <Header />
      
      <SummaryIndicators
        totalEvents={activeEvents.length}
        pendingDemands={activeDemands.length}
        completedDemands={completedDemands.length}
        archivedEvents={0}
      />
      
      <div className="pt-24">
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm">Sistema sincronizado (polling a cada 5s)</span>
            </div>
            <button
              onClick={() => setShowEventForm(true)}
              className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-500/30 transition-all"
            >
              <Plus size={16} className="text-blue-300" />
              <span className="text-white">Novo Evento</span>
            </button>
          </div>

          <div className="space-y-4">
            {activeEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                demands={getActiveDemands(event.id)}
                onAddDemand={handleAddDemand}
                onEditEvent={handleEditEvent}
                onArchiveEvent={handleArchiveEvent}
                onDeleteEvent={deleteEvent}
                onTogglePriority={toggleEventPriority}
                onEditDemand={handleEditDemand}
                onCompleteDemand={handleCompleteDemand}
                onDeleteDemand={deleteDemand}
              />
            ))}

            {activeEvents.length === 0 && (
              <div className="glass rounded-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum evento cadastrado</h3>
                  <p className="text-blue-200/70 mb-6">
                    Comece criando seu primeiro evento para organizar suas demandas
                  </p>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="glass-button px-6 py-3 rounded-lg hover:bg-blue-500/30 transition-all"
                  >
                    <span className="text-white font-medium">Criar Primeiro Evento</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventForm
        isOpen={showEventForm}
        onClose={closeEventForm}
        onSubmit={handleEventSubmit}
        initialData={editingEvent || undefined}
      />

      <DemandForm
        isOpen={showDemandForm}
        onClose={closeDemandForm}
        onSubmit={handleDemandSubmit}
        initialData={editingDemand || undefined}
      />
    </div>
  );
};

export default Dashboard;
