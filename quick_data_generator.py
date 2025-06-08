#!/usr/bin/env python3

import os
import psycopg2
import bcrypt
import uuid
from faker import Faker
from dotenv import load_dotenv
import random

load_dotenv()
fake = Faker()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PGHOST'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD'),
        port=os.getenv('PGPORT')
    )

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Predefined data
SKILLS = [
    "JavaScript", "Python", "React", "Node.js", "TypeScript", "Vue.js", "Angular",
    "AWS", "Docker", "PostgreSQL", "MongoDB", "GraphQL", "Machine Learning",
    "Product Management", "UI/UX Design", "DevOps", "Project Management"
]

INDUSTRIES = ["Technology", "Healthcare", "Finance", "E-commerce", "Education", "SaaS", "Fintech"]
LOCATIONS = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Remote"]
JOB_TYPES = ["full-time", "part-time", "contract", "co-founder"]

def main():
    print("Generating fake data...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Clear existing fake data
        cursor.execute("DELETE FROM applications WHERE user_id IN (SELECT id FROM users WHERE auth_provider = 'email')")
        cursor.execute("DELETE FROM opportunities WHERE organization_id IN (SELECT id FROM organizations WHERE user_id IN (SELECT id FROM users WHERE auth_provider = 'email'))")
        cursor.execute("DELETE FROM organizations WHERE user_id IN (SELECT id FROM users WHERE auth_provider = 'email')")
        cursor.execute("DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE auth_provider = 'email')")
        cursor.execute("DELETE FROM users WHERE auth_provider = 'email'")
        
        password_hash = hash_password("password123")
        
        # Create 15 professionals
        professionals = []
        for i in range(15):
            user_id = str(uuid.uuid4())
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            
            cursor.execute("""
                INSERT INTO users (id, email, first_name, last_name, password_hash, auth_provider, user_type)
                VALUES (%s, %s, %s, %s, %s, 'email', 'talent')
            """, (user_id, email, first_name, last_name, password_hash))
            
            # Create profile
            skills = random.sample(SKILLS, random.randint(3, 5))
            cursor.execute("""
                INSERT INTO profiles (user_id, title, bio, skills, location, salary_expectation, is_public)
                VALUES (%s, %s, %s, %s, %s, %s, true)
            """, (user_id, fake.job(), fake.text(max_nb_chars=200), skills, 
                  random.choice(LOCATIONS), f"${random.randint(60, 150)}k"))
            
            professionals.append({'user_id': user_id, 'email': email, 'name': f"{first_name} {last_name}"})
            print(f"Created professional: {first_name} {last_name}")
        
        # Create 7 organizations
        organizations = []
        for i in range(7):
            user_id = str(uuid.uuid4())
            company_name = fake.company()
            email = f"hiring@company{i+1}.com"
            
            cursor.execute("""
                INSERT INTO users (id, email, first_name, last_name, password_hash, auth_provider, user_type)
                VALUES (%s, %s, %s, %s, %s, 'email', 'organization')
            """, (user_id, email, company_name, "Team", password_hash))
            
            cursor.execute("""
                INSERT INTO organizations (user_id, company_name, description, industry, location)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, company_name, fake.text(max_nb_chars=300), 
                  random.choice(INDUSTRIES), random.choice(LOCATIONS[:4])))
            
            org_id = cursor.fetchone()[0]
            organizations.append({'org_id': org_id, 'company_name': company_name, 'email': email})
            print(f"Created organization: {company_name}")
        
        # Create 20 opportunities
        job_titles = [
            "Senior Full Stack Developer", "Product Manager", "UX Designer", "Data Scientist",
            "DevOps Engineer", "Frontend Developer", "Backend Developer", "Engineering Manager",
            "Mobile Developer", "Marketing Manager", "Sales Director", "Business Analyst"
        ]
        
        for i in range(20):
            org = random.choice(organizations)
            title = random.choice(job_titles)
            skills = random.sample(SKILLS, random.randint(3, 5))
            job_type = random.choice(JOB_TYPES)
            salary_min = random.randint(60, 120) * 1000
            salary_max = salary_min + random.randint(20, 50) * 1000
            
            cursor.execute("""
                INSERT INTO opportunities (organization_id, title, description, skills, type,
                                         location, salary_min, salary_max, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'active')
            """, (org['org_id'], title, fake.text(max_nb_chars=400), skills, job_type,
                  random.choice(LOCATIONS), salary_min, salary_max))
            
            print(f"Created opportunity: {title} at {org['company_name']}")
        
        conn.commit()
        
        print(f"""
Data generation complete!

Summary:
- 15 professionals created
- 7 organizations created  
- 20 opportunities created

Login credentials:
- Password for all users: password123
- Example professional: {professionals[0]['email']}
- Example organization: {organizations[0]['email']}
        """)
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()