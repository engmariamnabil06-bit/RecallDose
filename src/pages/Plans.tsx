import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Clock3, Crown, GraduationCap, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./plans.css";

type BillingCycle = "monthly" | "yearly";
type Membership = { plan: string; status: string; trialDaysRemaining: number; trialEndsAt: string; message: string; paymentEnabled: boolean };
const plans = [
  { id: "trial", name: "All Access Trial", subtitle: "Try the complete RecallDose experience before choosing.", icon: Sparkles, featured: true, features: ["60 days with every current feature unlocked", "AI Tutor, all specialist learning modes and exam levels", "Lecture uploads, OCR, summaries and flashcards", "Practice exams, mistake explanations and review tools", "Recall Twin insights and learning analytics"], note: "One free 60-day trial per account. No payment details required to start." },
  { id: "plus", name: "Student Plus", subtitle: "The everyday study plan after your free trial.", icon: GraduationCap, featured: false, features: ["Core learning workspace and saved study materials", "Monthly AI study allowance for explanations and revision", "Lecture-to-notes, flashcards and practice exams", "Mistake review and standard Recall Twin guidance", "Progress tracking across your medical subjects"], note: "Designed as the affordable student subscription." },
  { id: "pro", name: "Pro", subtitle: "For students who want deeper practice and insight.", icon: Crown, featured: false, features: ["Everything in Student Plus", "Higher AI and document-processing allowance", "Advanced Recall Twin trends and topic-level analytics", "More detailed exam analysis and personalized study plans", "Advanced practice workflows and priority access to new tools"], note: "Higher-capacity plan for intensive study periods." },
];

export default function Plans() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipError, setMembershipError] = useState("");
  useEffect(() => { let active = true; fetch(apiUrl("/api/plans/me"), { credentials: "include" }).then(async response => { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Could not load trial status."); if (active) setMembership(payload); }).catch(error => { if (active) setMembershipError(error instanceof Error ? error.message : "Could not load trial status."); }); return () => { active = false; }; }, []);
  return <main className="plans-page">
    <header className="plans-top"><Link to="/dashboard"><ArrowLeft size={16}/> Back to RecallDose</Link><span className="plans-brand"><span>R</span> RECALLDOSE</span></header>
    <section className="plans-hero">
      <span className="plans-eyebrow"><WalletCards size={15}/> MEMBERSHIP & PLANS</span>
      <h1>Choose the study plan that <em>fits you.</em></h1>
      <p>Start with 60 days of full access to every current feature. After that, keep learning with essential free tools or choose Student Plus or Pro.</p>
      <div className="plans-cycle" role="group" aria-label="Subscription period">
        <button type="button" className={cycle === "monthly" ? "active" : ""} onClick={() => setCycle("monthly")}>Monthly</button>
        <button type="button" className={cycle === "yearly" ? "active" : ""} onClick={() => setCycle("yearly")}>Yearly <small>planned savings</small></button>
      </div>
      {membership && <p className="plans-saving">{membership.message}{membership.status === "TRIALING" ? ` ${membership.trialDaysRemaining} days remaining.` : ""}</p>}
      {membershipError && <p className="plans-saving">{membershipError}</p>}
      {cycle === "yearly" && <p className="plans-saving">We plan to offer a lower effective monthly price on annual subscriptions. The exact discount will be confirmed with final prices.</p>}
    </section>
    <section className="plans-grid">
      {plans.map((plan) => {
        const Icon = plan.icon;
        return <article key={plan.id} className={`plans-card ${plan.featured ? "plans-featured" : ""}`}>
          {plan.featured && <span className="plans-popular">60 DAYS FREE</span>}
          <span className="plans-icon"><Icon size={21}/></span>
          <h2>{plan.name}</h2>
          <p className="plans-subtitle">{plan.subtitle}</p>
          <div className="plans-price"><strong>Coming soon</strong><span>{cycle === "monthly" ? "Monthly billing" : "Annual billing"}</span></div>
          <ul>{plan.features.map(feature => <li key={feature}><Check size={16}/><span>{feature}</span></li>)}</ul>
          <p className="plans-note">{plan.note}</p>
          <span className="plans-status"><Clock3 size={14}/> Subscriptions coming soon</span>
        </article>;
      })}
    </section>
    <section className="plans-payments">
      <div><ShieldCheck size={21}/><div><h2>Payments are being prepared</h2><p>No money is collected from this page. Checkout will only be enabled after payment verification, subscription controls and refund/support policies are ready.</p></div></div>
      <div className="plans-methods"><span>Planned for Egypt</span><strong>Orange Wallet</strong><strong>Fawry Plus</strong><small>Integration and availability subject to provider approval.</small></div>
    </section>
    <p className="plans-footnote">After the 60-day trial, an ongoing free version will remain available with essential study tools. Paid plans will have clearly stated AI and upload allowances, prices, renewal, cancellation and refund terms before checkout is enabled.</p>
  </main>;
}
