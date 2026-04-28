from django.conf import settings
from django.db import models


class ActiveOrderedModel(models.Model):
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
        ordering = ["display_order", "id"]


class InstitutionProfile(models.Model):
    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=255)
    mission = models.TextField()
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    timings = models.CharField(max_length=120)
    address = models.CharField(max_length=255)
    logo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.name


class ProgramLevel(ActiveOrderedModel):
    name = models.CharField(max_length=80)
    slug = models.SlugField(unique=True)
    age_group = models.CharField(max_length=80)
    description = models.TextField()
    subjects = models.JSONField(default=list, blank=True)
    learning_outcomes = models.JSONField(default=list, blank=True)
    daily_minutes = models.CharField(max_length=40, default="")
    sheet_levels = models.CharField(max_length=80, default="")

    def __str__(self) -> str:
        return self.name


class LearningModule(ActiveOrderedModel):
    step = models.CharField(max_length=10)
    title = models.CharField(max_length=120)
    text = models.TextField()

    def __str__(self) -> str:
        return f"{self.step} {self.title}"


class Worksheet(ActiveOrderedModel):
    class Difficulty(models.TextChoices):
        BEGINNER = "Beginner", "Beginner"
        INTERMEDIATE = "Intermediate", "Intermediate"
        ADVANCED = "Advanced", "Advanced"

    title = models.CharField(max_length=200)
    level = models.ForeignKey(ProgramLevel, on_delete=models.CASCADE, related_name="worksheets")
    subject = models.CharField(max_length=80)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices)
    pages = models.PositiveIntegerField(default=1)
    preview_url = models.URLField(blank=True)
    file_url = models.URLField(blank=True)
    is_public = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title


class TeacherProfile(ActiveOrderedModel):
    full_name = models.CharField(max_length=120)
    photo_url = models.URLField(blank=True)
    subjects = models.JSONField(default=list, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    qualification = models.CharField(max_length=120, blank=True)
    bio = models.TextField()
    awards = models.JSONField(default=list, blank=True)

    def __str__(self) -> str:
        return self.full_name


class Testimonial(ActiveOrderedModel):
    quote = models.TextField()
    parent = models.CharField(max_length=120)
    learner_class = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"{self.parent} ({self.learner_class})"


class FAQ(ActiveOrderedModel):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self) -> str:
        return self.question


class Announcement(ActiveOrderedModel):
    title = models.CharField(max_length=200)
    body = models.TextField()
    published_at = models.DateTimeField()

    class Meta(ActiveOrderedModel.Meta):
        ordering = ["-published_at", "display_order", "id"]

    def __str__(self) -> str:
        return self.title


class PageSection(ActiveOrderedModel):
    class Page(models.TextChoices):
        HOME = "home", "Home"
        ABOUT = "about", "About"
        METHOD = "method", "Method"
        ADMISSIONS = "admissions", "Admissions"
        PARENT_CORNER = "parent_corner", "Parent Corner"
        PRIVACY = "privacy", "Privacy"
        TERMS = "terms", "Terms"

    page = models.CharField(max_length=40, choices=Page.choices)
    section_key = models.SlugField(max_length=80)
    eyebrow = models.CharField(max_length=120, blank=True)
    heading = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    note = models.TextField(blank=True)

    class Meta(ActiveOrderedModel.Meta):
        ordering = ["page", "display_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["page", "section_key"],
                name="unique_page_section_key",
            )
        ]

    def __str__(self) -> str:
        return f"{self.get_page_display()} / {self.section_key}"


class PageSectionItem(ActiveOrderedModel):
    section = models.ForeignKey(PageSection, on_delete=models.CASCADE, related_name="items")
    label = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField(blank=True)

    class Meta(ActiveOrderedModel.Meta):
        ordering = ["section", "display_order", "id"]

    def __str__(self) -> str:
        item_name = self.title or self.label or f"Item {self.display_order}"
        return f"{self.section} / {item_name}"


class InquiryLead(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        ENROLLED = "enrolled", "Enrolled"
        CLOSED = "closed", "Closed"

    student_name = models.CharField(max_length=120)
    guardian_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    target_class = models.CharField(max_length=80)
    message = models.TextField(blank=True)
    preferred_contact_time = models.CharField(max_length=80, blank=True)
    branch = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.student_name} - {self.target_class}"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    student_code = models.CharField(max_length=32, unique=True)
    full_name = models.CharField(max_length=120)
    class_level = models.CharField(max_length=80, blank=True)
    section = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    guardian_name = models.CharField(max_length=120, blank=True)
    guardian_phone = models.CharField(max_length=30, blank=True)
    guardian_email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    interests = models.JSONField(default=list, blank=True)
    goals = models.TextField(blank=True)
    joined_on = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["student_code", "id"]

    def __str__(self) -> str:
        return f"{self.student_code} - {self.full_name}"
