import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  Trophy, 
  Users, 
  Plus, 
  Activity, 
  Share2, 
  Trash2, 
  ArrowLeft,
  Medal,
  Save,
  Grid,
  List,
  Table as TableIcon,
  X,
  Copy,
  CheckCircle,
  AlertTriangle,
  FileText,
  UserPlus,
  ClipboardList,
  UserCog,
  Search,
  Printer,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Info,
  Edit,
  Unlock,
  Lock,
  Camera,
  Eye,
  Flag, 
  CheckSquare
} from 'lucide-react';

// --- Firebase Configuration & Init ---
const firebaseConfig = {
  apiKey: "AIzaSyAPAVOZdca61pTSoujke8c5UBTYuAByILs",
  authDomain: "fju-sports-app.firebaseapp.com",
  projectId: "fju-sports-app",
  storageBucket: "fju-sports-app.firebasestorage.app",
  messagingSenderId: "1051034599452",
  appId: "1:1051034599452:web:3d20413b05fc1677b55fd9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'fju-sports-oficial';

// --- FJU Brand Colors & Styles ---
const BRAND = {
  blueDark: "bg-[#003082]", 
  blue: "bg-[#0047BB]",     
  red: "bg-[#E30613]",      
  redHover: "hover:bg-[#B0040E]",
  blueHover: "hover:bg-[#003082]",
  textBlue: "text-[#0047BB]",
  textRed: "text-[#E30613]",
  bgLight: "bg-slate-100", 
};

const SPORTS = [
  { id: 'futsal', name: 'FUTSAL', icon: '⚽' },
  { id: 'volei', name: 'VÔLEI', icon: '🏐' },
  { id: 'basquete', name: 'BASQUETE', icon: '🏀' },
  { id: 'handebol', name: 'HANDEBOL', icon: '🤾' },
  { id: 'futebol', name: 'FUTEBOL', icon: '⚽' },
  { id: 'tenis_mesa', name: 'TÊNIS DE MESA', icon: '🏓' },
];

const TOURNAMENT_TYPES = [
  { id: 'bracket', name: 'Mata-mata', icon: <Grid size={18} /> },
  { id: 'league', name: 'Pontos Corridos', icon: <List size={18} /> },
];

// --- Rules Data ---
const RULES_DATA = {
  futsal: {
    title: "Regras Básicas do Futsal",
    officialLink: "https://www.cbfs.com.br/regras",
    summary: [
      { label: "Faltas Cumulativas", text: "Após a 5ª falta coletiva por tempo, toda falta é tiro livre direto sem barreira (tiro de 10m)." },
      { label: "Goleiro Linha", text: "O goleiro não pode tocar na bola novamente em sua quadra de defesa após tê-la jogado, a menos que toque em um adversário." },
      { label: "Lateral/Escanteio", text: "Deve ser cobrado com os pés em até 4 segundos." },
      { label: "Substituições", text: "Ilimitadas e volantes, devem ser feitas na zona de substituição." },
      { label: "Cartões", text: "Amarelo (advertência), Vermelho (expulsão - time fica com um a menos por 2 min ou até sofrer gol)." }
    ]
  },
  volei: {
    title: "Regras Básicas do Vôlei",
    officialLink: "https://cbv.com.br/institucional/regras-oficiais",
    summary: [
      { label: "Toques", text: "Cada time pode tocar na bola 3 vezes (além do bloqueio). Um jogador não pode tocar 2 vezes seguidas." },
      { label: "Rodízio", text: "Obrigatório a cada recuperação de saque. Erro de rodízio é ponto do adversário." },
      { label: "Toque na Rede", text: "É falta tocar na fita superior ou interferir na jogada tocando na rede." },
      { label: "Líbero", text: "Jogador de defesa, não saca, não bloqueia e não ataca acima da borda da rede. Usa uniforme diferente." },
      { label: "Invasão", text: "Permitido invadir por baixo da rede desde que parte do pé permaneça sobre/contato com a linha central." }
    ]
  },
  basquete: {
    title: "Regras Básicas do Basquete",
    officialLink: "https://www.cbb.com.br/regras-oficiais",
    summary: [
      { label: "Tempo de Ataque", text: "24 segundos para arremessar. Se pegar rebote ofensivo, reseta para 14s." },
      { label: "Faltas", text: "5 faltas pessoais eliminam o jogador. 4 faltas coletivas por quarto geram lance livre (bonificação)." },
      { label: "Andada", text: "Dar mais de 2 passos com a bola na mão sem driblar." },
      { label: "Dois Dribles", text: "Interromper o drible (segurar a bola) e voltar a driblar é violação." },
      { label: "Zona de Defesa", text: "8 segundos para passar do meio da quadra. Uma vez no ataque, não pode voltar para a defesa (campo atrás)." }
    ]
  },
  handebol: {
    title: "Regras Básicas do Handebol",
    officialLink: "https://cbhb.org.br/regras",
    summary: [
      { label: "Passos", text: "Máximo de 3 passos com a bola na mão sem driblar." },
      { label: "Área do Goleiro", text: "Exclusiva do goleiro. Invasão de atacante anula gol; de defensor é tiro de 7 metros." },
      { label: "Manejo", text: "Pode segurar a bola por no máximo 3 segundos." },
      { label: "Tiro de 7 Metros", text: "Penalidade máxima para faltas graves ou impedir chance clara de gol." },
      { label: "Punições", text: "Cartão Amarelo, 2 Minutos (sai de quadra) e Cartão Vermelho (desqualificação)." }
    ]
  },
  futebol: {
    title: "Regras Básicas do Futebol (Society/Campo)",
    officialLink: "https://www.cbf.com.br/a-cbf/arbitragem/regras-do-futebol",
    summary: [
      { label: "Impedimento", text: "Não há impedimento em Lateral, Tiro de Meta ou Escanteio (Regra varia no Society: geralmente não há)." },
      { label: "Mão na Bola", text: "Falta direta. Se for dentro da área, é pênalti." },
      { label: "Recuo", text: "Goleiro não pode pegar com a mão se a bola for recuada intencionalmente com os pés pelo companheiro." },
      { label: "Cartões", text: "Dois amarelos resultam em um vermelho (expulsão)." }
    ]
  },
  tenis_mesa: {
    title: "Regras Básicas do Tênis de Mesa",
    officialLink: "https://www.cbtm.org.br/",
    summary: [
      { label: "Pontuação", text: "Vence o set quem fizer 11 pontos primeiro. Se empatar em 10-10, vence quem abrir 2 pontos de vantagem (ex: 12-10)." },
      { label: "Saque", text: "Alterna a cada 2 pontos. Em caso de empate 10-10, alterna a cada 1 ponto. A bola deve quicar uma vez em cada lado." },
      { label: "Toque na Mesa", text: "É proibido tocar na mesa com a mão livre (a que não segura a raquete) durante o ponto." },
      { label: "Voleio", text: "Não é permitido bater na bola antes dela quicar na mesa (voleio é falta)." },
      { label: "Sets", text: "Geralmente disputado em melhor de 3, 5 ou 7 sets." }
    ]
  }
};

// --- Helper Functions ---

const generateBracketStructure = (teams, size) => {
  const slots = [...teams];
  while (slots.length < size) {
    slots.push({ name: 'A definir (W.O.)', players: [] });
  }

  let matches = [];
  
  if (size === 4) {
    matches = [
      { id: 1, round: 1, p1: 0, p2: 1, s1: 0, s2: 0, winner: null, nextMatchId: 3, nextSlot: 'p1' },
      { id: 2, round: 1, p1: 2, p2: 3, s1: 0, s2: 0, winner: null, nextMatchId: 3, nextSlot: 'p2' },
      { id: 3, round: 2, p1: null, p2: null, s1: 0, s2: 0, winner: null, nextMatchId: null, nextSlot: null },
    ];
  } else {
    matches = [
      { id: 1, round: 1, p1: 0, p2: 1, s1: 0, s2: 0, winner: null, nextMatchId: 5, nextSlot: 'p1' },
      { id: 2, round: 1, p1: 2, p2: 3, s1: 0, s2: 0, winner: null, nextMatchId: 5, nextSlot: 'p2' },
      { id: 3, round: 1, p1: 4, p2: 5, s1: 0, s2: 0, winner: null, nextMatchId: 6, nextSlot: 'p1' },
      { id: 4, round: 1, p1: 6, p2: 7, s1: 0, s2: 0, winner: null, nextMatchId: 6, nextSlot: 'p2' },
      { id: 5, round: 2, p1: null, p2: null, s1: 0, s2: 0, winner: null, nextMatchId: 7, nextSlot: 'p1' },
      { id: 6, round: 2, p1: null, p2: null, s1: 0, s2: 0, winner: null, nextMatchId: 7, nextSlot: 'p2' },
      { id: 7, round: 3, p1: null, p2: null, s1: 0, s2: 0, winner: null, nextMatchId: null, nextSlot: null },
    ];
  }
  return matches;
};

const generateLeagueMatches = (teams) => {
  const matches = [];
  let matchId = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: matchId++,
        round: 1,
        p1: i,
        p2: j,
        s1: 0,
        s2: 0,
        winner: null,
        finished: false
      });
    }
  }
  return matches;
};

const calculateStandings = (teams, matches) => {
  const safeTeams = teams || [];
  const table = safeTeams.map((team, index) => ({
    id: index,
    name: team.name,
    players: team.players || [],
    p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0
  }));

  if (!matches) return table;

  matches.forEach(m => {
    if (m.finished || m.winner !== null) {
      if (m.p1 === null || m.p2 === null || !table[m.p1] || !table[m.p2]) return;

      const t1 = table[m.p1];
      const t2 = table[m.p2];

      t1.j++; t2.j++;
      t1.gp += m.s1; t1.gc += m.s2; t1.sg = t1.gp - t1.gc;
      t2.gp += m.s2; t2.gc += m.s1; t2.sg = t2.gp - t2.gc;

      if (m.s1 > m.s2) {
        t1.p += 3; t1.v++;
        t2.d++;
      } else if (m.s2 > m.s1) {
        t2.p += 3; t2.v++;
        t1.d++;
      } else {
        t1.p += 1; t1.e++;
        t2.p += 1; t2.e++;
      }
    }
  });

  return table.sort((a, b) => {
    if (b.p !== a.p) return b.p - a.p;
    if (b.v !== a.v) return b.v - a.v;
    if (b.sg !== a.sg) return b.sg - a.sg;
    return b.gp - a.gp;
  });
};

// --- Modals & Widgets ---

function SocialCardModal({ isOpen, onClose, matchData, championshipName }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !window.html2canvas) {
      const script = document.createElement('script');
      script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen || !matchData) return null;

  const handleDownload = async () => {
    if (!window.html2canvas) {
      alert("Aguarde o carregamento da ferramenta...");
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await window.html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3, 
        backgroundColor: null,
        logging: false,
        width: cardRef.current.clientWidth,
        height: cardRef.current.clientHeight
      });
      const link = document.createElement('a');
      link.download = `FJU_MATCH_${matchData.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("Error generating image", e);
      alert("Erro ao gerar imagem. Tente novamente.");
    }
    setLoading(false);
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';
  const winnerName = parseInt(matchData.s1) > parseInt(matchData.s2) 
    ? matchData.t1Name 
    : (parseInt(matchData.s2) > parseInt(matchData.s1) ? matchData.t2Name : "Empate");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Card Container */}
        <div className="w-full shadow-2xl mb-4 rounded-xl overflow-hidden">
            <div 
              className="w-full aspect-square relative bg-white" 
              ref={cardRef}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#003082] via-[#0047BB] to-[#E30613]">
                 <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              </div>

              {/* --- ELEMENTOS FIXOS (Posicionamento Absoluto) --- */}
              
              {/* 1. Header (Topo) */}
              <div className="absolute top-0 left-0 w-full pt-8 pb-4 text-center z-20 px-4">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="text-yellow-400 w-6 h-6" />
                    <span className="text-sm font-bold tracking-[0.3em] uppercase text-yellow-400">Vencedor</span>
                 </div>
                 <h2 className="font-black text-2xl uppercase tracking-wide leading-none text-white filter drop-shadow-lg">
                     {winnerName}
                 </h2>
                 <div className="w-32 h-1 bg-white/20 mx-auto mt-4 rounded-full"></div>
              </div>

              {/* 2. Placar Central (Meio exato) */}
              <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 px-2 z-20">
                  <div className="flex items-center justify-center w-full">
                     {/* Time 1 */}
                     <div className="flex flex-col items-center w-1/3">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-3 shadow-xl border-4 border-[#E30613] relative z-10">
                           <span className="text-[#003082] font-black text-3xl">{getInitials(matchData.t1Name)}</span>
                        </div>
                        <h1 className="text-center font-black text-sm uppercase leading-tight text-white drop-shadow-md px-1 h-10 flex items-start justify-center overflow-hidden">
                          {matchData.t1Name}
                        </h1>
                     </div>

                     {/* Placar */}
                     <div className="flex flex-col items-center justify-center px-2 -mt-6">
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-2xl mb-2">
                           <span className="text-6xl font-black text-white tracking-tighter">{matchData.s1}</span>
                           <span className="text-2xl text-white/60 font-light">×</span>
                           <span className="text-6xl font-black text-white tracking-tighter">{matchData.s2}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 bg-[#003082] px-3 py-1 rounded-full border border-white/10 shadow-lg">
                          Tempo Normal
                        </span>
                     </div>

                     {/* Time 2 */}
                     <div className="flex flex-col items-center w-1/3">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-3 shadow-xl border-4 border-[#0047BB] relative z-10">
                           <span className="text-[#E30613] font-black text-3xl">{getInitials(matchData.t2Name)}</span>
                        </div>
                        <h1 className="text-center font-black text-sm uppercase leading-tight text-white drop-shadow-md px-1 h-10 flex items-start justify-center overflow-hidden">
                          {matchData.t2Name}
                        </h1>
                     </div>
                  </div>
              </div>

              {/* 3. Footer (Base) */}
              <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                 <div className="flex justify-between items-end border-t border-white/20 pt-4">
                    <div className="flex flex-col text-left">
                       <span className="text-[10px] uppercase font-bold text-white/70 mb-1">Organização</span>
                       <div className="flex items-center gap-2">
                          <div className="bg-white text-[#003082] px-2 py-0.5 rounded font-black text-xs shadow-sm">FJU</div>
                          <span className="font-bold text-lg tracking-wide leading-none text-white text-shadow-sm">ESPORTES</span>
                       </div>
                    </div>
                    <div className="flex gap-2 mb-1">
                       <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                       <div className="w-3 h-3 bg-[#E30613] rounded-full shadow-sm"></div>
                       <div className="w-3 h-3 bg-[#0047BB] rounded-full shadow-sm"></div>
                    </div>
                 </div>
              </div>

            </div>
        </div>

        <div className="w-full">
          <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-900 rounded-lg font-bold text-sm hover:bg-white transition-colors shadow-lg">
            Fechar
          </button>
          <p className="text-white/60 text-xs text-center mt-3 font-medium animate-pulse">
            📸 Tire um print da tela para compartilhar!
          </p>
        </div>
      </div>
    </div>
  );
}

function RulesModal({ isOpen, onClose }) {
  const [activeSport, setActiveSport] = useState('futsal');

  if (!isOpen) return null;

  const currentRules = RULES_DATA[activeSport];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden border-t-4 border-[#0047BB]">
        <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100 shrink-0">
          <h3 className="font-black text-[#003082] uppercase flex items-center gap-2 text-lg">
            <BookOpen size={22} className="text-[#E30613]"/> Guia de Regras
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-1/3 bg-[#F8FAFC] border-b md:border-b-0 md:border-r border-slate-200 overflow-x-auto md:overflow-y-auto p-2 shrink-0">
            <div className="flex md:flex-col gap-1 md:gap-1">
              {SPORTS.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => setActiveSport(sport.id)}
                  className={`whitespace-nowrap md:whitespace-normal w-auto md:w-full text-left px-3 py-2 md:py-3 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors ${activeSport === sport.id ? 'bg-[#0047BB] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  <span className="text-base">{sport.icon}</span> 
                  <span className="hidden md:inline">{sport.name}</span>
                  <span className="md:hidden">{sport.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 overflow-y-auto">
            {currentRules ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-black text-slate-800 uppercase">{currentRules.title}</h2>
                </div>

                <div className="space-y-4 mb-8">
                  {currentRules.summary.map((rule, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded border-l-4 border-[#E30613]">
                      <h4 className="font-bold text-[#003082] text-sm uppercase mb-1">{rule.label}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{rule.text}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h5 className="font-bold text-[#0047BB] text-xs uppercase mb-2 flex items-center gap-1">
                    <Info size={14}/> Fonte Oficial
                  </h5>
                  <p className="text-xs text-slate-500 mb-3">
                    As regras podem sofrer alterações anuais. Para arbitragem oficial, consulte sempre o documento da confederação.
                  </p>
                  <a 
                    href={currentRules.officialLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold bg-[#0047BB] text-white px-4 py-2 rounded hover:bg-[#003082] transition-colors"
                  >
                    Livro de Regras Completo <ExternalLink size={12}/>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic">
                Selecione uma modalidade
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StopwatchModal({ isOpen, onClose }) {
  const [time, setTime] = useState(600); 
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(600);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTime(initialTime);
  };
  const setDuration = (minutes) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTime(seconds);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border-t-4 border-[#E30613]">
        <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
          <h3 className="font-black text-[#003082] uppercase flex items-center gap-2">
            <Clock size={20} /> Cronômetro de Mesa
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className={`text-7xl font-mono font-black tracking-tighter mb-8 ${time < 60 ? 'text-[#E30613] animate-pulse' : 'text-slate-800'}`}>
            {formatTime(time)}
          </div>

          <div className="flex gap-4 w-full mb-8">
            <button 
              onClick={toggle}
              className={`flex-1 py-4 rounded-lg flex justify-center items-center gap-2 font-bold uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#0047BB] hover:bg-[#003082]'}`}
            >
              {isActive ? <><Pause fill="currentColor" /> Pausar</> : <><Play fill="currentColor" /> Iniciar</>}
            </button>
            <button 
              onClick={reset}
              className="px-4 py-4 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {[10, 15, 20].map(min => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                className={`py-2 text-xs font-bold border rounded uppercase ${initialTime === min * 60 ? 'bg-[#003082] text-white border-[#003082]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >
                {min} Min
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border-t-4 border-[#E30613]">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-50 p-3 rounded-full mb-4">
            <AlertTriangle className="text-[#E30613] w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-[#003082] mb-2 uppercase">{title}</h3>
          <p className="text-slate-600 mb-6 text-sm">{message}</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded font-bold uppercase text-xs tracking-wide transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-2.5 ${BRAND.red} ${BRAND.redHover} text-white rounded font-bold uppercase text-xs tracking-wide shadow-lg transition-colors`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ isOpen, onClose, championshipName }) {
  const [copied, setCopied] = useState("");
  const baseUrl = window.location.href.split('?')[0];
  
  const adminUrl = baseUrl;
  const spectatorUrl = `${baseUrl}?mode=spectator`;

  if (!isOpen) return null;

  const handleCopy = (text, type) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200 border-t-4 border-[#0047BB]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-black text-[#003082] mb-1 uppercase">Compartilhar</h3>
          <p className="text-sm text-[#E30613] font-bold mb-6 uppercase tracking-wider">{championshipName}</p>

          {/* Admin Link */}
          <div className="mb-4 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
              <UserCog size={12}/> Link de Administrador
            </label>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex-1 truncate text-xs text-slate-500 font-mono">
                {adminUrl}
              </div>
              <button 
                onClick={() => handleCopy(adminUrl, 'admin')}
                className={`p-2 rounded transition-all ${copied === 'admin' ? 'bg-green-100 text-green-700' : 'hover:bg-slate-200 text-slate-600'}`}
              >
                {copied === 'admin' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Spectator Link */}
          <div className="text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1">
              <Eye size={12}/> Link da Torcida (Só Visualização)
            </label>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-100">
              <div className="flex-1 truncate text-xs text-slate-600 font-mono">
                {spectatorUrl}
              </div>
              <button 
                onClick={() => handleCopy(spectatorUrl, 'spectator')}
                className={`p-2 rounded transition-all ${copied === 'spectator' ? 'bg-green-100 text-green-700' : 'hover:bg-blue-200 text-blue-600'}`}
              >
                {copied === 'spectator' ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="mt-4 bg-white p-2 rounded border-2 border-slate-100 inline-block shadow-sm">
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(spectatorUrl)}&color=003082`} 
               alt="QR Code" 
               className="w-24 h-24 mix-blend-multiply"
             />
             <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">QR Code Torcida</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Components ---

function Header({ user, setView, onOpenRules, isReadOnly, onFinish, isFinished, isLocked, onToggleLock }) {
  return (
    <div className="relative overflow-hidden shadow-xl print:hidden">
      <div className={`absolute inset-0 bg-gradient-to-r from-[#003082] via-[#0047BB] to-[#E30613]`}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

      <div className="relative container mx-auto px-4 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('list')}>
          <div className="bg-white p-2 rounded transform group-hover:rotate-6 transition-transform shadow-lg">
            <Trophy className="text-[#0047BB] w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-md">
              FJU<span className="text-white font-light">ESPORTES</span>
            </h1>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em] mt-1">
              {isReadOnly ? 'Modo Espectador' : (isLocked ? 'Tela Bloqueada' : 'Gestão de Torneios')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenRules}
            className="md:flex items-center gap-1 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded uppercase tracking-wide border border-white/10 transition-colors"
            title="Regras"
          >
            <BookOpen size={16} /> <span className="hidden md:inline">Regras</span>
          </button>

          {!isReadOnly && !isFinished && (
             <button 
               onClick={onToggleLock}
               className={`flex items-center gap-1 text-xs font-bold text-white px-3 py-2 rounded uppercase tracking-wide shadow-lg transition-colors border ${isLocked ? 'bg-amber-600 border-amber-500 hover:bg-amber-700' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
               title={isLocked ? "Desbloquear Edição" : "Bloquear Edição (Modo Segurança)"}
             >
               {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
             </button>
          )}

          {!isReadOnly && !isFinished && onFinish && !isLocked && (
            <button 
              onClick={onFinish}
              className="flex items-center gap-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded uppercase tracking-wide shadow-lg transition-colors border border-green-500 animate-in fade-in"
              title="Finalizar Campeonato"
            >
              <Flag size={16} /> <span className="hidden md:inline">Finalizar</span>
            </button>
          )}

          {!isReadOnly && (
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-white/90 bg-black/20 px-3 py-2 rounded uppercase tracking-wide border border-white/10">
              <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              {user ? 'Admin' : '...'}
            </div>
          )}
          {isReadOnly && (
            <div className="flex items-center gap-2 text-xs font-bold text-white bg-[#E30613] px-3 py-2 rounded uppercase tracking-wide shadow-lg">
              <Eye size={16} /> Visualizando
            </div>
          )}
        </div>
      </div>
      
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#0047BB]"></div>
        <div className="h-full w-1/3 bg-[#E30613]"></div>
      </div>
    </div>
  );
}

function CreateChampionshipWizard({ onCancel, onCreate }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [sport, setSport] = useState('futsal');
  const [teamInput, setTeamInput] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [teams, setTeams] = useState([]);

  const addTeam = () => {
    const trimmedName = teamInput.trim();
    if (!trimmedName) return;

    const isDuplicate = teams.some(t => t.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (isDuplicate) {
      alert("Este time já foi adicionado ao campeonato!");
      return;
    }

    const players = playerInput.split(/[\n,]/).map(p => p.trim()).filter(p => p);
    setTeams([...teams, { name: trimmedName, players }]);
    setTeamInput('');
    setPlayerInput('');
  };

  const removeTeam = (idx) => {
    setTeams(teams.filter((_, i) => i !== idx));
  };

  const handleNextStep = () => {
    if (!name || teams.length < 2) {
      alert("Preencha o nome do evento e adicione pelo menos 2 times.");
      return;
    }
    setStep(2);
  };

  const selectFormatAndCreate = (type, bracketSize) => {
    onCreate({ name, unit, sport, type, bracketSize, teams });
  };

  const recommendedBracketSize = teams.length <= 4 ? 4 : 8;

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded shadow-xl overflow-hidden border-t-4 border-[#0047BB]">
        
        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-100 flex">
          <div className={`flex-1 p-4 text-center font-bold text-xs uppercase tracking-wider ${step === 1 ? 'text-[#0047BB] border-b-2 border-[#0047BB]' : 'text-slate-400'}`}>
            1. Cadastro de Times
          </div>
          <div className={`flex-1 p-4 text-center font-bold text-xs uppercase tracking-wider ${step === 2 ? 'text-[#0047BB] border-b-2 border-[#0047BB]' : 'text-slate-400'}`}>
            2. Formato de Disputa
          </div>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="bg-[#F0F4F8] p-5 rounded border border-[#DEE2E6]">
              <h3 className="font-bold text-[#003082] uppercase text-xs mb-3 flex items-center gap-2">
                <FileText size={16}/> Dados do Evento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    className="w-full p-2.5 bg-white border border-slate-300 rounded focus:border-[#0047BB] focus:ring-1 focus:ring-[#0047BB] outline-none font-semibold text-slate-800 placeholder:font-normal text-sm"
                    placeholder="Nome do Evento (ex: Copa Jovem)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    className="w-full p-2.5 bg-white border border-slate-300 rounded focus:border-[#0047BB] outline-none font-semibold text-slate-800 text-sm"
                    placeholder="Unidade (ex: Catedral)"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  />
                </div>
                <div>
                  <select 
                    className="w-full p-2.5 bg-white border border-slate-300 rounded focus:border-[#0047BB] outline-none font-semibold text-slate-800 text-sm"
                    value={sport}
                    onChange={e => setSport(e.target.value)}
                  >
                    {SPORTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-bold text-[#003082] uppercase text-xs mb-3 flex items-center gap-2">
                <UserPlus size={16}/> Adicionar Time e Jogadores
              </h3>
              
              <div className="bg-white p-4 border border-slate-200 rounded shadow-sm mb-4">
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Time</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-slate-300 rounded focus:border-[#0047BB] outline-none font-bold uppercase text-slate-800"
                    placeholder="EX: TRIBO DE JUDÁ"
                    value={teamInput}
                    onChange={e => setTeamInput(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jogadores (Opcional - Um por linha)</label>
                  <textarea 
                    className="w-full p-2 border border-slate-300 rounded focus:border-[#0047BB] outline-none text-sm h-20 resize-none"
                    placeholder="João&#10;Pedro&#10;Lucas..."
                    value={playerInput}
                    onChange={e => setPlayerInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={addTeam}
                  className="w-full bg-[#003082] text-white py-2 rounded font-bold uppercase text-xs hover:bg-[#0047BB] transition-colors"
                >
                  Adicionar Time na Lista
                </button>
              </div>

              {/* Team List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {teams.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                    <div>
                      <div className="font-bold text-[#003082] text-xs uppercase">{idx + 1}. {t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.players.length} jogadores cadastrados</div>
                    </div>
                    <button onClick={() => removeTeam(idx)} className="text-slate-400 hover:text-red-500 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {teams.length === 0 && <p className="text-center text-slate-400 text-xs py-2 italic">Nenhum time adicionado.</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={onCancel} className="flex-1 py-3 text-slate-600 font-bold uppercase text-xs hover:bg-slate-50 rounded">
                Cancelar
              </button>
              <button 
                onClick={handleNextStep}
                className={`flex-1 py-3 ${BRAND.blue} text-white font-bold uppercase text-xs rounded shadow-md hover:bg-[#003082] flex justify-center items-center gap-2`}
              >
                Próximo Passo <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-block bg-blue-50 text-[#003082] px-4 py-2 rounded-full font-bold text-xs uppercase mb-2">
                {teams.length} Times Cadastrados
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase">Como será a disputa?</h3>
              <p className="text-xs text-slate-500">Selecione o formato ideal para a quantidade de times.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Option: League */}
              <button 
                onClick={() => selectFormatAndCreate('league', null)}
                className="group relative bg-white border-2 border-slate-200 hover:border-[#0047BB] p-4 rounded-lg text-left transition-all hover:shadow-md"
              >
                 <div className="flex items-start gap-4">
                   <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-[#0047BB] group-hover:text-white transition-colors text-indigo-600">
                     <List size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 group-hover:text-[#0047BB] uppercase">Pontos Corridos</h4>
                     <p className="text-xs text-slate-500 mt-1">Todos contra todos. Quem somar mais pontos vence.</p>
                     <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                       Total de Jogos: {(teams.length * (teams.length - 1)) / 2}
                     </div>
                   </div>
                 </div>
              </button>

              {/* Option: Bracket (Recommended) */}
              <button 
                onClick={() => selectFormatAndCreate('bracket', recommendedBracketSize)}
                className="group relative bg-white border-2 border-slate-200 hover:border-[#E30613] p-4 rounded-lg text-left transition-all hover:shadow-md"
              >
                 {teams.length <= 8 && (
                   <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                     RECOMENDADO
                   </div>
                 )}
                 <div className="flex items-start gap-4">
                   <div className="bg-red-50 p-3 rounded-lg group-hover:bg-[#E30613] group-hover:text-white transition-colors text-red-600">
                     <Grid size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 group-hover:text-[#E30613] uppercase">
                       Mata-mata ({recommendedBracketSize} Vagas)
                     </h4>
                     <p className="text-xs text-slate-500 mt-1">
                       {teams.length > recommendedBracketSize 
                         ? `Atenção: Você tem ${teams.length} times. Alguns ficarão de fora.` 
                         : `Chave ideal para ${recommendedBracketSize} times. ${recommendedBracketSize - teams.length > 0 ? `${recommendedBracketSize - teams.length} vagas serão "W.O."` : ''}`
                       }
                     </p>
                     <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-50 inline-block px-2 py-1 rounded">
                       {recommendedBracketSize === 4 ? 'Semifinais + Final' : 'Quartas + Semis + Final'}
                     </div>
                   </div>
                 </div>
              </button>
            </div>
            
            <button 
              onClick={() => setStep(1)}
              className="w-full py-3 text-slate-400 font-bold uppercase text-xs hover:text-slate-600"
            >
              Voltar e Editar Times
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StandingsTable({ championship }) {
  const standings = calculateStandings(championship.teams, championship.matches);

  return (
    <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <h4 className="text-xs font-bold text-[#003082] uppercase tracking-wider flex items-center gap-2">
          <ClipboardList size={14} /> Resumo do Campeonato
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#003082] text-white font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Pos</th>
              <th className="p-3">Time</th>
              <th className="p-3 text-center">P</th>
              <th className="p-3 text-center hidden sm:table-cell">J</th>
              <th className="p-3 text-center hidden sm:table-cell">V</th>
              <th className="p-3 text-center hidden sm:table-cell">E</th>
              <th className="p-3 text-center hidden sm:table-cell">D</th>
              <th className="p-3 text-center">SG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {standings.map((row, idx) => (
              <tr key={idx} className={idx < 1 ? 'bg-yellow-50' : ''}>
                <td className={`p-3 font-bold ${idx < 1 ? 'text-[#E30613]' : 'text-slate-400'}`}>{idx + 1}º</td>
                <td className="p-3 text-slate-800 uppercase">{row.name}</td>
                <td className="p-3 text-center font-black text-[#0047BB] text-base">{row.p}</td>
                <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{row.j}</td>
                <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{row.v}</td>
                <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{row.e}</td>
                <td className="p-3 text-center text-slate-500 hidden sm:table-cell">{row.d}</td>
                <td className="p-3 text-center text-slate-500">{row.sg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-slate-50 text-[10px] text-slate-400 text-center italic">
        * P=Pontos, J=Jogos, V=Vitórias, E=Empates, D=Derrotas, SG=Saldo de Gols
      </div>
    </div>
  );
}

function TeamManager({ championship, onUpdateTeams, isReadOnly }) {
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = (teamIndex) => {
    if (!newPlayerName.trim()) return;
    const updatedTeams = [...championship.teams];
    const team = updatedTeams[teamIndex];
    
    if (!team.players) team.players = [];
    team.players.push(newPlayerName.trim());
    
    onUpdateTeams(updatedTeams);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (teamIndex, playerIndex) => {
    const updatedTeams = [...championship.teams];
    updatedTeams[teamIndex].players.splice(playerIndex, 1);
    onUpdateTeams(updatedTeams);
  };

  return (
    <div className="bg-[#F8FAFC] h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-[#003082] font-black uppercase tracking-wide text-lg mb-1">Gestão de Elenco</h3>
        <p className="text-slate-500 text-xs">
          {isReadOnly ? 'Visualização dos jogadores inscritos.' : 'Adicione os nomes dos jovens para o relatório final.'}
        </p>
      </div>

      <div className="space-y-4">
        {championship.teams.map((team, idx) => (
          <div key={idx} className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <div 
              className="p-3 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setEditingTeamIndex(editingTeamIndex === idx ? null : idx)}
            >
              <div className="font-bold text-[#003082] uppercase text-sm flex items-center gap-2">
                <span className="bg-[#E30613] text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                {team.name}
              </div>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Users size={12} /> {(team.players || []).length} Jovens
              </div>
            </div>

            {editingTeamIndex === idx && (
              <div className="p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                {!isReadOnly && (
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="Nome do Jovem"
                      className="flex-1 border border-slate-300 rounded p-2 text-sm focus:border-[#0047BB] outline-none"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer(idx)}
                    />
                    <button 
                      onClick={() => handleAddPlayer(idx)}
                      className="bg-[#0047BB] text-white px-3 py-2 rounded text-xs font-bold uppercase hover:bg-[#003082]"
                    >
                      Adicionar
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {(team.players || []).map((player, pIdx) => (
                    <span key={pIdx} className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                      {player}
                      {!isReadOnly && (
                        <button onClick={() => handleRemovePlayer(idx, pIdx)} className="text-blue-400 hover:text-red-500">
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {(team.players || []).length === 0 && (
                    <span className="text-slate-400 text-xs italic">Nenhum jovem adicionado.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportView({ championship, onUpdateReport, isReadOnly }) {
  const [organizersYouth, setOrganizersYouth] = useState(championship.organizersYouth || 0);
  const [organizersStaff, setOrganizersStaff] = useState(championship.organizersStaff || 0);

  const totalPlayers = (championship.teams || []).reduce((acc, team) => acc + (team.players ? team.players.length : 0), 0);
  const totalAttendance = totalPlayers + parseInt(organizersYouth) + parseInt(organizersStaff);

  const handleSave = () => {
    onUpdateReport({
      organizersYouth: parseInt(organizersYouth),
      organizersStaff: parseInt(organizersStaff)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#F8FAFC] h-full p-4 overflow-y-auto">
      {/* Print-Only Header (Hidden by default) */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-[#003082] pb-4">
        <h1 className="text-3xl font-black text-[#003082] uppercase tracking-tighter">FJU ESPORTES</h1>
        <h2 className="text-xl font-bold text-slate-800 uppercase">{championship.name}</h2>
        <p className="text-sm text-slate-500 uppercase">{championship.unit} • {championship.sport}</p>
      </div>

      <div className="flex justify-between items-end mb-6 print:hidden">
        <div>
          <h3 className="text-[#003082] font-black uppercase tracking-wide text-lg mb-1">Relatório Final</h3>
          <p className="text-slate-500 text-xs">Dados consolidados para o projeto Esporte.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-[#E30613] text-white px-4 py-2 rounded shadow-md font-bold uppercase text-xs flex items-center gap-2 hover:bg-[#B0040E] transition-colors"
        >
          <Printer size={16} /> Salvar Relatório (PDF)
        </button>
      </div>

      {/* Main Report Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 print:grid-cols-2 print:gap-8">
        <div className="bg-white p-4 rounded shadow-sm border border-slate-200 print:border-2 print:border-slate-800">
          <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Total de Jogadores</span>
          <div className="text-3xl font-black text-[#0047BB]">{totalPlayers}</div>
          <p className="text-[10px] text-slate-400 mt-1">Soma dos jovens nos times</p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border border-slate-200 print:border-2 print:border-slate-800">
           <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Total Geral</span>
           <div className="text-3xl font-black text-[#E30613]">{totalAttendance}</div>
           <p className="text-[10px] text-slate-400 mt-1">Jogadores + Organização</p>
        </div>
      </div>

      {/* Organization Inputs (Editable on screen, Read-only on print) */}
      <div className="bg-white p-5 rounded shadow-sm border-l-4 border-[#E30613] mb-6 print:border print:border-slate-300">
        <h4 className="font-bold text-[#003082] uppercase text-sm mb-4 flex items-center gap-2">
          <UserCog size={16}/> Dados da Organização
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Obreiros (Apoio)</label>
            <input 
              type="number" 
              disabled={isReadOnly}
              className="w-full p-2 border border-slate-300 rounded focus:border-[#E30613] outline-none font-bold text-lg print:border-none print:p-0 disabled:bg-slate-50"
              value={organizersStaff}
              onChange={e => setOrganizersStaff(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Jovens (Org/Torcida)</label>
            <input 
              type="number" 
              disabled={isReadOnly}
              className="w-full p-2 border border-slate-300 rounded focus:border-[#E30613] outline-none font-bold text-lg print:border-none print:p-0 disabled:bg-slate-50"
              value={organizersYouth}
              onChange={e => setOrganizersYouth(e.target.value)}
            />
          </div>
        </div>
        {!isReadOnly && (
          <button 
            onClick={handleSave}
            className="mt-4 w-full bg-[#003082] text-white py-2 rounded text-xs font-bold uppercase hover:bg-[#0047BB] transition-colors print:hidden"
          >
            Salvar Dados
          </button>
        )}
      </div>

      <div className="print:mt-8">
        <StandingsTable championship={championship} />
      </div>

      <div className="hidden print:block mt-8 text-center text-[10px] text-slate-400 uppercase">
        Relatório gerado automaticamente pelo FJU SPORTS MANAGER em {new Date().toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}

function MatchSearch({ value, onChange }) {
  return (
    <div className="mb-4 sticky top-0 z-20 bg-[#F8FAFC] pb-2 print:hidden flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0047BB] focus:border-[#0047BB] sm:text-sm font-semibold text-slate-700"
          placeholder="Buscar jogo por time..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function BracketView({ championship, onUpdateMatch, onAddMatch, isReadOnly, onGenerateCard }) {
  const [filter, setFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const getTeamName = (idx) => {
    if (idx === null || idx === undefined) return '...';
    return championship.teams[idx]?.name || 'A definir (W.O.)';
  };

  const getMatchStatusColor = (match) => {
    if (match.winner !== null) return "border-l-4 border-l-green-500 bg-white";
    if (match.p1 !== null && match.p2 !== null) return "border-l-4 border-l-[#0047BB] bg-white";
    return "border-l-4 border-l-slate-200 bg-[#F8FAFC] opacity-80";
  };

  const handleScoreChange = (matchId, playerKey, val) => {
    const newVal = parseInt(val) || 0;
    const match = championship.matches.find(m => m.id === matchId);
    if (!isEditing && match.winner !== null) return; 
    const updatedMatch = { ...match, [playerKey === 'p1' ? 's1' : 's2']: newVal };
    onUpdateMatch(updatedMatch, false);
  };

  const handleTeamChange = (matchId, slot, teamIndex) => {
    const match = championship.matches.find(m => m.id === matchId);
    const updatedMatch = { ...match, [slot]: teamIndex === "null" ? null : parseInt(teamIndex) };
    onUpdateMatch(updatedMatch, false);
  };

  const finishMatch = (match) => {
    if (match.s1 === match.s2) {
      alert("O jogo não pode terminar empatado em mata-mata!");
      return;
    }
    const winnerIndex = match.s1 > match.s2 ? match.p1 : match.p2;
    const updatedMatch = { ...match, winner: winnerIndex };
    onUpdateMatch(updatedMatch, true);
  };

  const renderMatch = (match) => {
    const t1Name = getTeamName(match.p1);
    const t2Name = getTeamName(match.p2);

    if (filter && 
        !t1Name.toLowerCase().includes(filter.toLowerCase()) && 
        !t2Name.toLowerCase().includes(filter.toLowerCase())) {
       return null;
    }

    return (
      <div key={match.id} className={`rounded shadow-sm border border-slate-200 p-3 mb-4 w-full relative ${getMatchStatusColor(match)}`}>
        <div className="text-[10px] font-bold text-slate-400 mb-2 flex justify-between uppercase tracking-wider items-center">
          <span>{match.round === 99 ? 'Jogo Extra' : `Jogo #${match.id}`}</span>
          {match.winner !== null && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onGenerateCard({ t1Name, t2Name, s1: match.s1, s2: match.s2, id: match.id })}
                className="text-slate-400 hover:text-[#0047BB]"
                title="Gerar Card"
              >
                <Camera size={16} />
              </button>
              <span className="text-green-600 flex items-center gap-1"><Medal size={10}/> Fim</span>
            </div>
          )}
        </div>
        
        {/* Team 1 */}
        <div className={`flex justify-between items-center mb-2 ${!isEditing && match.winner === match.p1 && match.winner !== null ? 'text-[#0047BB]' : ''}`}>
          {isEditing && !isReadOnly ? (
            <select 
              className="w-32 text-xs border border-slate-300 rounded p-1"
              value={match.p1 === null ? "null" : match.p1}
              onChange={(e) => handleTeamChange(match.id, 'p1', e.target.value)}
            >
              <option value="null">A definir</option>
              {championship.teams.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
            </select>
          ) : (
            <span className={`truncate w-32 text-xs uppercase ${match.winner === match.p1 ? 'font-black' : 'font-bold text-slate-600'}`}>{t1Name}</span>
          )}
          
          <input 
            type="number" 
            disabled={isReadOnly || (!isEditing && (match.winner !== null || match.p1 === null))}
            value={match.s1}
            onChange={(e) => handleScoreChange(match.id, 'p1', e.target.value)}
            className={`w-10 text-center rounded border p-1 text-sm font-black focus:ring-1 focus:ring-[#E30613] outline-none ${match.winner === match.p1 ? 'bg-blue-50 border-blue-200 text-[#0047BB]' : 'bg-slate-50 border-slate-300'} ${isReadOnly ? 'bg-transparent border-none text-right pr-2' : ''}`}
          />
        </div>

        {/* Team 2 */}
        <div className={`flex justify-between items-center ${!isEditing && match.winner === match.p2 && match.winner !== null ? 'text-[#0047BB]' : ''}`}>
          {isEditing && !isReadOnly ? (
            <select 
              className="w-32 text-xs border border-slate-300 rounded p-1"
              value={match.p2 === null ? "null" : match.p2}
              onChange={(e) => handleTeamChange(match.id, 'p2', e.target.value)}
            >
              <option value="null">A definir</option>
              {championship.teams.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
            </select>
          ) : (
            <span className={`truncate w-32 text-xs uppercase ${match.winner === match.p2 ? 'font-black' : 'font-bold text-slate-600'}`}>{t2Name}</span>
          )}

          <input 
            type="number" 
            disabled={isReadOnly || (!isEditing && (match.winner !== null || match.p2 === null))}
            value={match.s2}
            onChange={(e) => handleScoreChange(match.id, 'p2', e.target.value)}
            className={`w-10 text-center rounded border p-1 text-sm font-black focus:ring-1 focus:ring-[#E30613] outline-none ${match.winner === match.p2 ? 'bg-blue-50 border-blue-200 text-[#0047BB]' : 'bg-slate-50 border-slate-300'} ${isReadOnly ? 'bg-transparent border-none text-right pr-2' : ''}`}
          />
        </div>

        {match.winner === null && match.p1 !== null && match.p2 !== null && !isEditing && !isReadOnly && (
          <button 
            onClick={() => finishMatch(match)}
            className="mt-3 w-full bg-[#E30613] hover:bg-[#B0040E] text-white text-[10px] py-2 rounded font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-1 shadow-sm"
          >
            <Save size={12} /> Encerrar
          </button>
        )}
      </div>
    );
  };

  let rounds = [];
  if (championship.bracketSize === 4) {
    rounds = [
      { id: 1, name: 'Semifinais', matches: championship.matches.filter(m => m.round === 1) },
      { id: 2, name: 'Grande Final', matches: championship.matches.filter(m => m.round === 2) },
    ];
  } else {
    rounds = [
      { id: 1, name: 'Quartas de Final', matches: championship.matches.filter(m => m.round === 1) },
      { id: 2, name: 'Semifinais', matches: championship.matches.filter(m => m.round === 2) },
      { id: 3, name: 'Grande Final', matches: championship.matches.filter(m => m.round === 3) },
    ];
  }

  const extraMatches = championship.matches.filter(m => m.round === 99);

  return (
    <div className="flex-1 overflow-x-auto p-4 bg-[#F8FAFC] h-full">
      <div className="flex justify-between items-center mb-2 sticky top-0 z-20 bg-[#F8FAFC] pb-2">
        <div className="flex-1 mr-2">
           <MatchSearch value={filter} onChange={setFilter} />
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2.5 rounded-lg shadow-sm transition-all border ${isEditing ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            title="Editar Confrontos"
          >
            {isEditing ? <Unlock size={20} /> : <Edit size={20} />}
          </button>
        )}
      </div>
      
      {isEditing && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex gap-2 items-center animate-in slide-in-from-top-2">
          <AlertTriangle size={16} /> 
          <span>Modo Edição Ativo: Você pode alterar os times e placares manualmente.</span>
        </div>
      )}

      <div className="flex gap-6 min-w-max pb-8">
        {rounds.map((round) => (
          <div key={round.id} className="w-64 flex flex-col gap-2">
            <h3 className="text-center font-black text-[#003082] uppercase text-xs mb-4 tracking-[0.2em] border-b-2 border-[#003082] pb-1 mx-4">{round.name}</h3>
            <div className="flex flex-col justify-start gap-4 h-full">
              {round.matches.map(renderMatch)}
            </div>
          </div>
        ))}
        
        {!filter && (
          <div className="w-48 flex flex-col justify-center items-center">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-[#E30613] mx-auto mb-2 opacity-50" />
                <h3 className="font-black text-[#003082] uppercase tracking-widest text-sm opacity-50">Campeão</h3>
              </div>
          </div>
        )}

        <div className="w-64 flex flex-col gap-2 border-l-2 border-dashed border-slate-300 pl-6 ml-2">
           <h3 className="text-center font-black text-slate-500 uppercase text-xs mb-4 tracking-[0.2em] pb-1">Repescagem & Extras</h3>
           <div className="flex flex-col justify-start gap-4">
              {extraMatches.map(renderMatch)}
              
              {!isReadOnly && (
                <button 
                  onClick={onAddMatch}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 font-bold text-xs uppercase hover:border-[#0047BB] hover:text-[#0047BB] transition-all flex flex-col items-center gap-1"
                >
                  <Plus size={20} />
                  Adicionar Jogo Extra
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function LeagueView({ championship, onUpdateMatch, isReadOnly, onGenerateCard }) {
  const [filter, setFilter] = useState('');

  const handleScoreChange = (matchId, playerKey, val) => {
    const newVal = val === '' ? 0 : parseInt(val);
    const match = championship.matches.find(m => m.id === matchId);
    if (match.finished) return; 
    
    const updatedMatch = { ...match, [playerKey === 'p1' ? 's1' : 's2']: newVal };
    onUpdateMatch(updatedMatch, false);
  };

  const finishMatch = (match) => {
    const winnerIndex = match.s1 > match.s2 ? match.p1 : (match.s2 > match.s1 ? match.p2 : null);
    const updatedMatch = { ...match, winner: winnerIndex, finished: true };
    onUpdateMatch(updatedMatch, true);
  };

  const filteredMatches = championship.matches.filter(match => {
     if (!filter) return true;
     const t1 = championship.teams[match.p1]?.name.toLowerCase() || '';
     const t2 = championship.teams[match.p2]?.name.toLowerCase() || '';
     return t1.includes(filter.toLowerCase()) || t2.includes(filter.toLowerCase());
  });

  return (
    <div className="p-4 overflow-auto bg-[#F8FAFC] h-full">
      <MatchSearch value={filter} onChange={setFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMatches.map((match) => (
          <div key={match.id} className={`bg-white p-4 rounded border-l-4 shadow-sm flex flex-col gap-3 relative ${match.finished ? 'border-l-green-500' : 'border-l-[#003082]'}`}>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <span>Jogo #{match.id}</span>
              {match.finished && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onGenerateCard({ 
                      t1Name: championship.teams[match.p1].name, 
                      t2Name: championship.teams[match.p2].name, 
                      s1: match.s1, 
                      s2: match.s2, 
                      id: match.id 
                    })}
                    className="text-slate-400 hover:text-[#0047BB]"
                    title="Gerar Card"
                  >
                    <Camera size={16} />
                  </button>
                  <span className="text-green-600 flex items-center gap-1"><Medal size={12}/> Encerrado</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 text-right font-bold text-slate-800 uppercase truncate text-sm">{championship.teams[match.p1].name}</div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                <input 
                  type="number" 
                  value={match.s1}
                  disabled={isReadOnly || match.finished}
                  onChange={(e) => handleScoreChange(match.id, 'p1', e.target.value)}
                  className={`w-10 h-8 text-center bg-white border border-slate-300 rounded font-black text-lg focus:border-[#E30613] focus:ring-0 outline-none ${isReadOnly ? 'bg-transparent border-none' : ''}`}
                />
                <span className="text-slate-300 font-light">X</span>
                <input 
                  type="number" 
                  value={match.s2}
                  disabled={isReadOnly || match.finished}
                  onChange={(e) => handleScoreChange(match.id, 'p2', e.target.value)}
                  className={`w-10 h-8 text-center bg-white border border-slate-300 rounded font-black text-lg focus:border-[#E30613] focus:ring-0 outline-none ${isReadOnly ? 'bg-transparent border-none' : ''}`}
                />
              </div>
              <div className="flex-1 text-left font-bold text-slate-800 uppercase truncate text-sm">{championship.teams[match.p2].name}</div>
            </div>

            {!match.finished && !isReadOnly && (
              <button 
                onClick={() => finishMatch(match)}
                className="w-full py-2 bg-slate-800 hover:bg-[#E30613] text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
              >
                Finalizar Partida
              </button>
            )}
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-8 italic">
            Nenhum jogo encontrado para "{filter}"
          </div>
        )}
      </div>
    </div>
  );
}

function ChampionshipCard({ data, onClick, onRequestDelete, isReadOnly }) {
  const isLeague = data.type === 'league';
  return (
    <div 
      className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      <div className={`h-1.5 w-full flex`}>
        <div className={`h-full w-1/2 ${isLeague ? 'bg-[#0047BB]' : 'bg-[#E30613]'}`}></div>
        <div className={`h-full w-1/2 ${isLeague ? 'bg-[#003082]' : 'bg-[#B0040E]'}`}></div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded text-white ${isLeague ? 'bg-[#0047BB]' : 'bg-[#E30613]'}`}>
            {data.sport}
          </span>
          {!isReadOnly && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRequestDelete(); }}
              className="text-slate-300 hover:text-[#E30613] hover:bg-red-50 p-1 rounded transition-colors"
              title="Excluir Campeonato"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        
        <h3 className="text-lg font-black text-[#003082] mb-1 uppercase leading-tight truncate">{data.name}</h3>
        
        <p className="text-xs text-slate-500 flex items-center gap-1 mb-4 font-bold uppercase tracking-wide">
          <Users size={12} className="text-[#E30613]" /> {data.unit || 'Geral'}
        </p>
        
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t pt-3 uppercase tracking-wider">
           <div className="flex gap-3">
             <span className="flex items-center gap-1">
               {isLeague ? <List size={12}/> : <Grid size={12}/>}
               {isLeague ? 'P. Corridos' : 'Mata-mata'}
             </span>
           </div>
           {data.status === 'active' && <span className="flex items-center text-green-600 gap-1"><Activity size={10}/> Em andamento</span>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list');
  const [championships, setChampionships] = useState([]);
  const [selectedChampionship, setSelectedChampionship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsTab, setDetailsTab] = useState('games'); 
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [shareModal, setShareModal] = useState({ isOpen: false, name: '' });
  const [stopwatchOpen, setStopwatchOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [cardModal, setCardModal] = useState({ isOpen: false, data: null });
  const [finishModal, setFinishModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'spectator') {
      setIsReadOnly(true);
    }
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page { size: A4; margin: 20mm; }
        body { background: white; }
        .print\\:hidden { display: none !important; }
        .print\\:block { display: block !important; }
        .print\\:border { border-width: 1px !important; }
        .print\\:border-none { border: none !important; }
        .print\\:p-0 { padding: 0 !important; }
        .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    `;
    document.head.appendChild(style);

    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        if (e.code === 'auth/custom-token-mismatch' || e.code === 'auth/invalid-custom-token') {
          console.warn("Token de autenticação inválido ou incompatível. Tentando login anônimo...");
          await signInAnonymously(auth);
        } else {
          console.error("Erro ao conectar no Firebase:", e);
        }
      }

      const unsubAuth = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'championships'), orderBy('createdAt', 'desc'));
          const unsubData = onSnapshot(q, (snapshot) => {
             const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             setChampionships(items);
             setLoading(false);
             if (selectedChampionship) {
               const updated = items.find(i => i.id === selectedChampionship.id);
               if (updated) setSelectedChampionship(updated);
             }
          }, (err) => console.error("Data error:", err));
          return () => unsubData();
        }
      });
      return () => unsubAuth();
    };
    init();
    return () => document.head.removeChild(style);
  }, [selectedChampionship?.id]);

  const handleCreateChampionship = async ({ name, unit, sport, type, bracketSize, teams }) => {
    if (!user || isReadOnly) return;
    setLoading(true);
    
    let matches = [];
    if (type === 'league') {
      matches = generateLeagueMatches(teams);
    } else {
      matches = generateBracketStructure(teams, bracketSize);
    }

    const newDoc = {
      name,
      unit: unit || 'FJU Geral',
      sport,
      type, 
      bracketSize: type === 'bracket' ? bracketSize : null,
      teams,
      matches,
      status: 'active',
      organizersYouth: 0,
      organizersStaff: 0,
      createdAt: serverTimestamp(),
      createdBy: user.uid
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'championships'), newDoc);
      setView('list');
    } catch (e) {
      console.error(e);
      alert("Erro ao criar campeonato.");
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || isReadOnly) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'championships', deleteModal.id));
      if (selectedChampionship?.id === deleteModal.id) setView('list');
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleFinishChampionship = async () => {
    if (!selectedChampionship || isReadOnly) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'championships', selectedChampionship.id), {
        status: 'finished',
        finishedAt: serverTimestamp()
      });
      setFinishModal({ isOpen: false, id: null });
      setDetailsTab('report'); 
    } catch (e) {
      console.error("Error finishing", e);
      alert("Erro ao finalizar campeonato.");
    }
  };

  const handleUpdateMatch = async (updatedMatch, isFinish) => {
    if (!selectedChampionship || isReadOnly || selectedChampionship.status === 'finished') return;

    let newMatches = selectedChampionship.matches.map(m => 
      m.id === updatedMatch.id ? updatedMatch : m
    );

    if (!updatedMatch.isManualEdit && selectedChampionship.type === 'bracket' && isFinish && updatedMatch.nextMatchId) {
      newMatches = newMatches.map(m => {
        if (m.id === updatedMatch.nextMatchId) {
          return {
            ...m,
            [updatedMatch.nextSlot]: updatedMatch.winner
          };
        }
        return m;
      });
    }

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'championships', selectedChampionship.id), {
        matches: newMatches
      });
    } catch (e) {
      console.error("Failed to update match", e);
      alert("Erro ao salvar.");
    }
  };

  const handleAddRepechageMatch = async () => {
    if (!selectedChampionship || isReadOnly || selectedChampionship.status === 'finished') return;
    const newMatch = {
      id: Date.now(), 
      round: 99,
      p1: null,
      p2: null,
      s1: 0,
      s2: 0,
      winner: null,
      nextMatchId: null,
      nextSlot: null
    };

    const newMatches = [...selectedChampionship.matches, newMatch];
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'championships', selectedChampionship.id), {
        matches: newMatches
      });
    } catch (e) {
      console.error("Failed to add match", e);
    }
  };

  const handleUpdateTeams = async (updatedTeams) => {
    if (isReadOnly || selectedChampionship?.status === 'finished') return;
    try {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'championships', selectedChampionship.id), {
        teams: updatedTeams
      });
    } catch(e) {
      console.error(e);
      alert("Erro ao atualizar times");
    }
  };

  const handleUpdateReport = async (data) => {
     if (isReadOnly || selectedChampionship?.status === 'finished') return;
     try {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'championships', selectedChampionship.id), {
        organizersYouth: data.organizersYouth,
        organizersStaff: data.organizersStaff
      });
      alert("Relatório atualizado com sucesso!");
    } catch(e) {
      console.error(e);
      alert("Erro ao atualizar relatório");
    }
  }

  if (loading && !championships.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 text-[#003082] flex-col gap-4">
        <Activity className="animate-spin w-12 h-12" />
        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Carregando Sistema FJU...</p>
      </div>
    );
  }

  const isFinished = selectedChampionship?.status === 'finished';
  const effectiveReadOnly = isReadOnly || isFinished || isLocked;

  return (
    <div className={`min-h-screen ${BRAND.bgLight} text-slate-800 font-sans selection:bg-[#E30613] selection:text-white`}>
      {view !== 'details' && <Header user={user} setView={setView} onOpenRules={() => setRulesOpen(true)} isReadOnly={isReadOnly} />}

      <main className="container mx-auto max-w-4xl p-4 print:hidden">
        {view === 'list' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#003082] uppercase tracking-wide border-l-4 border-[#E30613] pl-3">
                Eventos Disponíveis
              </h2>
              {!isReadOnly && (
                <button 
                  onClick={() => setView('create')}
                  className={`${BRAND.red} ${BRAND.redHover} text-white px-5 py-2.5 rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 font-bold uppercase text-xs tracking-wider`}
                >
                  <Plus size={18} /> Novo Evento
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {championships.map(champ => (
                <ChampionshipCard 
                  key={champ.id} 
                  data={champ} 
                  onClick={() => { setSelectedChampionship(champ); setView('details'); setDetailsTab('games'); }}
                  onRequestDelete={() => setDeleteModal({ isOpen: true, id: champ.id })}
                  isReadOnly={isReadOnly}
                />
              ))}
              {championships.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded shadow-sm border border-slate-200">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="text-slate-300 w-10 h-10" />
                  </div>
                  <h3 className="text-[#003082] font-black uppercase mb-1">Sem campeonatos</h3>
                  <p className="text-slate-500 text-sm mb-4">A quadra está vazia. Crie o primeiro evento!</p>
                  {!isReadOnly && (
                    <button onClick={() => setView('create')} className="text-[#E30613] font-bold text-sm hover:underline uppercase tracking-wide">
                      Criar Agora
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'create' && !isReadOnly && (
          <CreateChampionshipWizard
            onCancel={() => setView('list')} 
            onCreate={handleCreateChampionship} 
          />
        )}
      </main>

      {view === 'details' && selectedChampionship && (
        <div className="fixed inset-0 bg-slate-100 z-20 overflow-hidden flex flex-col animate-in fade-in duration-300 print:relative print:inset-auto print:bg-white print:overflow-visible print:h-auto">
          <Header 
            user={user} 
            setView={setView} 
            onOpenRules={() => setRulesOpen(true)} 
            isReadOnly={isReadOnly}
            isFinished={isFinished}
            onFinish={() => setFinishModal({ isOpen: true, id: selectedChampionship.id })}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
          />

          <div className="bg-white border-b px-2 flex gap-4 overflow-x-auto shrink-0 shadow-sm print:hidden">
            {[
              { id: 'games', label: 'Jogos', icon: <Grid size={16}/> },
              { id: 'table', label: 'Classificação', icon: <TableIcon size={16}/> },
              { id: 'teams', label: 'Times', icon: <UserPlus size={16}/> },
              { id: 'report', label: 'Relatório', icon: <FileText size={16}/> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setDetailsTab(tab.id)}
                className={`py-4 px-2 text-xs font-bold uppercase tracking-wider border-b-4 transition-colors flex items-center gap-2 whitespace-nowrap ${detailsTab === tab.id ? 'border-[#E30613] text-[#E30613]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto bg-[#F8FAFC] print:bg-white print:overflow-visible">
            {detailsTab === 'games' && selectedChampionship.type === 'bracket' && (
              <BracketView 
                championship={selectedChampionship} 
                onUpdateMatch={handleUpdateMatch}
                onAddMatch={handleAddRepechageMatch}
                isReadOnly={effectiveReadOnly}
                onGenerateCard={(data) => setCardModal({ isOpen: true, data })}
              />
            )}
            {detailsTab === 'games' && selectedChampionship.type === 'league' && (
              <LeagueView 
                championship={selectedChampionship} 
                onUpdateMatch={handleUpdateMatch} 
                isReadOnly={effectiveReadOnly}
                onGenerateCard={(data) => setCardModal({ isOpen: true, data })}
              />
            )}
            {detailsTab === 'table' && (
              <div className="p-4">
                <StandingsTable championship={selectedChampionship} />
              </div>
            )}
            {detailsTab === 'teams' && (
              <TeamManager 
                championship={selectedChampionship} 
                onUpdateTeams={handleUpdateTeams} 
                isReadOnly={effectiveReadOnly}
              />
            )}
            {detailsTab === 'report' && (
               <ReportView 
                 championship={selectedChampionship} 
                 onUpdateReport={handleUpdateReport} 
                 isReadOnly={effectiveReadOnly}
               />
            )}
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Apagar Evento?"
        message="Essa ação é irreversível. Todos os placares e histórico de jogos serão perdidos."
      />

      <ConfirmModal 
        isOpen={finishModal.isOpen}
        onClose={() => setFinishModal({ isOpen: false, id: null })}
        onConfirm={handleFinishChampionship}
        title="Finalizar Campeonato?"
        message="Ao finalizar, o campeonato será encerrado e não será possível alterar mais nenhum placar. O sistema irá gerar o Relatório Final."
      />

      <ShareModal 
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ ...shareModal, isOpen: false })}
        championshipName={shareModal.name}
      />

      <StopwatchModal 
        isOpen={stopwatchOpen}
        onClose={() => setStopwatchOpen(false)}
      />

      <RulesModal 
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />

      <SocialCardModal 
        isOpen={cardModal.isOpen}
        onClose={() => setCardModal({ isOpen: false, data: null })}
        matchData={cardModal.data}
        championshipName={selectedChampionship?.name || 'Campeonato'}
      />
    </div>
  );
}