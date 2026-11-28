export type CurriculumSubject = { name: string; nameAr: string };
export type ProgramGroup = {
  id: string;
  name: string;
  nameAr: string;
  category: "Clinical" | "Allied health" | "Health technology" | "Public health";
  duration: string;
  specialties: string[];
  subjects: CurriculumSubject[];
};

const s = (pairs: Array<[string, string]>): CurriculumSubject[] =>
  pairs.map(([name, nameAr]) => ({ name, nameAr }));

/**
 * Broad medical and health-science starter catalog.
 * Program names and subject maps are intentionally not presented as official
 * curricula: degree titles, duration, tracks and course order vary by country
 * and institution. University-approved syllabi must replace/extend these maps.
 */
export const curriculumPrograms: ProgramGroup[] = [
  {
    id: "medicine", name: "Medicine", nameAr: "الطب البشري", category: "Clinical",
    duration: "Usually 5–6 academic years plus clinical training; confirm the local program.",
    specialties: ["Internal Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology", "Cardiology", "Neurology", "Psychiatry", "Dermatology", "Ophthalmology", "ENT", "Orthopedics", "Emergency Medicine", "Anesthesiology", "Family Medicine", "Radiology"],
    subjects: s([
      ["Human Anatomy", "التشريح"], ["Histology", "علم الأنسجة"], ["Embryology", "علم الأجنة"],
      ["Medical Physiology", "الفسيولوجيا الطبية"], ["Biochemistry", "الكيمياء الحيوية"], ["Genetics", "الوراثة"],
      ["Immunology", "المناعة"], ["Medical Microbiology", "الميكروبيولوجيا الطبية"], ["Parasitology", "الطفيليات"],
      ["Pathology", "علم الأمراض"], ["Pharmacology", "علم الأدوية"], ["Clinical Skills", "المهارات الإكلينيكية"],
      ["Community Medicine", "طب المجتمع"], ["Forensic Medicine", "الطب الشرعي"], ["Internal Medicine", "الباطنة"],
      ["General Surgery", "الجراحة العامة"], ["Pediatrics", "طب الأطفال"], ["Obstetrics & Gynecology", "النساء والتوليد"],
      ["Emergency Medicine", "طب الطوارئ"], ["Cardiology", "أمراض القلب"], ["Neurology", "الأمراض العصبية"],
      ["Psychiatry", "الطب النفسي"], ["Dermatology", "الأمراض الجلدية"], ["Ophthalmology", "طب وجراحة العيون"],
      ["ENT", "الأنف والأذن والحنجرة"], ["Orthopedics", "جراحة العظام"], ["Anesthesiology", "التخدير"],
      ["Radiology", "الأشعة"], ["Family Medicine", "طب الأسرة"], ["Clinical Ethics", "أخلاقيات المهنة"]
    ])
  },
  {
    id: "dentistry", name: "Dentistry", nameAr: "طب وجراحة الفم والأسنان", category: "Clinical",
    duration: "Program length and clinical requirements vary by country and university.",
    specialties: ["Orthodontics", "Endodontics", "Periodontology", "Oral Surgery", "Prosthodontics", "Pediatric Dentistry", "Oral Medicine", "Restorative Dentistry"],
    subjects: s([
      ["Head & Neck Anatomy", "تشريح الرأس والرقبة"], ["Oral Biology", "بيولوجيا الفم"], ["Dental Histology", "أنسجة الأسنان"],
      ["Dental Materials", "مواد طب الأسنان"], ["Tooth Morphology", "تشريح وشكل الأسنان"], ["Oral Pathology", "أمراض الفم"],
      ["Oral Microbiology", "ميكروبيولوجيا الفم"], ["Preclinical Operative Dentistry", "الحشو التحضيري"],
      ["Restorative Dentistry", "طب الأسنان الترميمي"], ["Endodontics", "علاج الجذور"],
      ["Periodontology", "أمراض اللثة"], ["Prosthodontics", "التركيبات"], ["Orthodontics", "تقويم الأسنان"],
      ["Oral & Maxillofacial Surgery", "جراحة الفم والوجه والفكين"], ["Pediatric Dentistry", "أسنان الأطفال"],
      ["Oral Radiology", "أشعة الفم والأسنان"], ["Dental Public Health", "صحة الفم العامة"]
    ])
  },
  {
    id: "pharmacy", name: "Pharmacy", nameAr: "الصيدلة", category: "Clinical",
    duration: "BPharm/PharmD structures and clinical placements vary by institution.",
    specialties: ["Clinical Pharmacy", "Pharmaceutical Industry", "Pharmaceutical Analysis", "Pharmacognosy", "Drug Information", "Pharmacovigilance", "Regulatory Affairs"],
    subjects: s([
      ["General Chemistry", "الكيمياء العامة"], ["Organic Chemistry", "الكيمياء العضوية"], ["Analytical Chemistry", "الكيمياء التحليلية"],
      ["Physical Pharmacy", "الصيدلة الفيزيائية"], ["Pharmaceutics", "الصيدلانيات"], ["Dosage Forms", "الأشكال الصيدلية"],
      ["Pharmaceutical Chemistry", "الكيمياء الصيدلية"], ["Medicinal Chemistry", "الكيمياء الدوائية"],
      ["Pharmacology", "علم الأدوية"], ["Pharmacotherapy", "العلاجيات"], ["Clinical Pharmacy", "الصيدلة الإكلينيكية"],
      ["Pharmacognosy", "العقاقير"], ["Pharmacokinetics", "حركية الدواء"], ["Toxicology", "علم السموم"],
      ["Pharmaceutical Microbiology", "الميكروبيولوجيا الصيدلية"], ["Biochemistry", "الكيمياء الحيوية"],
      ["Pathophysiology", "الفيزيولوجيا المرضية"], ["Drug Information", "معلومات الدواء"],
      ["Pharmacovigilance", "اليقظة الدوائية"], ["Community Pharmacy", "صيدلة المجتمع"],
      ["Hospital Pharmacy", "صيدلة المستشفيات"], ["Clinical Skills & Patient Counseling", "المهارات الإكلينيكية وإرشاد المريض"]
    ])
  },
  {
    id: "physiotherapy", name: "Physical Therapy", nameAr: "العلاج الطبيعي", category: "Clinical",
    duration: "Degree structure and supervised clinical practice vary by institution.",
    specialties: ["Musculoskeletal", "Neurological", "Pediatric", "Cardiopulmonary", "Sports", "Geriatric", "Women's Health", "Community Rehabilitation"],
    subjects: s([
      ["Functional Anatomy", "التشريح الوظيفي"], ["Human Physiology", "فسيولوجيا الإنسان"], ["Kinesiology", "علم الحركة"],
      ["Biomechanics", "الميكانيكا الحيوية"], ["Exercise Physiology", "فسيولوجيا التمرين"], ["Therapeutic Exercise", "التمرينات العلاجية"],
      ["Electrotherapy", "العلاج الكهربائي"], ["Manual Therapy", "العلاج اليدوي"], ["Clinical Assessment", "التقييم الإكلينيكي"],
      ["Musculoskeletal Rehabilitation", "تأهيل الجهاز العضلي الهيكلي"], ["Neurological Rehabilitation", "التأهيل العصبي"],
      ["Cardiopulmonary Physical Therapy", "العلاج الطبيعي القلبي التنفسي"], ["Pediatric Physical Therapy", "علاج طبيعي الأطفال"],
      ["Geriatric Rehabilitation", "تأهيل كبار السن"], ["Sports Rehabilitation", "التأهيل الرياضي"],
      ["Prosthetics & Orthotics", "الأطراف الصناعية والأجهزة التعويضية"], ["Research Methods", "مناهج البحث"]
    ])
  },
  {
    id: "nursing", name: "Nursing", nameAr: "التمريض", category: "Clinical",
    duration: "Degree level, placement hours and specialty tracks vary by institution.",
    specialties: ["Medical-Surgical", "Critical Care", "Emergency", "Pediatric", "Maternal & Newborn", "Psychiatric", "Community", "Oncology", "Operating Room"],
    subjects: s([
      ["Fundamentals of Nursing", "أساسيات التمريض"], ["Anatomy & Physiology", "التشريح والفسيولوجيا"],
      ["Health Assessment", "التقييم الصحي"], ["Fundamentals of Pharmacology", "أساسيات علم الأدوية"],
      ["Medical-Surgical Nursing", "تمريض الباطنة والجراحة"], ["Pediatric Nursing", "تمريض الأطفال"],
      ["Obstetric & Maternal Nursing", "تمريض النساء والأمومة"], ["Community Health Nursing", "تمريض صحة المجتمع"],
      ["Psychiatric Nursing", "تمريض الصحة النفسية"], ["Critical Care Nursing", "تمريض الحالات الحرجة"],
      ["Emergency Nursing", "تمريض الطوارئ"], ["Nursing Ethics", "أخلاقيات التمريض"],
      ["Infection Prevention", "مكافحة العدوى"], ["Patient Safety", "سلامة المريض"],
      ["Nursing Research", "بحوث التمريض"], ["Leadership & Management", "القيادة والإدارة"]
    ])
  },
  {
    id: "veterinary", name: "Veterinary Medicine", nameAr: "الطب البيطري", category: "Clinical",
    duration: "Program structure and clinical/field placements vary by country and university.",
    specialties: ["Small Animal Medicine", "Large Animal Medicine", "Surgery", "Poultry", "Animal Reproduction", "Pathology", "Public Veterinary Health", "Food Safety"],
    subjects: s([
      ["Veterinary Anatomy", "التشريح البيطري"], ["Veterinary Histology", "الأنسجة البيطرية"],
      ["Animal Physiology", "فسيولوجيا الحيوان"], ["Veterinary Biochemistry", "الكيمياء الحيوية البيطرية"],
      ["Veterinary Microbiology", "الميكروبيولوجيا البيطرية"], ["Veterinary Parasitology", "الطفيليات البيطرية"],
      ["Veterinary Pathology", "الأمراض البيطرية"], ["Veterinary Pharmacology", "الأدوية البيطرية"],
      ["Animal Nutrition", "تغذية الحيوان"], ["Animal Genetics & Breeding", "الوراثة والتربية"],
      ["Veterinary Medicine", "الطب الباطني البيطري"], ["Veterinary Surgery", "الجراحة البيطرية"],
      ["Theriogenology", "التناسل والتوليد البيطري"], ["Poultry Diseases", "أمراض الدواجن"],
      ["Public Veterinary Health", "الصحة البيطرية العامة"], ["Food Hygiene", "صحة وسلامة الأغذية"]
    ])
  },
  {
    id: "applied-health-sciences", name: "Applied Health Sciences Technology", nameAr: "تكنولوجيا العلوم الصحية التطبيقية", category: "Health technology",
    duration: "Tracks and degree titles differ between institutions; some are departments within one faculty.",
    specialties: ["Medical Laboratory Technology", "Radiology & Imaging", "Anesthesia & Intensive Care", "Critical Care & Emergency", "Medical Devices", "Prosthetics & Orthotics", "Dental Technology", "Respiratory Care"],
    subjects: s([
      ["Human Anatomy & Physiology", "تشريح وفسيولوجيا الإنسان"], ["Medical Terminology", "المصطلحات الطبية"],
      ["Patient Care & Safety", "رعاية المريض وسلامته"], ["Medical Ethics", "أخلاقيات المهنة"],
      ["Infection Control", "مكافحة العدوى"], ["Basic Pathology", "أساسيات علم الأمراض"],
      ["Clinical Measurements", "القياسات الإكلينيكية"], ["Health Technology", "التكنولوجيا الصحية"],
      ["Medical Equipment", "الأجهزة الطبية"], ["Quality Assurance", "ضمان الجودة"],
      ["Research Methods", "مناهج البحث"], ["Clinical Practicum", "التدريب الإكلينيكي"]
    ])
  },
  {
    id: "medical-laboratory", name: "Medical Laboratory Sciences", nameAr: "علوم المختبرات الطبية", category: "Health technology",
    duration: "May be a degree or a specialization within applied health sciences.",
    specialties: ["Clinical Chemistry", "Hematology", "Microbiology", "Immunology", "Molecular Diagnostics", "Histopathology", "Blood Banking"],
    subjects: s([
      ["Clinical Chemistry", "الكيمياء الإكلينيكية"], ["Hematology", "أمراض الدم"], ["Clinical Microbiology", "الميكروبيولوجيا الإكلينيكية"],
      ["Immunology & Serology", "المناعة والأمصال"], ["Parasitology", "الطفيليات"], ["Histopathology", "الأنسجة المرضية"],
      ["Cytology", "علم الخلايا"], ["Molecular Diagnostics", "التشخيص الجزيئي"], ["Blood Banking", "بنوك الدم"],
      ["Urinalysis & Body Fluids", "تحليل البول وسوائل الجسم"], ["Laboratory Quality Systems", "نظم جودة المعامل"],
      ["Laboratory Safety", "سلامة المعامل"], ["Clinical Biochemistry", "الكيمياء الحيوية الإكلينيكية"]
    ])
  },
  {
    id: "radiology", name: "Radiology & Medical Imaging Technology", nameAr: "تكنولوجيا الأشعة والتصوير الطبي", category: "Health technology",
    duration: "Degree or track name varies; imaging practice requires supervised training.",
    specialties: ["Diagnostic Radiography", "CT", "MRI", "Ultrasound", "Mammography", "Nuclear Medicine"],
    subjects: s([
      ["Radiographic Anatomy", "التشريح الإشعاعي"], ["Radiation Physics", "فيزياء الإشعاع"], ["Radiographic Positioning", "أوضاع التصوير الإشعاعي"],
      ["Image Production", "إنتاج الصور"], ["Radiation Protection", "الوقاية من الإشعاع"], ["CT Imaging", "التصوير المقطعي"],
      ["MRI Physics & Imaging", "فيزياء وتصوير الرنين المغناطيسي"], ["Ultrasound", "الموجات فوق الصوتية"],
      ["Nuclear Medicine", "الطب النووي"], ["Contrast Media", "مواد التباين"], ["Image Evaluation", "تقييم الصور"],
      ["Patient Care in Imaging", "رعاية المريض بقسم الأشعة"]
    ])
  },
  {
    id: "anesthesia-technology", name: "Anesthesia & Intensive Care Technology", nameAr: "تكنولوجيا التخدير والرعاية المركزة", category: "Health technology",
    duration: "May be offered as an applied health-sciences track; scope is institution-specific.",
    specialties: ["Anesthesia Technology", "Operating Room Support", "ICU Technology", "Recovery Care"],
    subjects: s([
      ["Applied Anatomy", "التشريح التطبيقي"], ["Applied Physiology", "الفسيولوجيا التطبيقية"], ["Anesthesia Equipment", "أجهزة التخدير"],
      ["Airway & Respiratory Support", "دعم مجرى الهواء والتنفس"], ["Monitoring & Patient Safety", "المراقبة وسلامة المريض"],
      ["Anesthesia Pharmacology", "أدوية التخدير"], ["Operating Room Practice", "ممارسات غرفة العمليات"],
      ["Critical Care Fundamentals", "أساسيات الرعاية الحرجة"], ["Emergency Response", "الاستجابة للطوارئ"],
      ["Infection Prevention", "مكافحة العدوى"]
    ])
  },
  {
    id: "critical-care", name: "Critical Care & Emergency Care", nameAr: "الرعاية الحرجة والطوارئ", category: "Health technology",
    duration: "Often a professional track or applied health-sciences specialization, not a standalone faculty everywhere.",
    specialties: ["Emergency Care", "Critical Care", "Prehospital Care", "Trauma Support"],
    subjects: s([
      ["Emergency Assessment", "التقييم في الطوارئ"], ["Basic & Advanced Life Support", "دعم الحياة الأساسي والمتقدم"],
      ["Trauma Care Principles", "مبادئ رعاية الإصابات"], ["Cardiorespiratory Monitoring", "مراقبة القلب والتنفس"],
      ["Emergency Pharmacology", "أدوية الطوارئ"], ["Patient Transport & Handover", "نقل المريض وتسليم الحالة"],
      ["Disaster Medicine", "طب الكوارث"], ["Critical Care Fundamentals", "أساسيات الرعاية الحرجة"],
      ["Clinical Communication", "التواصل الإكلينيكي"], ["Patient Safety", "سلامة المريض"]
    ])
  },
  {
    id: "respiratory-therapy", name: "Respiratory Therapy", nameAr: "العلاج التنفسي", category: "Allied health",
    duration: "Program availability and scope vary by country and institution.",
    specialties: ["Adult Critical Care", "Neonatal & Pediatric Respiratory Care", "Pulmonary Rehabilitation", "Sleep Medicine"],
    subjects: s([
      ["Respiratory Anatomy & Physiology", "تشريح وفسيولوجيا الجهاز التنفسي"], ["Pulmonary Pathophysiology", "الفيزيولوجيا المرضية للرئة"],
      ["Pulmonary Function Testing", "اختبارات وظائف الرئة"], ["Oxygen Therapy", "العلاج بالأكسجين"],
      ["Mechanical Ventilation", "التهوية الميكانيكية"], ["Airway Management", "إدارة مجرى الهواء"],
      ["Respiratory Pharmacology", "أدوية الجهاز التنفسي"], ["Critical Care", "الرعاية الحرجة"],
      ["Neonatal Respiratory Care", "رعاية حديثي الولادة التنفسية"], ["Pulmonary Rehabilitation", "التأهيل الرئوي"]
    ])
  },
  {
    id: "occupational-therapy", name: "Occupational Therapy", nameAr: "العلاج الوظيفي", category: "Allied health",
    duration: "Degree title, clinical placements and professional recognition vary by country.",
    specialties: ["Pediatric OT", "Neurological OT", "Hand Therapy", "Mental Health OT", "Geriatric OT"],
    subjects: s([
      ["Functional Anatomy", "التشريح الوظيفي"], ["Human Development", "النمو الإنساني"], ["Activity Analysis", "تحليل الأنشطة"],
      ["Occupational Performance", "الأداء الوظيفي"], ["Assistive Technology", "التكنولوجيا المساعدة"],
      ["Pediatric Rehabilitation", "تأهيل الأطفال"], ["Neurological Rehabilitation", "التأهيل العصبي"],
      ["Mental Health Practice", "ممارسة الصحة النفسية"], ["Hand & Upper Limb Therapy", "علاج اليد والطرف العلوي"],
      ["Rehabilitation Assessment", "تقييم التأهيل"]
    ])
  },
  {
    id: "prosthetics-orthotics", name: "Prosthetics & Orthotics", nameAr: "الأطراف الصناعية والأجهزة التقويمية", category: "Allied health",
    duration: "May be a separate degree or a specialization within rehabilitation/health technology.",
    specialties: ["Lower-Limb Prosthetics", "Upper-Limb Prosthetics", "Orthotics", "Pediatric Orthotics", "Gait & Mobility"],
    subjects: s([
      ["Functional Anatomy", "التشريح الوظيفي"], ["Biomechanics", "الميكانيكا الحيوية"], ["Materials Science", "علم المواد"],
      ["Prosthetic Design", "تصميم الأطراف الصناعية"], ["Orthotic Design", "تصميم الأجهزة التقويمية"],
      ["Gait Analysis", "تحليل المشي"], ["Rehabilitation Principles", "مبادئ التأهيل"],
      ["Limb Assessment", "تقييم الأطراف"], ["Assistive Technology", "التكنولوجيا المساعدة"]
    ])
  },
  {
    id: "dental-technology", name: "Dental Technology", nameAr: "تكنولوجيا وصناعة الأسنان", category: "Health technology",
    duration: "Often a technical/applied program; not a separate faculty at every university.",
    specialties: ["Fixed Prosthodontics", "Removable Prosthodontics", "Orthodontic Appliances", "Digital Dentistry"],
    subjects: s([
      ["Dental Anatomy", "تشريح الأسنان"], ["Dental Materials", "مواد الأسنان"], ["Dental Laboratory Safety", "سلامة معمل الأسنان"],
      ["Fixed Prosthodontics", "التركيبات الثابتة"], ["Removable Prosthodontics", "التركيبات المتحركة"],
      ["Orthodontic Appliances", "أجهزة تقويم الأسنان"], ["Dental Ceramics", "خزف الأسنان"],
      ["CAD/CAM Dentistry", "تصميم وتصنيع الأسنان بالحاسوب"], ["Occlusion", "إطباق الأسنان"]
    ])
  },
  {
    id: "optometry", name: "Optometry", nameAr: "قياس وتصحيح الإبصار", category: "Allied health",
    duration: "Degree availability and licensing requirements vary considerably.",
    specialties: ["Primary Eye Care", "Contact Lenses", "Pediatric Optometry", "Low-Vision Care"],
    subjects: s([
      ["Ocular Anatomy & Physiology", "تشريح وفسيولوجيا العين"], ["Geometrical Optics", "البصريات الهندسية"],
      ["Visual Optics", "بصريات الإبصار"], ["Ocular Disease", "أمراض العين"], ["Refraction", "قياس الانكسار"],
      ["Contact Lenses", "العدسات اللاصقة"], ["Binocular Vision", "الرؤية الثنائية"],
      ["Pediatric Optometry", "قياس إبصار الأطفال"], ["Low-Vision Rehabilitation", "تأهيل ضعف الإبصار"]
    ])
  },
  {
    id: "speech-language", name: "Speech & Language Therapy", nameAr: "علاج اضطرابات النطق واللغة", category: "Allied health",
    duration: "Professional qualification and clinical placement requirements are country-specific.",
    specialties: ["Pediatric Speech", "Adult Neurogenic Communication", "Voice", "Fluency", "Swallowing"],
    subjects: s([
      ["Anatomy of Speech & Hearing", "تشريح النطق والسمع"], ["Language Development", "تطور اللغة"],
      ["Phonetics & Phonology", "الصوتيات والفونولوجيا"], ["Speech Sound Disorders", "اضطرابات أصوات الكلام"],
      ["Language Disorders", "اضطرابات اللغة"], ["Voice Disorders", "اضطرابات الصوت"],
      ["Fluency Disorders", "اضطرابات الطلاقة"], ["Dysphagia", "اضطرابات البلع"],
      ["Neurological Communication Disorders", "اضطرابات التواصل العصبية"], ["Clinical Assessment", "التقييم الإكلينيكي"]
    ])
  },
  {
    id: "nutrition", name: "Nutrition & Dietetics", nameAr: "التغذية العلاجية وعلوم التغذية", category: "Clinical",
    duration: "May be a degree, department or track within health, agriculture or applied sciences.",
    specialties: ["Clinical Nutrition", "Pediatric Nutrition", "Community Nutrition", "Sports Nutrition", "Food Service"],
    subjects: s([
      ["Human Nutrition", "تغذية الإنسان"], ["Nutritional Biochemistry", "الكيمياء الحيوية الغذائية"],
      ["Nutrition Across the Lifespan", "التغذية عبر مراحل العمر"], ["Clinical Dietetics", "التغذية العلاجية"],
      ["Medical Nutrition Therapy", "العلاج بالتغذية الطبية"], ["Food Science", "علوم الأغذية"],
      ["Food Safety", "سلامة الغذاء"], ["Nutrition Assessment", "التقييم الغذائي"],
      ["Community Nutrition", "تغذية المجتمع"], ["Sports Nutrition", "التغذية الرياضية"]
    ])
  },
  {
    id: "public-health", name: "Public Health", nameAr: "الصحة العامة وطب المجتمع", category: "Public health",
    duration: "Can be a degree, faculty, department or postgraduate specialization.",
    specialties: ["Epidemiology", "Health Promotion", "Environmental Health", "Global Health", "Health Policy", "Occupational Health"],
    subjects: s([
      ["Epidemiology", "علم الوبائيات"], ["Biostatistics", "الإحصاء الحيوي"], ["Health Promotion", "تعزيز الصحة"],
      ["Environmental Health", "الصحة البيئية"], ["Global Health", "الصحة العالمية"], ["Health Policy", "السياسات الصحية"],
      ["Health Economics", "اقتصاديات الصحة"], ["Infection Prevention", "مكافحة العدوى"],
      ["Occupational Health", "الصحة المهنية"], ["Community Health Assessment", "تقييم صحة المجتمع"],
      ["Research Methods", "مناهج البحث"], ["Healthcare Management", "إدارة الرعاية الصحية"]
    ])
  },
  {
    id: "biomedical-engineering", name: "Biomedical Engineering", nameAr: "الهندسة الطبية الحيوية", category: "Health technology",
    duration: "Engineering degree with medical-device and healthcare applications; program structure varies.",
    specialties: ["Medical Devices", "Clinical Engineering", "Medical Imaging Systems", "Rehabilitation Engineering", "Biomaterials"],
    subjects: s([
      ["Human Anatomy & Physiology", "تشريح وفسيولوجيا الإنسان"], ["Engineering Mathematics", "رياضيات هندسية"],
      ["Electronics", "الإلكترونيات"], ["Signals & Systems", "الإشارات والنظم"],
      ["Medical Instrumentation", "الأجهزة والقياسات الطبية"], ["Biomedical Signals", "الإشارات الحيوية"],
      ["Medical Imaging", "التصوير الطبي"], ["Biomaterials", "المواد الحيوية"],
      ["Biomechanics", "الميكانيكا الحيوية"], ["Clinical Engineering", "الهندسة الإكلينيكية"],
      ["Rehabilitation Engineering", "هندسة التأهيل"], ["Medical Device Safety", "سلامة الأجهزة الطبية"]
    ])
  },
  {
    id: "health-informatics", name: "Health & Medical Informatics", nameAr: "المعلوماتية الصحية والطبية", category: "Health technology",
    duration: "May be offered as a degree, department or postgraduate specialization.",
    specialties: ["Clinical Informatics", "Health Information Management", "Digital Health", "Healthcare Analytics", "Medical AI"],
    subjects: s([
      ["Medical Terminology", "المصطلحات الطبية"], ["Health Information Systems", "نظم المعلومات الصحية"],
      ["Electronic Health Records", "السجلات الصحية الإلكترونية"], ["Health Data Standards", "معايير البيانات الصحية"],
      ["Database Systems", "قواعد البيانات"], ["Healthcare Analytics", "تحليلات الرعاية الصحية"],
      ["Biostatistics", "الإحصاء الحيوي"], ["Clinical Decision Support", "دعم القرار الإكلينيكي"],
      ["Health Data Privacy & Security", "خصوصية وأمن البيانات الصحية"], ["Digital Health", "الصحة الرقمية"],
      ["AI in Healthcare", "الذكاء الاصطناعي في الرعاية الصحية"]
    ])
  },
  {
    id: "biomedical-sciences", name: "Biomedical Sciences", nameAr: "العلوم الطبية الحيوية", category: "Health technology",
    duration: "Degree and department names vary; some subjects are shared with medical science faculties.",
    specialties: ["Molecular Biology", "Medical Genetics", "Immunology", "Medical Microbiology", "Neuroscience", "Cancer Biology"],
    subjects: s([
      ["Cell Biology", "بيولوجيا الخلية"], ["Molecular Biology", "الأحياء الجزيئية"], ["Human Genetics", "الوراثة البشرية"],
      ["Biochemistry", "الكيمياء الحيوية"], ["Immunology", "علم المناعة"], ["Medical Microbiology", "الميكروبيولوجيا الطبية"],
      ["Human Physiology", "فسيولوجيا الإنسان"], ["Pathobiology", "بيولوجيا الأمراض"],
      ["Neuroscience", "علوم الأعصاب"], ["Cancer Biology", "بيولوجيا السرطان"],
      ["Molecular Diagnostics", "التشخيص الجزيئي"], ["Research Laboratory Skills", "مهارات المعامل البحثية"]
    ])
  },
  {
    id: "medical-biotechnology", name: "Medical Biotechnology", nameAr: "التكنولوجيا الحيوية الطبية", category: "Health technology",
    duration: "Often a science/biotechnology program with medical applications, not a clinical-license degree.",
    specialties: ["Molecular Diagnostics", "Genetic Engineering", "Biopharmaceuticals", "Cell & Gene Therapy Research"],
    subjects: s([
      ["Cell Biology", "بيولوجيا الخلية"], ["Genetics", "علم الوراثة"], ["Molecular Biology", "الأحياء الجزيئية"],
      ["Microbiology", "علم الأحياء الدقيقة"], ["Immunology", "علم المناعة"], ["Biochemistry", "الكيمياء الحيوية"],
      ["Genetic Engineering", "الهندسة الوراثية"], ["Bioprocess Technology", "تكنولوجيا العمليات الحيوية"],
      ["Bioinformatics", "المعلوماتية الحيوية"], ["Molecular Diagnostics", "التشخيص الجزيئي"],
      ["Biopharmaceuticals", "المستحضرات الحيوية الدوائية"], ["Laboratory Quality & Safety", "جودة وسلامة المعامل"]
    ])
  }
];

export const curriculumRegions = [
  "Egypt", "International / multi-country", "United Kingdom", "United States",
  "European Union", "Other / not listed"
];

export const curriculumCategories = ["All programs", "Clinical", "Allied health", "Health technology", "Public health"] as const;
