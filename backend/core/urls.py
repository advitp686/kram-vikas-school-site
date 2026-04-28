from django.urls import path

from .views import (
    AnnouncementListView,
    FAQListView,
    HealthView,
    InquiryCreateView,
    LearningModuleListView,
    PageSectionListView,
    ProgramLevelDetailView,
    ProgramLevelListView,
    SiteConfigView,
    StudentLoginView,
    StudentLogoutView,
    StudentProfileView,
    TeacherListView,
    TestimonialListView,
    WorksheetListView,
)

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("site-config", SiteConfigView.as_view(), name="site-config"),
    path("program-levels", ProgramLevelListView.as_view(), name="program-level-list"),
    path("program-levels/<slug:slug>", ProgramLevelDetailView.as_view(), name="program-level-detail"),
    path("learning-modules", LearningModuleListView.as_view(), name="learning-module-list"),
    path("worksheets", WorksheetListView.as_view(), name="worksheet-list"),
    path("teachers", TeacherListView.as_view(), name="teacher-list"),
    path("testimonials", TestimonialListView.as_view(), name="testimonial-list"),
    path("faqs", FAQListView.as_view(), name="faq-list"),
    path("announcements", AnnouncementListView.as_view(), name="announcement-list"),
    path("page-sections", PageSectionListView.as_view(), name="page-section-list"),
    path("inquiries", InquiryCreateView.as_view(), name="inquiry-create"),
    path("auth/login", StudentLoginView.as_view(), name="student-login"),
    path("auth/logout", StudentLogoutView.as_view(), name="student-logout"),
    path("students/profile", StudentProfileView.as_view(), name="student-profile"),
]
