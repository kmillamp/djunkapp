import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock,
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner';

interface Event {
  id: string
  dj_id: string
  event_name: string
  event_date: string
  description?: string
  producer?: string
  venue?: string
  fee: number
  payment_status: string
  payment_proof?: string
  shared_with_manager: boolean
  created_by: string
  created_at?: string
  updated_at?: string
}

export const Agenda: React.FC = () => {
  const { user, djProfile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('events')
        .select('*')
      
      // Se não for admin, filtra apenas os eventos do usuário
      if (!djProfile?.is_admin) {
        query = query.eq('dj_id', user?.id)
      }
      
      const { data, error } = await query
        .order('event_date', { ascending: true })
      
      if (error) {
        throw error
      }
      
      setEvents(data || [])
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      toast.error('Erro ao carregar agenda')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: any) => {
    try {
      const newEvent = {
        dj_id: djProfile?.is_admin ? eventData.dj_id : user?.id,
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        description: eventData.description,
        producer: eventData.producer,
        venue: eventData.venue,
        fee: Number(eventData.fee),
        payment_status: 'pendente',
        shared_with_manager: eventData.shared_with_manager || false,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single()

      if (eventError) {
        throw eventError
      }

      // Criar transação financeira automática
      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([{
          user_id: newEvent.dj_id,
          type: 'cache',
          amount: newEvent.fee,
          description: `Cachê ${newEvent.event_name}`,
          category: 'evento',
          event_id: eventResult.id,
          is_recurring: false,
          created_at: new Date().toISOString()
        }])

      if (transactionError) {
        console.error('Erro ao criar transação:', transactionError)
      }

      await fetchEvents()
      setShowCreateForm(false)
      toast.success('Evento criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      alert('Erro ao criar evento')
    }
  }

  const updatePaymentStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) {
        throw error
      }
      
      await fetchEvents()
      toast.success('Status de pagamento atualizado!')
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
      toast.error('Erro ao atualizar pagamento')
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return

    try {
      // Excluir transações relacionadas primeiro
      await supabase
        .from('financial_transactions')
        .delete()
        .eq('event_id', eventId)

      // Excluir o evento
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        throw error
      }

      await fetchEvents()
      toast.success('Evento excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      toast.error('Erro ao excluir evento')
    }
  }

  const updateEvent = async (eventId: string, eventData: any) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) {
        throw error
      }

      await fetchEvents()
      setSelectedEvent(null)
      toast.success('Evento atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      toast.error('Erro ao atualizar evento')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-gray-400">Gerencie seus eventos e shows</p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg"
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={24} />
        </motion.button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Calendar size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum evento agendado</p>
            <p className="text-gray-500">Crie seu primeiro evento!</p>
          </motion.div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              className={`bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 ${
                isEventPast(event.event_date) ? 'opacity-60' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {event.event_name}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <Calendar size={16} className="mr-2 text-purple-400" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    
                    {event.venue && (
                      <div className="flex items-center text-gray-300">
                        <MapPin size={16} className="mr-2 text-green-400" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-300">
                      <DollarSign size={16} className="mr-2 text-yellow-400" />
                      <span>{formatCurrency(event.fee)}</span>
                    </div>
                    
                    {event.producer && (
                      <div className="flex items-center text-gray-300">
                        <Clock size={16} className="mr-2 text-blue-400" />
                        <span>{event.producer}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {/* Payment Status */}
                  <div className="flex items-center space-x-2">
                    {event.payment_status === 'pago' ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <AlertCircle size={16} className="text-yellow-400" />
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      event.payment_status === 'pago'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {event.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>

                  {/* Shared Status */}
                  {event.shared_with_manager && (
                    <div className="flex items-center text-purple-400">
                      <Share2 size={14} className="mr-1" />
                      <span className="text-xs">Compartilhado</span>
                    </div>
                  )}
                </div>
              </div>

              {event.description && (
                <p className="text-gray-400 text-sm mb-4 bg-gray-700/30 rounded-lg p-3">
                  {event.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                <div className="flex space-x-2">
                  {djProfile?.is_admin && event.payment_status === 'pendente' && (
                    <motion.button
                      onClick={() => updatePaymentStatus(event.id, 'pago')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      Marcar como Pago
                    </motion.button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => setSelectedEvent(event)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit size={16} />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => deleteEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateEventModal
            onClose={() => setShowCreateForm(false)}
            onSubmit={createEvent}
            isAdmin={djProfile?.is_admin || false}
          />
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EditEventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSubmit={(data) => updateEvent(selectedEvent.id, data)}
            isAdmin={djProfile?.is_admin || false}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Event Modal Component
const CreateEventModal: React.FC<{
  onClose: () => void
  onSubmit: (data: any) => void
  isAdmin: boolean
}> = ({ onClose, onSubmit, isAdmin }) => {
  const [formData, setFormData] = useState({
    dj_id: '',
    event_name: '',
    event_date: '',
    description: '',
    producer: '',
    venue: '',
    fee: '',
    shared_with_manager: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-bold text-white mb-6">Novo Evento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nome do Evento
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Local
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Produtor
            </label>
            <input
              type="text"
              value={formData.producer}
              onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Cachê (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="shared"
              checked={formData.shared_with_manager}
              onChange={(e) => setFormData({ ...formData, shared_with_manager: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="shared" className="text-gray-300 text-sm">
              Compartilhar com manager
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Criar Evento
            </motion.button>
            
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-2 rounded-lg font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Edit Event Modal Component
const EditEventModal: React.FC<{
  event: Event
  onClose: () => void
  onSubmit: (data: any) => void
  isAdmin: boolean
}> = ({ event, onClose, onSubmit, isAdmin }) => {
  const [formData, setFormData] = useState({
    event_name: event.event_name,
    event_date: event.event_date,
    description: event.description || '',
    producer: event.producer || '',
    venue: event.venue || '',
    fee: event.fee.toString(),
    shared_with_manager: event.shared_with_manager
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      fee: Number(formData.fee)
    })
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-bold text-white mb-6">Editar Evento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Nome do Evento
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Local
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Produtor
            </label>
            <input
              type="text"
              value={formData.producer}
              onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Cachê (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="shared-edit"
              checked={formData.shared_with_manager}
              onChange={(e) => setFormData({ ...formData, shared_with_manager: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="shared-edit" className="text-gray-300 text-sm">
              Compartilhar com manager
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Salvar Alterações
            </motion.button>
            
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-2 rounded-lg font-medium"
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default Agenda