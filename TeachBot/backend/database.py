import sqlite3

DB_NAME = "database.db"


def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # =========================================================
    # USERS
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('student','teacher','parent')),
        college TEXT,
        branch TEXT,
        year TEXT,
        semester TEXT,
        department TEXT,
        child_name TEXT,
        child_email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # =========================================================
    # RESUME GENERATION MODEL
    # Stores FULL structured JSON resume
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        resume_title TEXT,
        target_role TEXT,
        resume_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # =========================================================
    # QUIZ MODEL
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject TEXT,
        quiz_json TEXT,
        student_answers TEXT,
        question_wise TEXT,
        total_score REAL,
        percentage REAL,
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # =========================================================
    # ASSIGNMENT EVALUATION MODEL
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assignment_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject TEXT,
        assignment_1 TEXT,
        assignment_2 TEXT,
        similarity_percent REAL,
        plagiarism_risk TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # =========================================================
    # ATS ANALYSIS MODEL
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ats_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        resume_id INTEGER,
        preferred_role TEXT,
        ats_score REAL,
        strengths TEXT,
        weaknesses TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
    )
    """)

    # =========================================================
    # SKILL GAP MODEL
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skill_gap_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        resume_id INTEGER,
        preferred_role TEXT,
        skills_input TEXT,
        missing_skills TEXT,
        recommended_skills TEXT,
        learning_suggestions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
    )
    """)

    # =========================================================
    # GENERAL CAREER ANALYSIS MODEL (/analyze route)
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        career_goal TEXT,
        skills TEXT,
        education_level TEXT,
        experience_years TEXT,
        current_job_title TEXT,
        interests TEXT,
        certifications TEXT,
        analysis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # =========================================================
    # IKIGAI MODEL
    # =========================================================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ikigai_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        love_inputs TEXT,
        good_at_inputs TEXT,
        world_needs_inputs TEXT,
        paid_for_inputs TEXT,
        passion_summary TEXT,
        profession_summary TEXT,
        vocation_summary TEXT,
        mission_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()
