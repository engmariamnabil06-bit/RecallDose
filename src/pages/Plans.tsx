import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Clock3, Crown, GraduationCap, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import "./plans.css";

type BillingCycle = "monthly" | "yearly";
const plans = [
  {
    id: "free",
    name: "Free Launch",
    subtitle: "Start learning without a payment barrier.",
    icon: GraduationCap,
    featured: false,
    features: [
      "Core medical learning workspace",
      "Curriculum explorer and study tools",
      "Personal notes and flashcards",
      "Progress tracking and review schedule",
      "Access during the first 3 launch months",
    ],
    note: "Launch offer: free for the first 3 months after public launch.",
  },
  {
    id: "plus",
    name: "Plus",
    subtitle: "More tools for everyday medical study.",
    icon: Sparkles,
    featured: true,
    features: [
      "Everything in Free Launch",
      "Expanded AI tutor and subject-specific learning modes",
      "Lecture upload, text extraction and study conversion",
      "More practice and exam-preparation tools",
      "Deeper mistake review and study planning",
    ],
    note: "Monthly and annual subscriptions are planned.",
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "A deeper view of your learning performance.",
    icon: Crown,
    featured: false,
    features: [
      "Everything in Plus",
      "Advanced Recall Twin insights and weakness analysis",
      "Expanded AI learning and generation capacity",
      "More detailed performance analytics",
      "Priority access to selected new learning features",
    ],
    note: "Monthly and annual subscriptions are planned.",
  },
];

export default function Plans() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  return <main className="plans-page">
    <header className="plans-top"><Link to="/dashboard"><ArrowLeft size={16}/> Back to RecallDose</Link><span className="plans-brand"><span>R</span> RECALLDOSE</span></header>
    <section className="plans-hero">
      <span className="plans-eyebrow"><WalletCards size={15}/> MEMBERSHIP & PLANS</span>
      <h1>Choose how you want to <em>grow.</em></h1>
      <p>Start with the launch offer, then choose the study experience that fits your needs. We are preparing secure payments before activating subscriptions.</p>
      <div className="plans-cycle" role="group" aria-label="Subscription period">
        <button type="button" className={cycle === "monthly" ? "active" : ""} onClick={() => setCycle("monthly")}>Monthly</button>
        <button type="button" className={cycle === "yearly" ? "active" : ""} onClick={() => setCycle("yearly")}>Yearly <small>planned savings</small></button>
      </div>
      {cycle === "yearly" && <p className="plans-saving">A target annual discount of 15–20% is being evaluated. Final pricing will be announced before checkout opens.</p>}
    </section>
    <section className="plans-grid">
      {plans.map((plan) => {
        const Icon = plan.icon;
        return <article key={plan.id} className={`plans-card ${plan.featured ? "plans-featured" : ""}`}>
          {plan.featured && <span className="plans-popular">STUDENT FAVORITE</span>}
          <span className="plans-icon"><Icon size={21}/></span>
          <h2>{plan.name}</h2>
          <p className="plans-subtitle">{plan.subtitle}</p>
          <div className="plans-price"><strong>Coming soon</strong><span>{cycle === "monthly" ? "Monthly billing" : "Annual billing"}</span></div>
          <ul>{plan.features.map(feature => <li key={feature}><Check size={16}/><span>{feature}</span></li>)}</ul>
          <p className="plans-note">{plan.note}</p>
          <span className="plans-status"><Clock3 size={14}/> Payment not active yet</span>
        </article>;
      })}
    </section>
    <section className="plans-payments">
      <div><ShieldCheck size={21}/><div><h2>Payments are being prepared</h2><p>No money is collected from this page. Checkout will only be enabled after payment verification, subscription controls and refund/support policies are ready.</p></div></div>
      <div className="plans-methods"><span>Planned for Egypt</span><strong>Orange Cash</strong><strong>Fawry Yellow</strong><small>Integration and availability subject to provider approval.</small></div>
    </section>
    <p className="plans-footnote">Final prices, exact AI usage allowances, renewal terms, cancellation and refund rules will be published clearly before any paid plan becomes available. You can continue using the currently available free features while payments are being prepared.</p>
  </main>;
}
