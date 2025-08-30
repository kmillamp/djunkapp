import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Target, Plus, Calendar, Edit, Trash2, PiggyBank, Receipt, Repeat, CreditCard, Upload, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  is_recurring?: boolean;
}

interface FinancialGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  category?: string;
}

export default function UnkashPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [recurringBills, setRecurringBills] = useState([]);
  const [cacheEvents, setCacheEvents] = useState([]);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [billFormData, setBillFormData] = useState({
    title: "",
    amount: 0,
    category: "",
    due_day: 1
  });
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: "income",
    amount: 0,
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    is_recurring: false
  });

  const [goalFormData, setGoalFormData] = useState<Partial<FinancialGoal>>({
    title: "",
    currentAmount: 0,
    targetAmount: 0,
    deadline: "",
    category: ""
  });

  
  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading, selectedMonth]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [year, month] = selectedMonth.split('-').map(Number);
      
      // Carregar transações do mês selecionado
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Carregar metas financeiras
      const { data: goalsData, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Carregar contas recorrentes
      const { data: billsData, error: billsError } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('due_day', { ascending: true });

      if (billsError) throw billsError;

      // Carregar eventos de cachê
      const { data: eventsData, error: eventsError } = await supabase
        .from('eventos')
        .select('*')
        .eq('user_id', user.id)
        .not('cache', 'is', null)
        .order('event_date', { ascending: false });

      if (eventsError) throw eventsError;

      setTransactions((transactionsData || []).map(t => ({
        id: t.id,
        type: t.type as "income" | "expense",
        amount: Number(t.amount),
        description: t.description,
        category: t.category,
        date: t.date,
        is_recurring: t.is_recurring
      })));
      
      setFinancialGoals(goalsData?.map(goal => ({
        id: goal.id,
        title: goal.title,
        currentAmount: Number(goal.current_amount),
        targetAmount: Number(goal.target_amount),
        deadline: goal.deadline || '',
        category: goal.category || ''
      })) || []);

      setRecurringBills(billsData || []);
      setCacheEvents(eventsData || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const resetTransactionForm = () => {
    setFormData({
      type: "income",
      amount: 0,
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      is_recurring: false
    });
    setEditingTransaction(null);
  };

  const resetGoalForm = () => {
    setGoalFormData({
      title: "",
      currentAmount: 0,
      targetAmount: 0,
      deadline: "",
      category: ""
    });
    setEditingGoal(null);
  };

  const handleSubmitTransaction = async () => {
    if (!formData.amount || !formData.description || !formData.category || !user) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    
    try {
      const transactionData = {
        user_id: user.id,
        type: formData.type || 'income',
        amount: Number(formData.amount),
        description: formData.description || '',
        category: formData.category || '',
        date: formData.date || new Date().toISOString().split("T")[0],
        is_recurring: formData.is_recurring || false
      };

      let result;
      if (editingTransaction) {
        // Atualizar transação existente
        result = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id)
          .eq('user_id', user.id);
      } else {
        // Criar nova transação
        result = await supabase
          .from('transactions')
          .insert([transactionData]);
      }

      if (result.error) throw result.error;

      toast.success(editingTransaction ? 'Transação atualizada!' : 'Transação criada!');
      
      // Recarregar dados
      await loadData();
      
      resetTransactionForm();
      setTransactionDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast.error('Erro ao salvar transação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitGoal = async () => {
    if (!goalFormData.title || !goalFormData.targetAmount || !user) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    
    try {
      const goalData = {
        user_id: user.id,
        title: goalFormData.title || '',
        current_amount: Number(goalFormData.currentAmount || 0),
        target_amount: Number(goalFormData.targetAmount),
        deadline: goalFormData.deadline || null,
        category: goalFormData.category || null
      };

      let result;
      if (editingGoal) {
        // Atualizar meta existente
        result = await supabase
          .from('financial_goals')
          .update(goalData)
          .eq('id', editingGoal.id)
          .eq('user_id', user.id);
      } else {
        // Criar nova meta
        result = await supabase
          .from('financial_goals')
          .insert([goalData]);
      }

      if (result.error) throw result.error;

      toast.success(editingGoal ? 'Meta atualizada!' : 'Meta criada!');
      
      // Recarregar dados
      await loadData();
      
      resetGoalForm();
      setGoalDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast.error('Erro ao salvar meta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      is_recurring: transaction.is_recurring || false
    });
    setTransactionDialogOpen(true);
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setGoalFormData({
      title: goal.title,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline,
      category: goal.category || ""
    });
    setGoalDialogOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?') || !user) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadData();
      toast.success('Transação excluída!');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?') || !user) return;
    
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadData();
      toast.success('Meta excluída!');
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao excluir meta');
    }
  };

  const handleSubmitBill = async () => {
    if (!billFormData.title || !billFormData.amount || !billFormData.category || !user) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSaving(true);
    
    try {
      const billData = {
        user_id: user.id,
        title: billFormData.title,
        amount: Number(billFormData.amount),
        category: billFormData.category,
        due_day: billFormData.due_day
      };

      let result;
      if (editingBill) {
        result = await supabase
          .from('recurring_bills')
          .update(billData)
          .eq('id', editingBill.id)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('recurring_bills')
          .insert([billData]);
      }

      if (result.error) throw result.error;

      toast.success(editingBill ? 'Conta atualizada!' : 'Conta criada!');
      
      await loadData();
      setBillDialogOpen(false);
      setEditingBill(null);
      setBillFormData({ title: "", amount: 0, category: "", due_day: 1 });
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      toast.error('Erro ao salvar conta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?') || !user) return;
    
    try {
      const { error } = await supabase
        .from('recurring_bills')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadData();
      toast.success('Conta excluída!');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-4 text-green-400 animate-spin" />
          <p className="text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Faça login para acessar o Unkash</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 px-4">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center pt-6 mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-400 mb-2">Unkash</h1>
          <p className="text-gray-400 text-sm">Sistema Financeiro</p>
        </div>

        {/* Month Selector */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Período</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  const newDate = new Date(year, month - 2);
                  setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white font-medium min-w-[100px] text-center">
                {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              <button
                onClick={() => {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  const newDate = new Date(year, month);
                  setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          {[
            { id: "overview", label: "Geral", icon: DollarSign },
            { id: "transactions", label: "Transações", icon: Receipt },
            { id: "recurring", label: "Recorrentes", icon: Repeat },
            { id: "cache", label: "Cachê", icon: CreditCard },
            { id: "goals", label: "Metas", icon: Target }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-400/20 text-green-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Financial Overview */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-gray-400 text-xs">Saldo</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-white truncate">{formatCurrency(balance)}</p>
                <p className="text-green-400 text-xs">Total</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-gray-400 text-xs">Receita</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-white truncate">{formatCurrency(totalIncome)}</p>
                <p className="text-blue-400 text-xs">Total</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  <span className="text-gray-400 text-xs">Despesas</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-white truncate">{formatCurrency(totalExpenses)}</p>
                <p className="text-red-400 text-xs">Total</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-gray-400 text-xs">Metas</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-white">{financialGoals.length}</p>
                <p className="text-yellow-400 text-xs">Ativas</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                onClick={() => {
                  resetTransactionForm();
                  setTransactionDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Nova Transação
              </button>
              <button 
                className="border border-gray-600 hover:bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                onClick={() => {
                  resetGoalForm();
                  setGoalDialogOpen(true);
                }}
              >
                <Target className="w-4 h-4" />
                Nova Meta
              </button>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 text-base font-semibold">Transações</h3>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                  onClick={() => {
                    resetTransactionForm();
                    setTransactionDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nova
                </button>
              </div>
              
              <div className="space-y-3">
                 {transactions.map(transaction => (
                   <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700 gap-3 sm:gap-0">
                     <div className="flex items-center gap-3 min-w-0 flex-1">
                       <div className={`w-3 h-3 rounded-full flex-shrink-0 ${transaction.type === "income" ? "bg-green-400" : "bg-red-400"}`}></div>
                       <div className="min-w-0 flex-1">
                         <p className="text-white font-medium text-sm truncate">{transaction.description}</p>
                         <div className="flex flex-wrap items-center gap-2 text-gray-400 text-xs mt-1">
                           <span className="bg-gray-700 px-2 py-1 rounded text-xs whitespace-nowrap">
                             {transaction.category}
                           </span>
                           <div className="flex items-center gap-1">
                             <Calendar className="w-3 h-3" />
                             <span className="whitespace-nowrap">{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center justify-between sm:justify-end gap-2">
                       <span className={`font-bold text-sm ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                         {transaction.type === "income" ? "+" : "-"}
                         {formatCurrency(transaction.amount)}
                       </span>
                       <div className="flex items-center gap-1">
                         <button 
                           onClick={() => handleEditTransaction(transaction)} 
                           className="text-blue-400 hover:text-blue-300 p-1"
                         >
                           <Edit className="w-3 h-3" />
                         </button>
                         <button 
                           onClick={() => handleDeleteTransaction(transaction.id)} 
                           className="text-red-400 hover:text-red-300 p-1"
                         >
                           <Trash2 className="w-3 h-3" />
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
                
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400 text-sm">Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recurring Bills Tab */}
        {activeTab === "recurring" && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 text-base font-semibold">Contas Recorrentes</h3>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                  onClick={() => {
                    setEditingBill(null);
                    setBillFormData({ title: "", amount: 0, category: "", due_day: 1 });
                    setBillDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nova
                </button>
              </div>
              
              <div className="space-y-3">
                {recurringBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <div>
                        <p className="text-white font-medium text-sm">{bill.title}</p>
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <span className="bg-gray-700 px-2 py-1 rounded text-xs">{bill.category}</span>
                          <span>Dia {bill.due_day}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-orange-400">
                        -{formatCurrency(Number(bill.amount))}
                      </span>
                      <button 
                        onClick={() => {
                          setEditingBill(bill);
                          setBillFormData({
                            title: bill.title,
                            amount: Number(bill.amount),
                            category: bill.category,
                            due_day: bill.due_day
                          });
                          setBillDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBill(bill.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {recurringBills.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Repeat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conta recorrente cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cache Tab */}
        {activeTab === "cache" && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 text-base font-semibold">Cachês</h3>
              </div>
              
              <div className="space-y-3">
                {cacheEvents.map(event => (
                  <div key={event.id} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{event.event_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          event.payment_status === 'paid' 
                            ? 'bg-green-400/20 text-green-400' 
                            : 'bg-yellow-400/20 text-yellow-400'
                        }`}>
                          {event.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                        <span className="font-bold text-green-400">
                          {formatCurrency(Number(event.cache))}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {event.location && (
                        <span>{event.location}</span>
                      )}
                    </div>
                    {event.payment_proof_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <a 
                          href={event.payment_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Ver comprovante
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                {cacheEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum cachê encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 text-base font-semibold">Metas Financeiras</h3>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                  onClick={() => {
                    resetGoalForm();
                    setGoalDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nova Meta
                </button>
              </div>
              
              <div className="space-y-4">
                {financialGoals.map(goal => {
                  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                  return (
                    <div key={goal.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                         <h4 className="text-white font-medium truncate">{goal.title}</h4>
                         <div className="flex items-center gap-1 self-end sm:self-auto">
                           <button 
                             onClick={() => handleEditGoal(goal)}
                             className="text-blue-400 hover:text-blue-300 p-1"
                           >
                             <Edit className="w-3 h-3" />
                           </button>
                           <button 
                             onClick={() => handleDeleteGoal(goal.id)}
                             className="text-red-400 hover:text-red-300 p-1"
                           >
                             <Trash2 className="w-3 h-3" />
                           </button>
                         </div>
                       </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-white">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400">{formatCurrency(goal.currentAmount)}</span>
                          <span className="text-yellow-400">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>Meta: {new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {financialGoals.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400 text-sm">Nenhuma meta cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Dialog */}
        {transactionDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-green-400 text-lg font-semibold mb-4">
                {editingTransaction ? "Editar Transação" : "Nova Transação"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tipo *</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "income" | "expense" })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Valor *</label>
                  <input 
                    type="number" 
                    placeholder="0,00" 
                    value={formData.amount || ""} 
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Descrição *</label>
                  <input 
                    type="text"
                    placeholder="Descrição da transação" 
                    value={formData.description || ""} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Categoria *</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="moradia">Moradia</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="lazer">Lazer</option>
                    <option value="trabalho">Trabalho</option>
                    <option value="investimento">Investimento</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data *</label>
                  <input 
                    type="date" 
                    value={formData.date || ""} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.is_recurring || false}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="recurring" className="text-gray-400 text-sm">
                    Transação recorrente
                  </label>
                </div>
                
                 <div className="flex flex-col sm:flex-row gap-2 pt-4">
                   <button 
                     className="flex-1 border border-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                     onClick={() => {
                       setTransactionDialogOpen(false);
                       resetTransactionForm();
                     }}
                     disabled={saving}
                   >
                     Cancelar
                   </button>
                   <button 
                     className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-2 px-4 rounded-lg transition-colors"
                     onClick={handleSubmitTransaction}
                     disabled={saving || !formData.amount || !formData.description || !formData.category}
                   >
                     {saving ? "Salvando..." : (editingTransaction ? "Atualizar" : "Salvar")}
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Dialog */}
        {goalDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-green-400 text-lg font-semibold mb-4">
                {editingGoal ? "Editar Meta" : "Nova Meta Financeira"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Título *</label>
                  <input 
                    type="text"
                    placeholder="Nome da meta" 
                    value={goalFormData.title || ""} 
                    onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Valor Atual</label>
                  <input 
                    type="number" 
                    placeholder="0,00" 
                    value={goalFormData.currentAmount || ""} 
                    onChange={(e) => setGoalFormData({ ...goalFormData, currentAmount: Number(e.target.value) })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Valor Meta *</label>
                  <input 
                    type="number" 
                    placeholder="0,00" 
                    value={goalFormData.targetAmount || ""} 
                    onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: Number(e.target.value) })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data Limite</label>
                  <input 
                    type="date" 
                    value={goalFormData.deadline || ""} 
                    onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Categoria</label>
                  <select 
                    value={goalFormData.category} 
                    onChange={(e) => setGoalFormData({ ...goalFormData, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="emergencia">Emergência</option>
                    <option value="casa">Casa Própria</option>
                    <option value="carro">Carro</option>
                    <option value="viagem">Viagem</option>
                    <option value="aposentadoria">Aposentadoria</option>
                    <option value="educacao">Educação</option>
                    <option value="investimento">Investimento</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                
                 <div className="flex flex-col sm:flex-row gap-2 pt-4">
                   <button 
                     className="flex-1 border border-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                     onClick={() => {
                       setGoalDialogOpen(false);
                       resetGoalForm();
                     }}
                     disabled={saving}
                   >
                     Cancelar
                   </button>
                   <button 
                     className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-2 px-4 rounded-lg transition-colors"
                     onClick={handleSubmitGoal}
                     disabled={saving || !goalFormData.title || !goalFormData.targetAmount}
                   >
                     {saving ? "Salvando..." : (editingGoal ? "Atualizar" : "Salvar")}
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Bill Dialog */}
        {billDialogOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 text-lg font-semibold">
                  {editingBill ? 'Editar Conta' : 'Nova Conta Recorrente'}
                </h3>
                <button 
                  onClick={() => setBillDialogOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Título *</label>
                  <input
                    type="text"
                    value={billFormData.title}
                    onChange={(e) => setBillFormData({...billFormData, title: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                    placeholder="Ex: Aluguel"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={billFormData.amount}
                    onChange={(e) => setBillFormData({...billFormData, amount: Number(e.target.value)})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Categoria *</label>
                  <select
                    value={billFormData.category}
                    onChange={(e) => setBillFormData({...billFormData, category: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="moradia">Moradia</option>
                    <option value="transporte">Transporte</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="lazer">Lazer</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Dia de Vencimento *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billFormData.due_day}
                    onChange={(e) => setBillFormData({...billFormData, due_day: Number(e.target.value)})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                    placeholder="1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmitBill}
                    disabled={saving}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <PiggyBank className="w-4 h-4" />
                        {editingBill ? 'Atualizar' : 'Criar'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setBillDialogOpen(false)}
                    className="px-6 py-3 border border-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
