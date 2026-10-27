import { db } from "../server/db";

type TopicSeed = {
  name: string;
  description?: string;
};

type SubjectSeed = {
  name: string;
  code?: string;
  topics: TopicSeed[];
};

type FacultySeed = {
  name: string;
  code: string;
  subjects: SubjectSeed[];
};

const academicData: FacultySeed[] = [
  {
    name: "Medicine",
    code: "MED",
    subjects: [
      {
        name: "Anatomy",
        code: "ANAT",
        topics: [
          {
            name: "Upper Limb",
            description: "Bones, muscles, nerves, vessels and joints of the upper limb.",
          },
          {
            name: "Lower Limb",
            description: "Bones, muscles, nerves, vessels and joints of the lower limb.",
          },
          {
            name: "Thorax",
            description: "Anatomy of the thoracic wall, mediastinum, heart and lungs.",
          },
        ],
      },
      {
        name: "Physiology",
        code: "PHYS",
        topics: [
          {
            name: "Cardiovascular System",
            description: "Heart function, cardiac cycle, blood pressure and circulation.",
          },
          {
            name: "Respiratory System",
            description: "Ventilation, gas exchange and regulation of respiration.",
          },
          {
            name: "Nervous System",
            description: "Neural function, reflexes and nervous system physiology.",
          },
        ],
      },
      {
        name: "Pharmacology",
        code: "PHARM",
        topics: [
          {
            name: "Autonomic Nervous System",
            description: "Cholinergic and adrenergic drugs and their clinical effects.",
          },
          {
            name: "Cardiovascular Drugs",
            description: "Drugs used in hypertension, heart failure and cardiovascular disease.",
          },
          {
            name: "Antimicrobial Drugs",
            description: "Major antimicrobial classes, mechanisms and clinical uses.",
          },
        ],
      },
    ],
  },

  {
    name: "Pharmacy",
    code: "PHAR",
    subjects: [
      {
        name: "Pharmacology",
        code: "PHARM",
        topics: [
          {
            name: "Autonomic Drugs",
            description: "Drugs affecting sympathetic and parasympathetic systems.",
          },
          {
            name: "Cardiovascular Drugs",
            description: "Major drugs used in cardiovascular disorders.",
          },
          {
            name: "Antimicrobial Drugs",
            description: "Antibiotics and other antimicrobial agents.",
          },
        ],
      },
      {
        name: "Pharmaceutics",
        code: "PHARMACEUTICS",
        topics: [
          {
            name: "Dosage Forms",
            description: "Different pharmaceutical dosage forms and their characteristics.",
          },
          {
            name: "Drug Delivery",
            description: "Principles and systems of drug delivery.",
          },
        ],
      },
    ],
  },

  {
    name: "Dentistry",
    code: "DENT",
    subjects: [
      {
        name: "Oral Anatomy",
        code: "ORAL_ANAT",
        topics: [
          {
            name: "Teeth Anatomy",
            description: "Structure and morphology of teeth.",
          },
          {
            name: "Oral Cavity",
            description: "Anatomy of the oral cavity and related structures.",
          },
        ],
      },
      {
        name: "Oral Physiology",
        code: "ORAL_PHYS",
        topics: [
          {
            name: "Salivary Glands",
            description: "Function and regulation of salivary glands.",
          },
          {
            name: "Mastication",
            description: "Physiology of chewing and related muscles.",
          },
        ],
      },
    ],
  },

  {
    name: "Nursing",
    code: "NURS",
    subjects: [
      {
        name: "Fundamentals of Nursing",
        code: "FUND_NURS",
        topics: [
          {
            name: "Patient Assessment",
            description: "Basic principles of assessing patients.",
          },
          {
            name: "Vital Signs",
            description: "Measurement and interpretation of vital signs.",
          },
        ],
      },
      {
        name: "Medical-Surgical Nursing",
        code: "MED_SURG",
        topics: [
          {
            name: "Cardiovascular Nursing",
            description: "Nursing care for cardiovascular conditions.",
          },
          {
            name: "Respiratory Nursing",
            description: "Nursing care for respiratory conditions.",
          },
        ],
      },
    ],
  },

  {
    name: "Physiotherapy",
    code: "PT",
    subjects: [
      {
        name: "Musculoskeletal Physiotherapy",
        code: "MSK",
        topics: [
          {
            name: "Shoulder",
            description: "Assessment and rehabilitation of shoulder conditions.",
          },
          {
            name: "Knee",
            description: "Assessment and rehabilitation of knee conditions.",
          },
        ],
      },
      {
        name: "Exercise Therapy",
        code: "EX_THERAPY",
        topics: [
          {
            name: "Therapeutic Exercise",
            description: "Principles and applications of therapeutic exercise.",
          },
          {
            name: "Strength Training",
            description: "Strengthening principles used in rehabilitation.",
          },
        ],
      },
    ],
  },

  {
    name: "Veterinary Medicine",
    code: "VET",
    subjects: [
      {
        name: "Veterinary Anatomy",
        code: "VET_ANAT",
        topics: [
          {
            name: "Musculoskeletal System",
            description: "Anatomy of bones, joints and muscles in animals.",
          },
          {
            name: "Digestive System",
            description: "Anatomy of the digestive tract in animals.",
          },
        ],
      },
      {
        name: "Veterinary Pharmacology",
        code: "VET_PHARM",
        topics: [
          {
            name: "Antimicrobial Drugs",
            description: "Antimicrobial agents used in veterinary medicine.",
          },
          {
            name: "Anti-inflammatory Drugs",
            description: "Anti-inflammatory medications and their veterinary uses.",
          },
        ],
      },
    ],
  },

  {
    name: "Medical Laboratory",
    code: "MLT",
    subjects: [
      {
        name: "Clinical Chemistry",
        code: "CLIN_CHEM",
        topics: [
          {
            name: "Liver Function Tests",
            description: "Laboratory assessment of liver function.",
          },
          {
            name: "Kidney Function Tests",
            description: "Laboratory assessment of renal function.",
          },
        ],
      },
      {
        name: "Hematology",
        code: "HEM",
        topics: [
          {
            name: "Red Blood Cells",
            description: "RBC physiology, morphology and related disorders.",
          },
          {
            name: "White Blood Cells",
            description: "WBC types, functions and abnormalities.",
          },
        ],
      },
    ],
  },
];

async function seedAcademicData() {
  console.log("🌱 Starting academic data seed...\n");

  for (const facultyData of academicData) {
    const faculty = await db.orm.public.Faculty
      .where({ code: facultyData.code })
      .first();

    const facultyRecord =
      faculty ??
      (await db.orm.public.Faculty.create({
        name: facultyData.name,
        code: facultyData.code,
        isActive: true,
      }));

    console.log(`🏫 ${facultyRecord.name}`);

    for (const subjectData of facultyData.subjects) {
      const existingSubject = await db.orm.public.Subject
        .where({
          facultyId: facultyRecord.id,
          name: subjectData.name,
        })
        .first();

      const subject =
        existingSubject ??
        (await db.orm.public.Subject.create({
          facultyId: facultyRecord.id,
          name: subjectData.name,
          code: subjectData.code ?? null,
          isActive: true,
        }));

      console.log(`   📚 ${subject.name}`);

      for (const topicData of subjectData.topics) {
        const existingTopic = await db.orm.public.Topic
          .where({
            subjectId: subject.id,
            name: topicData.name,
          })
          .first();

        if (!existingTopic) {
          await db.orm.public.Topic.create({
            subjectId: subject.id,
            name: topicData.name,
            description: topicData.description ?? null,
            isActive: true,
          });

          console.log(`      └─ 🧠 ${topicData.name}`);
        }
      }
    }
  }

  console.log("\n✅ Academic data seeded successfully!");
}

seedAcademicData().catch((error) => {
  console.error("\n❌ Academic seed failed:");
  console.error(error);
  process.exit(1);
});