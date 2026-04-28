from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import (
    FAQ,
    Announcement,
    InstitutionProfile,
    LearningModule,
    PageSection,
    PageSectionItem,
    ProgramLevel,
    StudentProfile,
    TeacherProfile,
    Testimonial,
    Worksheet,
)


class Command(BaseCommand):
    help = "Seed demo data for the after-school institution"

    def handle(self, *args, **options):
        user_model = get_user_model()

        def sync_section(page: str, section_key: str, defaults: dict, items: list[dict] | None = None):
            section, _ = PageSection.objects.update_or_create(
                page=page,
                section_key=section_key,
                defaults=defaults,
            )

            if items is None:
                return section

            keep_ids: list[int] = []
            for index, row in enumerate(items, start=1):
                item, _ = PageSectionItem.objects.update_or_create(
                    section=section,
                    display_order=row.get("display_order", index),
                    defaults={
                        "label": row.get("label", ""),
                        "title": row.get("title", ""),
                        "body": row.get("body", ""),
                        "is_active": row.get("is_active", True),
                    },
                )
                keep_ids.append(item.id)

            PageSectionItem.objects.filter(section=section).exclude(id__in=keep_ids).delete()
            return section

        InstitutionProfile.objects.update_or_create(
            name="Kram Vikas After School Institute",
            defaults={
                "tagline": "Structured self-paced learning from Nursery to Class 5",
                "mission": "Build confident, independent learners through calm daily worksheet practice, teacher mentoring, and measurable mastery tracking.",
                "phone": "+91-98765-43210",
                "email": "hello@kramvikas.edu",
                "timings": "Monday to Saturday, 3:00 PM to 8:00 PM",
                "address": "Sunrise Enclave, Sector 8, Near Central Park",
                "logo_url": "/brand/logo.png",
            },
        )

        program_rows = [
            {
                "name": "Nursery",
                "slug": "nursery",
                "age_group": "3-4 years",
                "description": "Foundational readiness through pattern play, phonics sounds, and number sense.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Pencil control", "Sound recognition", "Object counting"],
                "daily_minutes": "25 minutes",
                "sheet_levels": "Starter A1-A8",
                "display_order": 1,
            },
            {
                "name": "LKG",
                "slug": "lkg",
                "age_group": "4-5 years",
                "description": "Letter formation, early vocabulary, sequencing, and pre-math habits.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Alphabet writing", "Shape sorting", "Sequencing logic"],
                "daily_minutes": "30 minutes",
                "sheet_levels": "Foundation B1-B10",
                "display_order": 2,
            },
            {
                "name": "UKG",
                "slug": "ukg",
                "age_group": "5-6 years",
                "description": "Reading readiness, number operations, and listening comprehension.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["CVC words", "Single-digit sums", "Story response"],
                "daily_minutes": "35 minutes",
                "sheet_levels": "Foundation C1-C12",
                "display_order": 3,
            },
            {
                "name": "Class 1",
                "slug": "class-1",
                "age_group": "6-7 years",
                "description": "Early fluency in English and Mathematics with habit-based self-study.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Sentence writing", "Add-subtract fluency", "Independent sheet completion"],
                "daily_minutes": "40 minutes",
                "sheet_levels": "Core M1-M15",
                "display_order": 4,
            },
            {
                "name": "Class 2",
                "slug": "class-2",
                "age_group": "7-8 years",
                "description": "Concept depth with speed-accuracy balance across subjects.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Paragraph reading", "Regrouping math", "Word problems"],
                "daily_minutes": "45 minutes",
                "sheet_levels": "Core N1-N15",
                "display_order": 5,
            },
            {
                "name": "Class 3",
                "slug": "class-3",
                "age_group": "8-9 years",
                "description": "Analytical thinking using stepwise worksheets and review loops.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Comprehension answers", "Multiplication mastery", "Grammar fundamentals"],
                "daily_minutes": "50 minutes",
                "sheet_levels": "Progress P1-P16",
                "display_order": 6,
            },
            {
                "name": "Class 4",
                "slug": "class-4",
                "age_group": "9-10 years",
                "description": "Application-heavy worksheet sets with mentor corrections.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Long-form writing", "Fractions", "Structured revision habits"],
                "daily_minutes": "55 minutes",
                "sheet_levels": "Progress Q1-Q16",
                "display_order": 7,
            },
            {
                "name": "Class 5",
                "slug": "class-5",
                "age_group": "10-11 years",
                "description": "Upper-primary readiness with speed drills and level advancement tests.",
                "subjects": ["English", "Math"],
                "learning_outcomes": ["Inference reading", "Decimal operations", "Independent planning"],
                "daily_minutes": "60 minutes",
                "sheet_levels": "Advance R1-R18",
                "display_order": 8,
            },
        ]

        levels_by_slug = {}
        for row in program_rows:
            level, _ = ProgramLevel.objects.update_or_create(slug=row["slug"], defaults=row)
            levels_by_slug[row["slug"]] = level

        modules = [
            {
                "step": "01",
                "title": "Diagnostic Assessment",
                "text": "Every child starts with a baseline check so sheets begin at the right level, not just class grade.",
                "display_order": 1,
            },
            {
                "step": "02",
                "title": "Level Assignment",
                "text": "Teachers map the child to worksheet bands in English and Math with a weekly target plan.",
                "display_order": 2,
            },
            {
                "step": "03",
                "title": "Daily Sheet Practice",
                "text": "Short, focused work sessions build consistency. Difficulty rises only after mastery is visible.",
                "display_order": 3,
            },
            {
                "step": "04",
                "title": "Review and Feedback",
                "text": "Mentors mark sheets daily and assign correction loops for error patterns.",
                "display_order": 4,
            },
            {
                "step": "05",
                "title": "Advancement Test",
                "text": "When accuracy and timing targets are met, learners progress to the next sheet level.",
                "display_order": 5,
            },
        ]

        for row in modules:
            LearningModule.objects.update_or_create(step=row["step"], defaults=row)

        teachers = [
            {
                "full_name": "Aditi Verma",
                "bio": "Early reading fluency and writing confidence specialist.",
                "photo_url": "/images/teachers/aditi-verma.svg",
                "subjects": ["English", "Reading"],
                "experience_years": 9,
                "qualification": "M.A. English, B.Ed",
                "awards": ["Designed 200+ graded literacy sheets"],
                "display_order": 1,
            },
            {
                "full_name": "Rohan Mehta",
                "bio": "Numeracy specialist focused on arithmetic speed and mental math habits.",
                "photo_url": "/images/teachers/rohan-mehta.svg",
                "subjects": ["Math"],
                "experience_years": 11,
                "qualification": "M.Sc. Mathematics",
                "awards": ["Olympiad coaching mentor"],
                "display_order": 2,
            },
            {
                "full_name": "Neha Sinha",
                "bio": "Foundation mentor for Nursery to UKG readiness programs.",
                "photo_url": "/images/teachers/neha-sinha.svg",
                "subjects": ["Foundation", "English"],
                "experience_years": 8,
                "qualification": "M.Ed",
                "awards": ["Play-based worksheet integration"],
                "display_order": 3,
            },
            {
                "full_name": "Karan Bhardwaj",
                "bio": "Upper-primary coach for class 4-5 concept transfer and exam readiness.",
                "photo_url": "/images/teachers/karan-bhardwaj.svg",
                "subjects": ["Math", "English"],
                "experience_years": 10,
                "qualification": "B.Tech, B.Ed",
                "awards": ["Assessment framework designer"],
                "display_order": 4,
            },
        ]

        for row in teachers:
            TeacherProfile.objects.update_or_create(full_name=row["full_name"], defaults=row)

        worksheet_rows = [
            {
                "title": "Phonics Sound Match",
                "level": levels_by_slug["lkg"],
                "subject": "English",
                "difficulty": "Beginner",
                "pages": 3,
                "display_order": 1,
            },
            {
                "title": "Number Bond Builder",
                "level": levels_by_slug["ukg"],
                "subject": "Math",
                "difficulty": "Beginner",
                "pages": 4,
                "display_order": 2,
            },
            {
                "title": "Sentence Stretch Practice",
                "level": levels_by_slug["class-1"],
                "subject": "English",
                "difficulty": "Intermediate",
                "pages": 5,
                "display_order": 3,
            },
            {
                "title": "Carry and Borrow Drill",
                "level": levels_by_slug["class-2"],
                "subject": "Math",
                "difficulty": "Intermediate",
                "pages": 6,
                "display_order": 4,
            },
            {
                "title": "Paragraph Meaning Mapper",
                "level": levels_by_slug["class-3"],
                "subject": "English",
                "difficulty": "Advanced",
                "pages": 6,
                "display_order": 5,
            },
            {
                "title": "Multiplication Sprint Sheet",
                "level": levels_by_slug["class-3"],
                "subject": "Math",
                "difficulty": "Advanced",
                "pages": 5,
                "display_order": 6,
            },
            {
                "title": "Fractions Visual Set",
                "level": levels_by_slug["class-4"],
                "subject": "Math",
                "difficulty": "Intermediate",
                "pages": 7,
                "display_order": 7,
            },
            {
                "title": "Inference Builder Pack",
                "level": levels_by_slug["class-5"],
                "subject": "English",
                "difficulty": "Advanced",
                "pages": 8,
                "display_order": 8,
            },
        ]

        for row in worksheet_rows:
            Worksheet.objects.update_or_create(
                title=row["title"],
                defaults={
                    **row,
                    "preview_url": {
                        "Phonics Sound Match": "/worksheet-previews/foundation-literacy.html",
                        "Number Bond Builder": "/worksheet-previews/foundation-numeracy.html",
                        "Sentence Stretch Practice": "/worksheet-previews/primary-english.html",
                        "Carry and Borrow Drill": "/worksheet-previews/primary-math.html",
                        "Paragraph Meaning Mapper": "/worksheet-previews/primary-english.html",
                        "Multiplication Sprint Sheet": "/worksheet-previews/primary-math.html",
                        "Fractions Visual Set": "/worksheet-previews/primary-math.html",
                        "Inference Builder Pack": "/worksheet-previews/primary-english.html",
                    }[row["title"]],
                    "file_url": {
                        "Phonics Sound Match": "/worksheet-previews/foundation-literacy.html",
                        "Number Bond Builder": "/worksheet-previews/foundation-numeracy.html",
                        "Sentence Stretch Practice": "/worksheet-previews/primary-english.html",
                        "Carry and Borrow Drill": "/worksheet-previews/primary-math.html",
                        "Paragraph Meaning Mapper": "/worksheet-previews/primary-english.html",
                        "Multiplication Sprint Sheet": "/worksheet-previews/primary-math.html",
                        "Fractions Visual Set": "/worksheet-previews/primary-math.html",
                        "Inference Builder Pack": "/worksheet-previews/primary-english.html",
                    }[row["title"]],
                    "is_public": True,
                },
            )

        testimonial_rows = [
            {
                "quote": "My daughter moved from avoiding reading to completing daily sheets independently in eight weeks.",
                "parent": "Pooja Sharma",
                "learner_class": "Class 2",
                "display_order": 1,
            },
            {
                "quote": "The math progression is very structured. We can see exact improvement week by week.",
                "parent": "Arjun Nair",
                "learner_class": "Class 4",
                "display_order": 2,
            },
            {
                "quote": "Teacher feedback is specific, not generic. That made all the difference for our son.",
                "parent": "Simran Kaur",
                "learner_class": "Class 1",
                "display_order": 3,
            },
        ]

        for row in testimonial_rows:
            Testimonial.objects.update_or_create(parent=row["parent"], defaults=row)

        faq_rows = [
            {
                "question": "How is this different from tuition?",
                "answer": "Tuition is usually chapter-driven. Our model is mastery-driven with individual sheet levels and daily correction loops.",
                "display_order": 1,
            },
            {
                "question": "How much homework is given?",
                "answer": "Small daily worksheet packets are assigned, typically 20-30 minutes, adjusted by level and age.",
                "display_order": 2,
            },
            {
                "question": "Can children join mid-session?",
                "answer": "Yes. Learners start with a diagnostic so they can join at the right worksheet level any month.",
                "display_order": 3,
            },
            {
                "question": "Do you provide progress reports?",
                "answer": "Parents get periodic updates on speed, accuracy, consistency, and level advancement milestones.",
                "display_order": 4,
            },
        ]

        for row in faq_rows:
            FAQ.objects.update_or_create(question=row["question"], defaults=row)

        Announcement.objects.update_or_create(
            title="Admissions Open for 2026 Session",
            defaults={
                "body": "Book your diagnostic assessment to receive a class-wise skill map, worksheet recommendation, and counseling call.",
                "published_at": timezone.now(),
                "display_order": 1,
                "is_active": True,
            },
        )

        sync_section(
            page=PageSection.Page.HOME,
            section_key="hero",
            defaults={
                "eyebrow": "Nursery to Class 5 | Kumon-style self-paced model",
                "heading": "Independent learners are built one sheet at a time.",
                "body": "",
                "note": "",
                "display_order": 1,
                "is_active": True,
            },
        )
        sync_section(
            page=PageSection.Page.HOME,
            section_key="metrics",
            defaults={
                "heading": "Key highlights",
                "display_order": 2,
                "is_active": True,
            },
            items=[
                {
                    "title": "Daily",
                    "body": "guided worksheet practice with mentor feedback",
                    "display_order": 1,
                },
                {
                    "title": "Weekly",
                    "body": "progress updates that parents can actually act on",
                    "display_order": 2,
                },
                {
                    "title": "Personalized",
                    "body": "level mapping based on mastery, not age alone",
                    "display_order": 3,
                },
            ],
        )
        sync_section(
            page=PageSection.Page.HOME,
            section_key="snapshot",
            defaults={
                "eyebrow": "Progress Snapshot",
                "heading": "Calm structure. Clear outcomes. Visible growth.",
                "display_order": 3,
                "is_active": True,
            },
            items=[
                {
                    "title": "Diagnostic start",
                    "body": "We place each learner at a level that builds confidence first.",
                    "display_order": 1,
                },
                {
                    "title": "Daily correction loop",
                    "body": "Mentors review work quickly so misunderstandings do not pile up.",
                    "display_order": 2,
                },
                {
                    "title": "Measured advancement",
                    "body": "Children move forward only when accuracy, speed, and stamina are stable.",
                    "display_order": 3,
                },
            ],
        )
        sync_section(
            page=PageSection.Page.ABOUT,
            section_key="intro",
            defaults={
                "eyebrow": "About the Institution",
                "body": "Our after-school center combines structured worksheets with personal teacher guidance. Learners build consistency through short daily goals and rise through difficulty levels only when mastery is demonstrated.",
                "note": "We serve Nursery to Class 5 with a calm learning environment, low student-teacher ratio, and measurable academic checkpoints for families.",
                "display_order": 1,
                "is_active": True,
            },
        )
        sync_section(
            page=PageSection.Page.ABOUT,
            section_key="values",
            defaults={
                "heading": "Why families choose us",
                "display_order": 2,
                "is_active": True,
            },
            items=[
                {
                    "title": "Our Vision",
                    "body": "Create self-driven learners who can handle school curriculum confidently and independently.",
                    "display_order": 1,
                },
                {
                    "title": "Our Culture",
                    "body": "Consistency over pressure. Precision over speed. Mentoring over rote repetition.",
                    "display_order": 2,
                },
                {
                    "title": "Our Promise",
                    "body": "Clear levels, transparent reviews, and professional teachers for every class band.",
                    "display_order": 3,
                },
            ],
        )
        sync_section(
            page=PageSection.Page.METHOD,
            section_key="intro",
            defaults={
                "eyebrow": "Kumon-Style Method",
                "heading": "Self-paced progression with measurable mastery",
                "body": "The model is built around frequent worksheet practice, immediate correction, and level advancement tests. Children move by performance, not by calendar month.",
                "display_order": 1,
                "is_active": True,
            },
        )
        sync_section(
            page=PageSection.Page.METHOD,
            section_key="benefits",
            defaults={
                "heading": "Method benefits",
                "display_order": 2,
                "is_active": True,
            },
            items=[
                {
                    "title": "Sheet Volume",
                    "body": "Students receive manageable daily packets designed for confidence and repetition quality.",
                    "display_order": 1,
                },
                {
                    "title": "Teacher Feedback",
                    "body": "Mentors review errors immediately so misconceptions are corrected before they become habits.",
                    "display_order": 2,
                },
                {
                    "title": "Parent Visibility",
                    "body": "Parents see progression reports with speed, accuracy, consistency, and next-level readiness.",
                    "display_order": 3,
                },
            ],
        )
        sync_section(
            page=PageSection.Page.ADMISSIONS,
            section_key="intro",
            defaults={
                "eyebrow": "Admissions",
                "heading": "Book a diagnostic assessment",
                "body": "Submit your details and our team will call you back for counseling, level check, and a personalized worksheet plan.",
                "note": "Families usually receive a callback within one working day.",
                "display_order": 1,
                "is_active": True,
            },
        )
        sync_section(
            page=PageSection.Page.PARENT_CORNER,
            section_key="intro",
            defaults={
                "eyebrow": "Parent Corner",
                "heading": "Clear communication, weekly structure, transparent progress",
                "body": "Review the weekly rhythm and stay aligned on how learners build consistency at the center.",
                "display_order": 1,
                "is_active": True,
            },
        )
        sync_section(
            page=PageSection.Page.PARENT_CORNER,
            section_key="weekly_plan",
            defaults={
                "heading": "Weekly learning rhythm",
                "display_order": 2,
                "is_active": True,
            },
            items=[
                {"label": "Monday", "body": "New concept sheets + correction loop", "display_order": 1},
                {"label": "Tuesday", "body": "Reinforcement sheets + timing drill", "display_order": 2},
                {"label": "Wednesday", "body": "Mixed practice + mentor feedback", "display_order": 3},
                {"label": "Thursday", "body": "Skill gap targeting sheets", "display_order": 4},
                {"label": "Friday", "body": "Mastery check + advance prep", "display_order": 5},
                {"label": "Saturday", "body": "Parent review and next-week target", "display_order": 6},
            ],
        )
        sync_section(
            page=PageSection.Page.PARENT_CORNER,
            section_key="faq_heading",
            defaults={
                "heading": "Frequently asked questions",
                "display_order": 3,
                "is_active": True,
            },
        )
        sync_section(
            page=PageSection.Page.PRIVACY,
            section_key="main",
            defaults={
                "heading": "Privacy Policy",
                "body": "We only use submitted details for admissions and academic counseling.",
                "display_order": 1,
                "is_active": True,
            },
            items=[
                {
                    "body": "By using this website, you agree to share admission inquiry details voluntarily. We do not sell personal data and only use submitted information for communication about classes and assessments.",
                    "display_order": 1,
                }
            ],
        )
        sync_section(
            page=PageSection.Page.TERMS,
            section_key="main",
            defaults={
                "heading": "Terms of Use",
                "body": "This website provides academic information and sample materials for parents.",
                "display_order": 1,
                "is_active": True,
            },
            items=[
                {
                    "body": "By using this website, you agree to share admission inquiry details voluntarily. We do not sell personal data and only use submitted information for communication about classes and assessments.",
                    "display_order": 1,
                }
            ],
        )

        demo_student, _ = user_model.objects.get_or_create(
            username="student_demo",
            defaults={
                "first_name": "Aarav",
                "last_name": "Sharma",
                "email": "aarav.student@example.com",
            },
        )
        demo_student.set_password("Student@123")
        demo_student.save(update_fields=["password"])

        StudentProfile.objects.update_or_create(
            user=demo_student,
            defaults={
                "student_code": "KV-STU-001",
                "full_name": "Aarav Sharma",
                "class_level": "Class 3",
                "section": "A",
                "guardian_name": "Riya Sharma",
                "guardian_phone": "+919876543210",
                "guardian_email": "riya.parent@example.com",
                "address": "Sunrise Enclave, Sector 8",
                "interests": ["Math puzzles", "Reading stories", "Science activities"],
                "goals": "Improve reading speed and word-problem accuracy.",
                "joined_on": timezone.now().date(),
            },
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        self.stdout.write(
            self.style.WARNING(
                "Demo student login created: username=student_demo, password=Student@123",
            ),
        )
