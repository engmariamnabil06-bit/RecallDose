import { Stethoscope } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

const universities = [
  "Assiut University",
  "Sohag University",
  "Cairo University",
  "Ain Shams University",
  "Alexandria University",
  "Mansoura University",
  "Tanta University",
  "Zagazig University",
  "Minya University",
  "Beni-Suef University",
  "Al-Azhar University",
  "Helwan University",
  "October 6 University",
  "MUST",
  "GUC",
  "BUE",
  "FUE",
  "NGU",
  "Nile University",
  "Other",
];

const faculties = [
  "Medicine",
  "Pharmacy",
  "Dentistry",
  "Nursing",
  "Physiotherapy",
  "Veterinary Medicine",
  "Medical Laboratory",
  "Other",
];

const years = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "6th Year",
  "Intern",
  "Graduate",
];

const specializations: Record<string, string[]> = {
  Medicine: [
    "General Medicine",
    "Internal Medicine",
    "Surgery",
    "Pediatrics",
    "Obstetrics & Gynecology",
    "Cardiology",
    "Neurology",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "Other",
  ],

  Pharmacy: [
    "General Pharmacy",
    "Clinical Pharmacy",
    "Pharmaceutics",
    "Pharmacology",
    "Pharmaceutical Chemistry",
    "Pharmacognosy",
    "Other",
  ],

  Dentistry: [
    "General Dentistry",
    "Oral Surgery",
    "Orthodontics",
    "Prosthodontics",
    "Periodontics",
    "Pediatric Dentistry",
    "Other",
  ],

  Nursing: [
    "General Nursing",
    "Critical Care Nursing",
    "Pediatric Nursing",
    "Medical-Surgical Nursing",
    "Community Health Nursing",
    "Other",
  ],

  Physiotherapy: [
    "General Physiotherapy",
    "Orthopedic Physiotherapy",
    "Neurological Physiotherapy",
    "Pediatric Physiotherapy",
    "Sports Physiotherapy",
    "Other",
  ],

  "Veterinary Medicine": [
    "General Veterinary Medicine",
    "Surgery",
    "Internal Medicine",
    "Pathology",
    "Pharmacology",
    "Other",
  ],

  "Medical Laboratory": [
    "General Laboratory",
    "Clinical Chemistry",
    "Hematology",
    "Microbiology",
    "Immunology",
    "Pathology",
    "Other",
  ],

  Other: [
    "Other",
  ],
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [faculty, setFaculty] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [otherFaculty, setOtherFaculty] = useState("");
  const [otherUniversity, setOtherUniversity] = useState("");
  const [otherSpecialization, setOtherSpecialization] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = () => {
    if (!password) {
      return {
        label: "",
        score: 0,
        className: "",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Weak",
        score: 1,
        className: "weak",
      };
    }

    if (score === 2) {
      return {
        label: "Fair",
        score: 2,
        className: "fair",
      };
    }

    if (score === 3) {
      return {
        label: "Good",
        score: 3,
        className: "good",
      };
    }

    return {
      label: "Strong",
      score: 4,
      className: "strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  const currentSpecializations =
    specializations[faculty] || ["Other"];

  const handleFacultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setFaculty(value);

    // Reset specialization whenever faculty changes
    setSpecialization("");
    setOtherSpecialization("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});

    const formData = new FormData(event.currentTarget);

    const firstName = String(
      formData.get("firstName") || ""
    ).trim();

    const lastName = String(
      formData.get("lastName") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim();

    const newErrors: Record<string, string> = {};

    if (!firstName) {
      newErrors.firstName =
        "First name is required.";
    }

    if (!lastName) {
      newErrors.lastName =
        "Last name is required.";
    }

    if (!email) {
      newErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password =
        "Password is required.";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    } else if (passwordStrength.score < 3) {
      newErrors.password =
        "Please choose a stronger password.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!faculty) {
      newErrors.faculty =
        "Please select your faculty.";
    }

    if (
      faculty === "Other" &&
      !otherFaculty.trim()
    ) {
      newErrors.otherFaculty =
        "Please enter your faculty name.";
    }

    if (!university) {
      newErrors.university =
        "Please select your university.";
    }

    if (
      university === "Other" &&
      !otherUniversity.trim()
    ) {
      newErrors.otherUniversity =
        "Please enter your university name.";
    }

    if (!year) {
      newErrors.year =
        "Please select your study year.";
    }

    if (!specialization) {
      newErrors.specialization =
        "Please select your specialization.";
    }

    if (
      specialization === "Other" &&
      !otherSpecialization.trim()
    ) {
      newErrors.otherSpecialization =
        "Please enter your specialization.";
    }

    if (!termsAccepted) {
      newErrors.terms =
        "You must agree to the Terms and Privacy Policy.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const finalFaculty = faculty === "Other" ? otherFaculty.trim() : faculty;
    const finalUniversity = university === "Other" ? otherUniversity.trim() : university;
    const finalSpecialization = specialization === "Other" ? otherSpecialization.trim() : specialization;

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          faculty: finalFaculty,
          university: finalUniversity,
          year,
          specialization: finalSpecialization,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Could not create your account. Please try again.");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors({
        general: error instanceof Error
          ? error.message
          : "Could not create your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Stars */}
      <div
        className="auth-stars"
        aria-hidden="true"
      >
        <span className="star star-1">✦</span>
        <span className="star star-2">·</span>
        <span className="star star-3">✦</span>
        <span className="star star-4">·</span>
        <span className="star star-5">✧</span>
        <span className="star star-6">·</span>
        <span className="star star-7">✦</span>
        <span className="star star-8">·</span>
        <span className="star star-9">✧</span>
        <span className="star star-10">·</span>
        <span className="star star-11">✦</span>
        <span className="star star-12">·</span>
      </div>

      {/* Glow */}
      <div className="auth-glow auth-glow-purple"></div>
      <div className="auth-glow auth-glow-blue"></div>

      <div className="auth-container">

        {/* Logo */}
        <a
          href="/"
          className="auth-logo"
        >
          <span className="auth-logo-mark">
            R
          </span>

          <span>RECALLDOSE</span>
        </a>

        <div className="auth-card register-card">

          {/* Welcome */}
          <div className="auth-welcome">
            <span className="welcome-spark">
              ✦
            </span>

            <span className="auth-eyebrow">
              WELCOME TO RECALLDOSE
            </span>

            <h1>
              Hey, future doctor.
              <span><Stethoscope size={23} strokeWidth={1.7} aria-hidden="true" /></span>
            </h1>

            <p>
              Your medical recall journey
              starts here.
            </p>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h2>
              Create your
              <span>recall account.</span>
            </h2>

            <p>
              Build stronger memory, track
              your progress, and become harder
              to forget.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* Name */}
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="firstName">
                  First name
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-regular fa-user"></i>
                  </span>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Mariam"
                  />
                </div>

                {errors.firstName && (
                  <small className="form-error">
                    {errors.firstName}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last name
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-regular fa-user"></i>
                  </span>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Nabil"
                  />
                </div>

                {errors.lastName && (
                  <small className="form-error">
                    {errors.lastName}
                  </small>
                )}
              </div>

            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fa-regular fa-envelope"></i>
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              {errors.email && (
                <small className="form-error">
                  {errors.email}
                </small>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-lock"></i>
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <i
                    className={
                      showPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  ></i>
                </button>
              </div>

              {password && (
                <div className="password-strength">

                  <div className="strength-header">
                    <span>
                      Password strength
                    </span>

                    <strong
                      className={`strength-text ${passwordStrength.className}`}
                    >
                      {passwordStrength.label}
                    </strong>
                  </div>

                  <div className="strength-bars">
                    {[1, 2, 3, 4].map(
                      (bar) => (
                        <span
                          key={bar}
                          className={
                            bar <=
                            passwordStrength.score
                              ? `active ${passwordStrength.className}`
                              : ""
                          }
                        ></span>
                      )
                    )}
                  </div>

                  <p>
                    Use 8+ characters with
                    numbers, uppercase letters,
                    and symbols.
                  </p>

                </div>
              )}

              {errors.password && (
                <small className="form-error">
                  {errors.password}
                </small>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </span>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <i
                    className={
                      showConfirmPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  ></i>
                </button>
              </div>

              {errors.confirmPassword && (
                <small className="form-error">
                  {errors.confirmPassword}
                </small>
              )}
            </div>

            {/* Faculty */}
            <div className="form-group">
              <label htmlFor="faculty">
                Faculty
              </label>

              <div className="input-wrapper select-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-building-columns"></i>
                </span>

                <select
                  id="faculty"
                  name="faculty"
                  value={faculty}
                  onChange={handleFacultyChange}
                >
                  <option value="" disabled>
                    Select your faculty
                  </option>

                  {faculties.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {faculty === "Other" && (
                <div className="other-field">
                  <input
                    type="text"
                    placeholder="Enter your faculty name"
                    value={otherFaculty}
                    onChange={(event) =>
                      setOtherFaculty(
                        event.target.value
                      )
                    }
                  />
                </div>
              )}

              {errors.faculty && (
                <small className="form-error">
                  {errors.faculty}
                </small>
              )}

              {errors.otherFaculty && (
                <small className="form-error">
                  {errors.otherFaculty}
                </small>
              )}
            </div>

            {/* University */}
            <div className="form-group">
              <label htmlFor="university">
                University
              </label>

              <div className="input-wrapper select-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-university"></i>
                </span>

                <select
                  id="university"
                  name="university"
                  value={university}
                  onChange={(event) =>
                    setUniversity(
                      event.target.value
                    )
                  }
                >
                  <option value="" disabled>
                    Select your university
                  </option>

                  {universities.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {university === "Other" && (
                <div className="other-field">
                  <input
                    type="text"
                    placeholder="Enter your university name"
                    value={otherUniversity}
                    onChange={(event) =>
                      setOtherUniversity(
                        event.target.value
                      )
                    }
                  />
                </div>
              )}

              {errors.university && (
                <small className="form-error">
                  {errors.university}
                </small>
              )}

              {errors.otherUniversity && (
                <small className="form-error">
                  {errors.otherUniversity}
                </small>
              )}
            </div>

            {/* Study Year */}
            <div className="form-group">
              <label htmlFor="year">
                Study year
              </label>

              <div className="input-wrapper select-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-graduation-cap"></i>
                </span>

                <select
                  id="year"
                  name="year"
                  value={year}
                  onChange={(event) =>
                    setYear(
                      event.target.value
                    )
                  }
                >
                  <option value="" disabled>
                    Select your year
                  </option>

                  {years.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {errors.year && (
                <small className="form-error">
                  {errors.year}
                </small>
              )}
            </div>

            {/* Specialization */}
            <div className="form-group">
              <label htmlFor="specialization">
                Specialization
              </label>

              <div className="input-wrapper select-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-stethoscope"></i>
                </span>

                <select
                  id="specialization"
                  name="specialization"
                  value={specialization}
                  onChange={(event) =>
                    setSpecialization(
                      event.target.value
                    )
                  }
                  disabled={!faculty}
                >
                  <option value="" disabled>
                    {faculty
                      ? "Select specialization"
                      : "Select faculty first"}
                  </option>

                  {currentSpecializations.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {specialization === "Other" && (
                <div className="other-field">
                  <input
                    type="text"
                    placeholder="Enter your specialization"
                    value={otherSpecialization}
                    onChange={(event) =>
                      setOtherSpecialization(
                        event.target.value
                      )
                    }
                  />
                </div>
              )}

              {errors.specialization && (
                <small className="form-error">
                  {errors.specialization}
                </small>
              )}

              {errors.otherSpecialization && (
                <small className="form-error">
                  {errors.otherSpecialization}
                </small>
              )}
            </div>

            {/* Terms */}
            <label className="terms-check">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) =>
                  setTermsAccepted(
                    event.target.checked
                  )
                }
              />

              <span>
                I agree to the{" "}
                <a href="/terms">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy">
                  Privacy Policy
                </a>
              </span>
            </label>

            {errors.terms && (
              <small className="form-error terms-error">
                {errors.terms}
              </small>
            )}

            {errors.general && (
              <div className="form-error" role="alert">
                {errors.general}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Creating account...
                  <span className="auth-spinner"></span>
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          {/* Login */}
          <div className="auth-switch">
            Already have an account?
            <a href="/login">
              Log in
            </a>
          </div>

        </div>

        {/* Creator */}
        <div className="auth-creator">
          <span>
            Created with curiosity by
          </span>

          <a
            href="https://mariam-nabil.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mariam Nabil
          </a>
        </div>

        <p className="auth-footer">
          Learn. Recall. Practice. Master.
        </p>

      </div>
    </div>
  );
};

export default Register;