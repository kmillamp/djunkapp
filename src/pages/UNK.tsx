import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/unk-button'
import { IPhoneMenu } from '@/components/IPhoneMenu'

export default function UNK() {
  const navigate = useNavigate()
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-[#100C1F]/90 via-[#0D0A18]/90 to-black/90 backdrop-blur-sm z-10 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold">UNK</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center w-full p-4">
        <div style={{ perspective: '1200px' }} className="w-full max-w-md">
          <div
            role="button"
            tabIndex={0}
            aria-pressed={isFlipped}
            onClick={() => setIsFlipped((v) => !v)}
            className="relative w-full h-[520px] transition-transform duration-700 cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)'
              }}
            >
              <div
                className="relative h-full flex flex-col items-center justify-center p-6 text-center bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80')"
                }}
              >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl mb-4">
                    <img
                      src="https://cdn-ai.onspace.ai/onspace/project/image/4Bn7NYuxN23AKGNdbckULF/logo.png"
                      alt="UNK Logo"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-light text-gray-200 tracking-wider mb-2">
                    Assessoria
                  </h2>

                  <button className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors group mb-6">
                    <span>Clique para ver mais</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="relative z-10 text-gray-300 text-base leading-relaxed mt-2 px-2">
                    A Conexão UNK é um núcleo de desenvolvimento artístico real, criado por quem vive a música de verdade e conhece o peso que ela pode carregar.<br/><br/>
                    
                    Aqui, o artista não é só mais um perfil na vitrine. A gente olha pra pessoa por trás do projeto. Essa é a raiz da Conexão UNK.<br/><br/>
                    
                    Se for pra construir algo, que seja com propósito.
                  </p>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-slate-800"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="relative h-full flex flex-col p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Termos do Contrato</h2>
                  <div className="w-24 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 mx-auto" />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 text-left">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">
{`Termos de Contrato - Conexão UNK

1. OBJETO
A Conexão UNK prestará serviços de assessoria artística, incluindo:
- Desenvolvimento da identidade visual
- Estratégias de comunicação
- Planejamento de carreira
- Gestão de projetos musicais

2. RESPONSABILIDADES
O artista se compromete a:
- Fornecer informações precisas
- Cumprir prazos estabelecidos
- Manter comunicação ativa

A Conexão UNK se compromete a:
- Entregar serviços de qualidade
- Manter confidencialidade
- Respeitar a identidade artística

3. INVESTIMENTO
Valores a serem definidos conforme escopo do projeto.

4. PRAZO
Definido em contrato específico para cada projeto.`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <IPhoneMenu />
    </div>
  )
}