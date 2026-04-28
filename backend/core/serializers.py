import re

from django.contrib.auth import authenticate
from rest_framework import serializers

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


class InstitutionProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionProfile
        fields = [
            "name",
            "tagline",
            "mission",
            "phone",
            "email",
            "timings",
            "address",
            "logo_url",
        ]


class ProgramLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramLevel
        fields = [
            "id",
            "name",
            "slug",
            "age_group",
            "description",
            "subjects",
            "learning_outcomes",
            "daily_minutes",
            "sheet_levels",
            "display_order",
        ]


class LearningModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningModule
        fields = ["step", "title", "text", "display_order"]


class WorksheetSerializer(serializers.ModelSerializer):
    level_slug = serializers.CharField(source="level.slug", read_only=True)

    class Meta:
        model = Worksheet
        fields = [
            "id",
            "title",
            "level_slug",
            "subject",
            "difficulty",
            "pages",
            "preview_url",
            "file_url",
            "is_public",
            "updated_at",
        ]


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "full_name",
            "photo_url",
            "subjects",
            "experience_years",
            "qualification",
            "bio",
            "awards",
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "quote", "parent", "learner_class"]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer"]


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["id", "title", "body", "published_at"]


class PageSectionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSectionItem
        fields = ["id", "label", "title", "body", "display_order"]


class PageSectionSerializer(serializers.ModelSerializer):
    items = PageSectionItemSerializer(many=True, read_only=True)

    class Meta:
        model = PageSection
        fields = [
            "id",
            "page",
            "section_key",
            "eyebrow",
            "heading",
            "body",
            "note",
            "items",
            "display_order",
        ]


class InquiryLeadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InquiryLead
        fields = [
            "student_name",
            "guardian_name",
            "phone",
            "email",
            "target_class",
            "message",
            "preferred_contact_time",
            "branch",
        ]

    def validate_phone(self, value: str) -> str:
        pattern = re.compile(r"^[0-9+\-\s]{10,15}$")
        if not pattern.fullmatch(value.strip()):
            raise serializers.ValidationError("Invalid phone number")
        return value.strip()


class InquiryLeadResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = InquiryLead
        fields = ["id", "status", "created_at"]


class StudentLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get("username"), password=attrs.get("password"))
        if user is None:
            raise serializers.ValidationError("Invalid username or password")
        attrs["user"] = user
        return attrs


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "username",
            "email",
            "student_code",
            "full_name",
            "class_level",
            "section",
            "date_of_birth",
            "guardian_name",
            "guardian_phone",
            "guardian_email",
            "address",
            "interests",
            "goals",
            "joined_on",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "username",
            "email",
            "student_code",
            "created_at",
            "updated_at",
        ]

    def validate_guardian_phone(self, value: str) -> str:
        if not value:
            return ""
        pattern = re.compile(r"^[0-9+\-\s]{10,15}$")
        if not pattern.fullmatch(value.strip()):
            raise serializers.ValidationError("Invalid phone number")
        return value.strip()

    def validate_interests(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Interests must be a list of text values")
        cleaned = []
        for entry in value:
            if not isinstance(entry, str):
                raise serializers.ValidationError("Interests must be a list of text values")
            text = entry.strip()
            if text:
                cleaned.append(text)
        return cleaned
