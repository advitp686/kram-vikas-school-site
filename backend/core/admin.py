from django.contrib import admin

from .models import (
    Announcement,
    FAQ,
    InquiryLead,
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


@admin.register(InstitutionProfile)
class InstitutionProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "updated_at")
    search_fields = ("name", "email", "phone")


@admin.register(ProgramLevel)
class ProgramLevelAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "age_group", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


@admin.register(LearningModule)
class LearningModuleAdmin(admin.ModelAdmin):
    list_display = ("step", "title", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    search_fields = ("step", "title")


@admin.register(Worksheet)
class WorksheetAdmin(admin.ModelAdmin):
    list_display = ("title", "level", "subject", "difficulty", "is_public", "is_active")
    list_filter = ("difficulty", "subject", "is_public", "is_active")
    search_fields = ("title", "subject", "level__name")
    list_editable = ("is_public", "is_active")


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "experience_years", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    search_fields = ("full_name", "qualification")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("parent", "learner_class", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    search_fields = ("parent", "learner_class", "quote")


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    search_fields = ("question",)


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "published_at", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    search_fields = ("title", "body")


class PageSectionItemInline(admin.StackedInline):
    model = PageSectionItem
    extra = 0
    fields = ("label", "title", "body", "display_order", "is_active")


@admin.register(PageSection)
class PageSectionAdmin(admin.ModelAdmin):
    list_display = ("page", "section_key", "heading", "display_order", "is_active")
    list_editable = ("display_order", "is_active")
    list_filter = ("page", "is_active")
    search_fields = ("page", "section_key", "eyebrow", "heading", "body", "note")
    inlines = [PageSectionItemInline]


@admin.register(InquiryLead)
class InquiryLeadAdmin(admin.ModelAdmin):
    list_display = ("student_name", "target_class", "phone", "status", "created_at")
    list_filter = ("status", "target_class")
    list_editable = ("status",)
    search_fields = ("student_name", "guardian_name", "phone", "email")
    readonly_fields = ("created_at", "updated_at")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("student_code", "full_name", "class_level", "section", "updated_at")
    list_filter = ("class_level", "section")
    search_fields = ("student_code", "full_name", "user__username", "guardian_name")
    readonly_fields = ("created_at", "updated_at")
