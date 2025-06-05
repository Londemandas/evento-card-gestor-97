
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, Demand } from '@/types';

export const useEventManager = () => {
  const queryClient = useQueryClient();

  // Query para eventos
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('Buscando eventos...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(event => ({
        id: event.id,
        name: event.name,
        date: new Date(event.date),
        logo: event.logo,
        isArchived: event.is_archived || false,
        isPriority: event.is_priority || false,
        priorityOrder: event.priority_order,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at)
      })) as Event[];
    }
  });

  // Query para demandas
  const { data: demands = [], isLoading: demandsLoading } = useQuery({
    queryKey: ['demands'],
    queryFn: async () => {
      console.log('Buscando demandas...');
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(demand => ({
        id: demand.id,
        eventId: demand.event_id,
        title: demand.title,
        subject: demand.subject,
        date: new Date(demand.date),
        isCompleted: demand.is_completed || false,
        isArchived: demand.is_archived || false,
        createdAt: new Date(demand.created_at),
        updatedAt: new Date(demand.updated_at)
      })) as Demand[];
    }
  });

  // Função para adicionar evento
  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Adicionando evento:', eventData);
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: eventData.name,
        date: eventData.date.toISOString(),
        logo: eventData.logo,
        is_archived: eventData.isArchived,
        is_priority: eventData.isPriority,
        priority_order: eventData.priorityOrder
      })
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['events'] });
    return data;
  }, [queryClient]);

  // Função para atualizar evento
  const updateEvent = useCallback(async (id: string, updates: Partial<Event>) => {
    console.log('Atualizando evento:', id, updates);
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.date !== undefined) updateData.date = updates.date.toISOString();
    if (updates.logo !== undefined) updateData.logo = updates.logo;
    if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;
    if (updates.isPriority !== undefined) updateData.is_priority = updates.isPriority;
    if (updates.priorityOrder !== undefined) updateData.priority_order = updates.priorityOrder;

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [queryClient]);

  // Função para deletar evento
  const deleteEvent = useCallback(async (id: string) => {
    console.log('Deletando evento:', id);
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['demands'] });
  }, [queryClient]);

  // Função para alternar prioridade do evento
  const toggleEventPriority = useCallback(async (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    if (event.isPriority) {
      await updateEvent(id, { isPriority: false, priorityOrder: undefined });
    } else {
      const maxPriorityOrder = Math.max(
        ...events.filter(e => e.isPriority).map(e => e.priorityOrder || 0),
        0
      );
      await updateEvent(id, { 
        isPriority: true, 
        priorityOrder: maxPriorityOrder + 1 
      });
    }
  }, [events, updateEvent]);

  // Função para adicionar demanda
  const addDemand = useCallback(async (demandData: Omit<Demand, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Adicionando demanda:', demandData);
    const { data, error } = await supabase
      .from('demands')
      .insert({
        event_id: demandData.eventId,
        title: demandData.title,
        subject: demandData.subject,
        date: demandData.date.toISOString(),
        is_completed: demandData.isCompleted,
        is_archived: demandData.isArchived
      })
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['demands'] });
    return data;
  }, [queryClient]);

  // Função para atualizar demanda
  const updateDemand = useCallback(async (id: string, updates: Partial<Demand>) => {
    console.log('Atualizando demanda:', id, updates);
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.date !== undefined) updateData.date = updates.date.toISOString();
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
    if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;

    const { error } = await supabase
      .from('demands')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['demands'] });
  }, [queryClient]);

  // Função para deletar demanda
  const deleteDemand = useCallback(async (id: string) => {
    console.log('Deletando demanda:', id);
    const { error } = await supabase
      .from('demands')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['demands'] });
  }, [queryClient]);

  // Funções auxiliares
  const getActiveEvents = useCallback(() => {
    const activeEvents = events.filter(event => !event.isArchived);
    
    const priorityEvents = activeEvents
      .filter(event => event.isPriority)
      .sort((a, b) => (a.priorityOrder || 0) - (b.priorityOrder || 0));
    
    const normalEvents = activeEvents
      .filter(event => !event.isPriority)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return [...priorityEvents, ...normalEvents];
  }, [events]);

  const getArchivedEvents = useCallback(() => 
    events.filter(event => event.isArchived), [events]);
  
  const getActiveDemands = useCallback((eventId?: string) => {
    const activeDemands = demands.filter(demand => 
      !demand.isCompleted && 
      !demand.isArchived && 
      (eventId ? demand.eventId === eventId : true)
    );

    return activeDemands.sort((a, b) => {
      const getUrgencyScore = (demand: Demand) => {
        const today = new Date();
        const demandDate = new Date(demand.date);
        const diffDays = Math.ceil((demandDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays < 0) return 3;
        if (diffDays <= 3) return 2;
        return 1;
      };

      const scoreA = getUrgencyScore(a);
      const scoreB = getUrgencyScore(b);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      return a.date.getTime() - b.date.getTime();
    });
  }, [demands]);
    
  const getCompletedDemands = useCallback((eventId?: string) => 
    demands.filter(demand => 
      demand.isCompleted && 
      (eventId ? demand.eventId === eventId : true)
    ), [demands]);

  return {
    events,
    demands,
    isLoading: eventsLoading || demandsLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventPriority,
    addDemand,
    updateDemand,
    deleteDemand,
    getActiveEvents,
    getArchivedEvents,
    getActiveDemands,
    getCompletedDemands
  };
};
