import { useEffect, useState, type FormEvent, type LucideIcon } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, ArrowLeft, Atom, BookMarked, BookOpen, Brain, ClipboardList, Languages, MessageSquareText, Pill, Send, Sparkles, Stethoscope, Target, WandSparkles } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./ai-tutor.css";

type Mode = "tutor" | "explain" | "mnemonic" | "anatomy" | "pharmacology" | "simplify" | "quiz" | "flashcards" | "clinical-case" | "recall-plan" | "compare";
type AIProvider = { id: string; name: string; model: string; fallbackOrder: number };
type Message = { role: "user" | "assistant"; text: string; provider?: string; model?: string };

const modes: Array<{id:Mode;label:string;title:string;placeholder:string;description:string;icon:LucideIcon}> = [
{id:"tutor",label:"AI Tutor",title:"Understand the concept, not just memorize it.",placeholder:"Ask about a concept, pathway, process or lecture…",description:"Step-by-step lessons and self-checks.",icon:MessageSquareText},
{id:"anatomy",label:"Anatomy Tutor",title:"Build a clear mental map of the human body.",placeholder:"Ask about a region, structure, nerve, vessel or relation…",description:"Regions, relations, supply, innervation and clinical links.",icon:Activity},
{id:"pharmacology",label:"Pharmacology",title:"Connect drug classes, mechanisms and effects.",placeholder:"Ask about a drug, class, mechanism or adverse effect…",description:"MOA, indications, adverse effects and interactions.",icon:Pill},
{id:"explain",label:"Mistake Explainer",title:"Turn a wrong answer into a useful lesson.",placeholder:"Paste the question, your answer and the correct answer…",description:"Find the misconception and why the distractor is wrong.",icon:BookOpen},
{id:"mnemonic",label:"Mnemonic Builder",title:"Make high-yield facts easier to remember.",placeholder:"What list, pathway or drug family do you need to remember?",description:"Acronyms, stories and memory cues without changing facts.",icon:Brain},
{id:"simplify",label:"Lecture Simplifier",title:"Make dense lecture notes easier to understand.",placeholder:"What part of your lecture should we simplify?",description:"Plain-language explanations and a faithful recap.",icon:Languages},
{id:"quiz",label:"Quiz Generator",title:"Test your understanding with fresh questions.",placeholder:"Choose a topic or paste lecture material to turn into a quiz…",description:"Practice questions with answer key and rationales.",icon:ClipboardList},
{id:"flashcards",label:"Flashcard Creator",title:"Turn your lecture into active-recall cards.",placeholder:"Which material should become front/back flashcards?",description:"Atomic cards designed for retrieval and spaced review.",icon:BookMarked},
{id:"clinical-case",label:"Case Coach",title:"Practice clinical reasoning with fictional cases.",placeholder:"Choose a topic or ask for a fictional educational case…",description:"Guided reasoning, not patient-specific advice.",icon:Stethoscope},
{id:"compare",label:"Compare Concepts",title:"See the important differences side by side.",placeholder:"Which two structures, diseases or drug classes should we compare?",description:"Similarities, differences and common confusions.",icon:Atom},
{id:"recall-plan",label:"Study Plan AI",title:"Turn your learning data into a focused plan.",placeholder:"Ask for adjustments to your next study sessions…",description:"Prioritized study actions informed by your Recall Twin.",icon:Target}
];
function isMode(value:unknown):value is Mode{return typeof value==="string"&&modes.some(item=>item.id===value);}

export default function AITutor(){
 const location=useLocation();
 const incomingContext=typeof location.state?.context==="string"?location.state.context:"";
 const initialMode:Mode=isMode(location.state?.mode)?location.state.mode:"tutor";
 const [mode,setMode]=useState<Mode>(initialMode);
 const [message,setMessage]=useState("");
 const [context,setContext]=useState(incomingContext);
 const [messages,setMessages]=useState<Message[]>([]);
 const [providers,setProviders]=useState<AIProvider[]>([]);
 const [providerId,setProviderId]=useState("auto");
 const [loadingProviders,setLoadingProviders]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [statusNotice,setStatusNotice]=useState("");
 useEffect(()=>{let active=true;fetch(apiUrl("/api/ai/status"),{credentials:"include"}).then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||"Could not load the AI model list.");if(active)setProviders(Array.isArray(data.providers)?data.providers:[]);}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:"Could not load AI models.");}).finally(()=>{if(active)setLoadingProviders(false);});return()=>{active=false;};},[]);
 const activeMode=modes.find(item=>item.id===mode)||modes[0];
 async function submit(event:FormEvent){event.preventDefault();const question=message.trim();if(!question||busy)return;setError("");setStatusNotice("");setMessages(current=>[...current,{role:"user",text:question}]);setMessage("");setBusy(true);try{const response=await fetch(apiUrl("/api/ai/chat"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,message:question,context:context.trim(),providerId})});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.message||"Could not get an AI response.");setMessages(current=>[...current,{role:"assistant",text:payload.answer,provider:payload.provider,model:payload.model}]);setStatusNotice(`Answered by ${payload.provider||"your selected AI"} · ${payload.model||"configured model"}`);}catch(cause){setError(cause instanceof Error?cause.message:"Something went wrong. Please try again.");}finally{setBusy(false);}}
 return <main className="ai-page">
  <div className="ai-topbar"><Link to="/dashboard" className="ai-back"><ArrowLeft size={16}/> Dashboard</Link><span className="ai-brand"><span>R</span> RECALLDOSE AI</span></div>
  <section className="ai-shell">
   <div className="ai-heading"><span className="ai-eyebrow"><Sparkles size={14}/> MULTI-MODE MEDICAL LEARNING</span><h1>{activeMode.title}</h1><p>{activeMode.description} Choose a specialist learning mode and an available model. Recalldose can automatically fail over to another configured provider.</p></div>
   <div className="ai-mode-grid" role="tablist" aria-label="AI learning modules">{modes.map(item=>{const Icon=item.icon;return <button type="button" role="tab" aria-selected={mode===item.id} className={mode===item.id?"active":""} key={item.id} onClick={()=>setMode(item.id)}><span className="ai-mode-icon"><Icon size={18}/></span><strong>{item.label}</strong><small>{item.description}</small></button>;})}</div>
   <div className="ai-provider-bar"><label htmlFor="ai-provider">AI model / provider</label><select id="ai-provider" value={providerId} onChange={event=>setProviderId(event.target.value)} disabled={loadingProviders||providers.length===0}><option value="auto">Automatic · try available models in order</option>{providers.map(provider=><option key={provider.id} value={provider.id}>{provider.name} · {provider.model}</option>)}</select><span>{loadingProviders?"Loading models…":providers.length?`${providers.length} configured model(s) · server-side keys`:"No AI model configured yet"}</span></div>
   {providers.length===0&&!loadingProviders&&<div className="ai-notice"><Stethoscope size={18}/><div><strong>AI provider setup required</strong><p>Add a primary model and optional fallback providers to the server environment. API keys must stay server-side; never put them in frontend variables.</p></div></div>}
   <div className="ai-chat" aria-live="polite">{messages.length===0?<div className="ai-empty"><div className="ai-orb"><WandSparkles size={28}/></div><h2>What do you want to work on?</h2><p>Choose a specialist module above, add lecture context if available, and ask your question.</p><div className="ai-suggestions">{["Explain a difficult concept step by step","Compare two similar drug classes","Create 8 flashcards from my lecture","Build a quiz with answers and explanations"].map(suggestion=><button type="button" key={suggestion} onClick={()=>setMessage(suggestion)}>{suggestion}</button>)}</div></div>:messages.map((item,index)=><article key={`${item.role}-${index}`} className={`ai-message ${item.role}`}><span className="ai-message-icon">{item.role==="assistant"?<Sparkles size={16}/>:"You"}</span><div className="ai-message-text">{item.text}{item.provider&&<small className="ai-message-model">{item.provider} · {item.model}</small>}</div></article>)}{busy&&<div className="ai-thinking"><span/><span/><span/> Working on your study request…</div>}</div>
   <form className="ai-compose" onSubmit={event=>void submit(event)}><label htmlFor="ai-context">Course notes or source context <span>optional · never paste identifiable patient information</span></label><textarea id="ai-context" value={context} onChange={event=>setContext(event.target.value)} rows={3} maxLength={10000} placeholder="Paste a short excerpt from your lecture, a textbook topic or Recall Twin study metrics…"/><div className="ai-compose-row"><textarea aria-label="Your question" value={message} onChange={event=>setMessage(event.target.value)} rows={2} maxLength={4000} placeholder={activeMode.placeholder} required/><button type="submit" disabled={busy||message.trim().length<2||providers.length===0} aria-label="Send question">{busy?"…":<Send size={18}/>}</button></div>{error&&<p className="ai-error" role="alert">{error}</p>}{statusNotice&&<p className="ai-provider-status" role="status">{statusNotice}</p>}<p className="ai-disclaimer">Educational support only, not medical advice. Verify medical facts with trusted current course references. AI output is not automatically approved learning content.</p></form>
  </section>
 </main>;
}
