import { db } from "../server/db";

type QuestionSeed = {
  facultyCode: string;
  subjectName: string;
  topicName: string;
  text: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  options: {
    text: string;
    isCorrect: boolean;
  }[];
};

const questions: QuestionSeed[] = [
  // =========================
  // MEDICINE — PHARMACOLOGY
  // =========================

  {
    facultyCode: "MED",
    subjectName: "Pharmacology",
    topicName: "Cardiovascular Drugs",
    text: "Which of the following drugs is a beta-blocker commonly used in cardiovascular disease?",
    explanation:
      "Propranolol is a non-selective beta-adrenergic blocker used in several cardiovascular conditions.",
    difficulty: "EASY",
    options: [
      { text: "Propranolol", isCorrect: true },
      { text: "Amlodipine", isCorrect: false },
      { text: "Furosemide", isCorrect: false },
      { text: "Losartan", isCorrect: false },
    ],
  },

  {
    facultyCode: "MED",
    subjectName: "Pharmacology",
    topicName: "Autonomic Nervous System",
    text: "Which receptor is primarily stimulated by acetylcholine at the neuromuscular junction?",
    explanation:
      "Acetylcholine activates nicotinic Nm receptors at the skeletal neuromuscular junction.",
    difficulty: "MEDIUM",
    options: [
      { text: "Nicotinic Nm receptor", isCorrect: true },
      { text: "Muscarinic M2 receptor", isCorrect: false },
      { text: "Alpha-1 receptor", isCorrect: false },
      { text: "Beta-2 receptor", isCorrect: false },
    ],
  },

  {
    facultyCode: "MED",
    subjectName: "Pharmacology",
    topicName: "Antimicrobial Drugs",
    text: "Which antibiotic class inhibits bacterial cell wall synthesis?",
    explanation:
      "Beta-lactam antibiotics inhibit bacterial cell wall synthesis by targeting penicillin-binding proteins.",
    difficulty: "EASY",
    options: [
      { text: "Beta-lactams", isCorrect: true },
      { text: "Macrolides", isCorrect: false },
      { text: "Aminoglycosides", isCorrect: false },
      { text: "Tetracyclines", isCorrect: false },
    ],
  },

  // =========================
  // MEDICINE — ANATOMY
  // =========================

  {
    facultyCode: "MED",
    subjectName: "Anatomy",
    topicName: "Upper Limb",
    text: "Which nerve is commonly associated with the surgical neck of the humerus?",
    explanation:
      "The axillary nerve winds around the surgical neck of the humerus and can be injured in fractures there.",
    difficulty: "MEDIUM",
    options: [
      { text: "Axillary nerve", isCorrect: true },
      { text: "Median nerve", isCorrect: false },
      { text: "Ulnar nerve", isCorrect: false },
      { text: "Radial nerve", isCorrect: false },
    ],
  },

  {
    facultyCode: "MED",
    subjectName: "Anatomy",
    topicName: "Thorax",
    text: "Which chamber of the heart pumps blood into the pulmonary artery?",
    explanation:
      "The right ventricle pumps deoxygenated blood into the pulmonary artery toward the lungs.",
    difficulty: "EASY",
    options: [
      { text: "Right ventricle", isCorrect: true },
      { text: "Left ventricle", isCorrect: false },
      { text: "Right atrium", isCorrect: false },
      { text: "Left atrium", isCorrect: false },
    ],
  },

  // =========================
  // MEDICINE — PHYSIOLOGY
  // =========================

  {
    facultyCode: "MED",
    subjectName: "Physiology",
    topicName: "Cardiovascular System",
    text: "What is the main pacemaker of the normal human heart?",
    explanation:
      "The sinoatrial node normally generates the fastest spontaneous rhythm and acts as the heart's primary pacemaker.",
    difficulty: "EASY",
    options: [
      { text: "Sinoatrial node", isCorrect: true },
      { text: "AV node", isCorrect: false },
      { text: "Bundle of His", isCorrect: false },
      { text: "Purkinje fibers", isCorrect: false },
    ],
  },

  {
    facultyCode: "MED",
    subjectName: "Physiology",
    topicName: "Respiratory System",
    text: "Where does most gas exchange occur in the lungs?",
    explanation:
      "Gas exchange between alveolar air and pulmonary capillary blood occurs mainly across the alveolar-capillary membrane.",
    difficulty: "EASY",
    options: [
      { text: "Alveoli", isCorrect: true },
      { text: "Trachea", isCorrect: false },
      { text: "Bronchi", isCorrect: false },
      { text: "Larynx", isCorrect: false },
    ],
  },

  // =========================
  // PHARMACY
  // =========================

  {
    facultyCode: "PHAR",
    subjectName: "Pharmacology",
    topicName: "Cardiovascular Drugs",
    text: "Which drug class blocks the angiotensin II AT1 receptor?",
    explanation:
      "Angiotensin receptor blockers, or ARBs, selectively block the AT1 receptor.",
    difficulty: "MEDIUM",
    options: [
      { text: "ARBs", isCorrect: true },
      { text: "ACE inhibitors", isCorrect: false },
      { text: "Beta-blockers", isCorrect: false },
      { text: "Calcium channel blockers", isCorrect: false },
    ],
  },

  {
    facultyCode: "PHAR",
    subjectName: "Pharmaceutics",
    topicName: "Dosage Forms",
    text: "Which dosage form is designed to release the drug over an extended period?",
    explanation:
      "Modified-release dosage forms are designed to alter the rate or timing of drug release.",
    difficulty: "EASY",
    options: [
      { text: "Modified-release tablet", isCorrect: true },
      { text: "Immediate-release tablet", isCorrect: false },
      { text: "Oral solution", isCorrect: false },
      { text: "Simple syrup", isCorrect: false },
    ],
  },

  // =========================
  // DENTISTRY
  // =========================

  {
    facultyCode: "DENT",
    subjectName: "Oral Anatomy",
    topicName: "Teeth Anatomy",
    text: "Which tissue forms the outermost layer of the anatomical crown of a tooth?",
    explanation:
      "Enamel is the highly mineralized tissue covering the anatomical crown of the tooth.",
    difficulty: "EASY",
    options: [
      { text: "Enamel", isCorrect: true },
      { text: "Dentin", isCorrect: false },
      { text: "Cementum", isCorrect: false },
      { text: "Pulp", isCorrect: false },
    ],
  },

  // =========================
  // NURSING
  // =========================

  {
    facultyCode: "NURS",
    subjectName: "Fundamentals of Nursing",
    topicName: "Vital Signs",
    text: "Which vital sign directly measures arterial blood pressure?",
    explanation:
      "Blood pressure measurement provides systolic and diastolic arterial pressure values.",
    difficulty: "EASY",
    options: [
      { text: "Blood pressure", isCorrect: true },
      { text: "Respiratory rate", isCorrect: false },
      { text: "Temperature", isCorrect: false },
      { text: "Oxygen saturation", isCorrect: false },
    ],
  },

  // =========================
  // PHYSIOTHERAPY
  // =========================

  {
    facultyCode: "PT",
    subjectName: "Musculoskeletal Physiotherapy",
    topicName: "Shoulder",
    text: "Which muscle is a major contributor to shoulder abduction?",
    explanation:
      "The deltoid is a major muscle responsible for shoulder abduction, especially after the initial movement.",
    difficulty: "EASY",
    options: [
      { text: "Deltoid", isCorrect: true },
      { text: "Biceps brachii", isCorrect: false },
      { text: "Triceps brachii", isCorrect: false },
      { text: "Pectoralis major", isCorrect: false },
    ],
  },

  // =========================
  // VETERINARY MEDICINE
  // =========================

  {
    facultyCode: "VET",
    subjectName: "Veterinary Anatomy",
    topicName: "Digestive System",
    text: "Which organ is primarily responsible for chemical digestion in the stomach?",
    explanation:
      "The stomach secretes acid and digestive enzymes that contribute substantially to chemical digestion.",
    difficulty: "EASY",
    options: [
      { text: "Stomach", isCorrect: true },
      { text: "Trachea", isCorrect: false },
      { text: "Urinary bladder", isCorrect: false },
      { text: "Spleen", isCorrect: false },
    ],
  },

  // =========================
  // MEDICAL LABORATORY
  // =========================

  {
    facultyCode: "MLT",
    subjectName: "Clinical Chemistry",
    topicName: "Kidney Function Tests",
    text: "Which laboratory marker is commonly used to assess kidney filtration?",
    explanation:
      "Serum creatinine is commonly used to estimate kidney filtration and calculate estimated GFR.",
    difficulty: "EASY",
    options: [
      { text: "Creatinine", isCorrect: true },
      { text: "Bilirubin", isCorrect: false },
      { text: "ALT", isCorrect: false },
      { text: "Amylase", isCorrect: false },
    ],
  },
];

async function seedQuestions() {
  console.log("🧠 Starting question seed...\n");

  for (const questionData of questions) {
    const faculty = await db.orm.public.Faculty
      .where({
        code: questionData.facultyCode,
      })
      .first();

    if (!faculty) {
      console.log(
        `⚠️ Faculty not found: ${questionData.facultyCode}`
      );
      continue;
    }

    const subject = await db.orm.public.Subject
      .where({
        facultyId: faculty.id,
        name: questionData.subjectName,
      })
      .first();

    if (!subject) {
      console.log(
        `⚠️ Subject not found: ${questionData.subjectName}`
      );
      continue;
    }

    const topic = await db.orm.public.Topic
      .where({
        subjectId: subject.id,
        name: questionData.topicName,
      })
      .first();

    if (!topic) {
      console.log(
        `⚠️ Topic not found: ${questionData.topicName}`
      );
      continue;
    }

    const existingQuestion = await db.orm.public.Question
      .where({
        text: questionData.text,
      })
      .first();

    if (existingQuestion) {
      console.log(`↪️ Already exists: ${questionData.text}`);
      continue;
    }

    const question = await db.orm.public.Question.create({
      text: questionData.text,
      explanation: questionData.explanation,
      type: "SINGLE_CHOICE",
      difficulty: questionData.difficulty,
      subject: subject.name,
      topic: topic.name,
      topicId: topic.id,
      isActive: true,
    });

    for (
      let index = 0;
      index < questionData.options.length;
      index++
    ) {
      const option = questionData.options[index];

      await db.orm.public.QuestionOption.create({
        questionId: question.id,
        text: option.text,
        isCorrect: option.isCorrect,
        optionOrder: index,
      });
    }

    console.log(
      `✅ ${faculty.name} → ${subject.name} → ${topic.name}`
    );
  }

  console.log("\n🎉 Question seed completed successfully!");
}

seedQuestions().catch((error) => {
  console.error("\n❌ Question seed failed:");
  console.error(error);
  process.exit(1);
});