#!/usr/bin/env python3

import os
import psycopg2
import bcrypt
import uuid
from faker import Faker
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv()

# Initialize Faker
fake = Faker()

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PGHOST'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD'),
        port=os.getenv('PGPORT')
    )

# Skills data
TECH_SKILLS = [
    "JavaScript", "Python", "React", "Node.js", "TypeScript", "Vue.js", "Angular",
    "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis", "GraphQL",
    "REST APIs", "Machine Learning", "Data Science", "AI", "DevOps", "Git",
    "HTML/CSS", "Java", "C++", "Go", "Rust", "Swift", "Kotlin", "Flutter",
    "React Native", "Next.js", "Express.js", "Django", "Flask", "Spring Boot",
    "Microservices", "Serverless", "Cloud Computing", "Cybersecurity", "Blockchain"
]

BUSINESS_SKILLS = [
    "Project Management", "Product Management", "Business Analysis", "Strategy",
    "Marketing", "Sales", "Customer Success", "Data Analysis", "Financial Modeling",
    "Operations", "Leadership", "Team Management", "Agile", "Scrum", "Lean Startup"
]

DESIGN_SKILLS = [
    "UI/UX Design", "Figma", "Adobe Creative Suite", "Sketch", "Prototyping",
    "User Research", "Wireframing", "Visual Design", "Interaction Design",
    "Design Systems", "Branding", "Illustration"
]

ALL_SKILLS = TECH_SKILLS + BUSINESS_SKILLS + DESIGN_SKILLS

# Industries
INDUSTRIES = [
    "Technology", "Healthcare", "Finance", "E-commerce", "Education", "Media",
    "Real Estate", "Transportation", "Food & Beverage", "Gaming", "SaaS",
    "Fintech", "Biotech", "Clean Energy", "AI/ML", "Blockchain", "Cybersecurity"
]

# Job types and locations
JOB_TYPES = ["full-time", "part-time", "contract", "co-founder"]
LOCATIONS = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA",
    "Los Angeles, CA", "Chicago, IL", "Denver, CO", "Miami, FL", "Remote",
    "London, UK", "Berlin, Germany", "Toronto, Canada", "Sydney, Australia"
]

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_professionals(cursor, count=15):
    """Create fake professional users with profiles"""
    print(f"Creating {count} professionals...")
    
    professionals = []
    for i in range(count):
        # Create user
        user_id = str(uuid.uuid4())
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = f"{first_name.lower()}.{last_name.lower()}@{fake.domain_name()}"
        password_hash = hash_password("password123")
        
        cursor.execute("""
            INSERT INTO users (id, email, first_name, last_name, password_hash, auth_provider, user_type)
            VALUES (%s, %s, %s, %s, %s, 'email', 'talent')
        """, (user_id, email, first_name, last_name, password_hash))
        
        # Create profile
        title = fake.job()
        bio = fake.text(max_nb_chars=300)
        skills = random.sample(ALL_SKILLS, random.randint(3, 7))
        experience = fake.text(max_nb_chars=500)
        location = random.choice(LOCATIONS)
        salary_expectation = f"${random.randint(60, 200)}k"
        available_for = random.sample(JOB_TYPES, random.randint(1, 3))
        
        cursor.execute("""
            INSERT INTO profiles (user_id, title, bio, skills, experience, location, 
                                salary_expectation, available_for, is_public)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, true)
        """, (user_id, title, bio, skills, experience, location, salary_expectation, available_for))
        
        professionals.append({
            'user_id': user_id,
            'email': email,
            'name': f"{first_name} {last_name}"
        })
        
        print(f"  Created professional: {first_name} {last_name} ({email})")
    
    return professionals

def create_organizations(cursor, count=7):
    """Create fake organization users with company profiles"""
    print(f"Creating {count} organizations...")
    
    organizations = []
    for i in range(count):
        # Create user
        user_id = str(uuid.uuid4())
        company_name = fake.company()
        email = f"hiring@{company_name.lower().replace(' ', '').replace(',', '').replace('.', '')}.com"
        password_hash = hash_password("password123")
        
        cursor.execute("""
            INSERT INTO users (id, email, first_name, last_name, password_hash, auth_provider, user_type)
            VALUES (%s, %s, %s, %s, %s, 'email', 'organization')
        """, (user_id, email, company_name, "Team", password_hash))
        
        # Create organization profile
        description = fake.text(max_nb_chars=400)
        industry = random.choice(INDUSTRIES)
        website = f"https://www.{company_name.lower().replace(' ', '').replace(',', '').replace('.', '')}.com"
        size = random.choice(["1-10", "11-50", "51-200", "201-500", "500+"])
        location = random.choice(LOCATIONS[:10])  # Exclude remote for companies
        founded_year = random.randint(2010, 2023)
        
        cursor.execute("""
            INSERT INTO organizations (user_id, company_name, description, website, 
                                     industry, size, location, founded_year)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, company_name, description, website, industry, size, location, founded_year))
        
        org_id = cursor.fetchone()[0]
        
        organizations.append({
            'org_id': org_id,
            'user_id': user_id,
            'company_name': company_name,
            'email': email,
            'industry': industry
        })
        
        print(f"  Created organization: {company_name} ({email})")
    
    return organizations

def create_opportunities(cursor, organizations, count=20):
    """Create fake job opportunities"""
    print(f"Creating {count} opportunities...")
    
    job_titles = [
        "Senior Full Stack Developer", "Product Manager", "UX/UI Designer",
        "Data Scientist", "DevOps Engineer", "Frontend Developer",
        "Backend Developer", "Machine Learning Engineer", "Product Designer",
        "Engineering Manager", "Technical Lead", "Software Architect",
        "Mobile Developer", "QA Engineer", "Business Analyst",
        "Marketing Manager", "Sales Director", "Customer Success Manager",
        "Operations Manager", "Head of Growth"
    ]
    
    opportunities = []
    for i in range(count):
        org = random.choice(organizations)
        title = random.choice(job_titles)
        description = fake.text(max_nb_chars=800)
        requirements = [fake.sentence() for _ in range(random.randint(3, 6))]
        skills = random.sample(ALL_SKILLS, random.randint(3, 5))
        job_type = random.choice(JOB_TYPES)
        location = random.choice(LOCATIONS)
        is_remote = location == "Remote" or random.choice([True, False])
        
        # Salary ranges based on job type
        if job_type == "co-founder":
            salary_min = 0
            salary_max = 50000
            equity_min = "1%"
            equity_max = "5%"
        elif job_type == "contract":
            salary_min = random.randint(50, 150) * 1000
            salary_max = salary_min + random.randint(20, 50) * 1000
            equity_min = None
            equity_max = None
        else:
            salary_min = random.randint(60, 120) * 1000
            salary_max = salary_min + random.randint(20, 80) * 1000
            equity_min = "0.1%" if random.choice([True, False]) else None
            equity_max = "2%" if equity_min else None
        
        cursor.execute("""
            INSERT INTO opportunities (organization_id, title, description, requirements,
                                     skills, type, location, is_remote, salary_min, salary_max,
                                     equity_min, equity_max, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'active')
            RETURNING id
        """, (org['org_id'], title, description, requirements, skills, job_type,
              location, is_remote, salary_min, salary_max, equity_min, equity_max))
        
        opp_id = cursor.fetchone()[0]
        
        opportunities.append({
            'opp_id': opp_id,
            'title': title,
            'company': org['company_name'],
            'type': job_type
        })
        
        salary_range = f"${salary_min//1000}k-${salary_max//1000}k" if salary_max > 0 else "Equity only"
        print(f"  Created opportunity: {title} at {org['company_name']} ({salary_range})")
    
    return opportunities

def create_sample_applications(cursor, professionals, opportunities, count=25):
    """Create some sample applications"""
    print(f"Creating {count} sample applications...")
    
    statuses = ["pending", "reviewing", "accepted", "rejected"]
    
    for i in range(count):
        professional = random.choice(professionals)
        opportunity = random.choice(opportunities)
        cover_letter = fake.text(max_nb_chars=500)
        status = random.choice(statuses)
        
        try:
            cursor.execute("""
                INSERT INTO applications (opportunity_id, user_id, cover_letter, status)
                VALUES (%s, %s, %s, %s)
            """, (opportunity['opp_id'], professional['user_id'], cover_letter, status))
            
            print(f"  Created application: {professional['name']} -> {opportunity['title']}")
        except psycopg2.IntegrityError:
            # Skip if duplicate application
            continue

def main():
    """Main function to generate all fake data"""
    print("🚀 Starting fake data generation...")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        cursor.execute("DELETE FROM applications")
        cursor.execute("DELETE FROM opportunities")
        cursor.execute("DELETE FROM organizations")
        cursor.execute("DELETE FROM profiles")
        cursor.execute("DELETE FROM users WHERE auth_provider = 'email'")
        conn.commit()
        
        # Generate data
        professionals = create_professionals(cursor, 15)
        organizations = create_organizations(cursor, 7)
        opportunities = create_opportunities(cursor, organizations, 20)
        create_sample_applications(cursor, professionals, opportunities, 25)
        
        # Commit all changes
        conn.commit()
        
        print(f"""
✅ Fake data generation complete!

📊 Summary:
- {len(professionals)} professionals created
- {len(organizations)} organizations created  
- {len(opportunities)} opportunities created
- 25 sample applications created

🔐 Login credentials:
- Password for all users: password123
- Example professional: {professionals[0]['email']}
- Example organization: {organizations[0]['email']}

🎯 Next steps:
1. Sign in with any of the generated email addresses
2. Password is 'password123' for all accounts
3. Test the talent marketplace functionality!
        """)
        
    except Exception as e:
        print(f"❌ Error generating fake data: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()