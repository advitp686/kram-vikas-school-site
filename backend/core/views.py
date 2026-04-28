from django.contrib.auth.models import AbstractBaseUser
from django.db import connection
from django.db.models import Prefetch, Q
from django.utils import timezone
from rest_framework import authentication, generics, permissions, status, throttling
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

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
from .serializers import (
    AnnouncementSerializer,
    FAQSerializer,
    InquiryLeadCreateSerializer,
    InquiryLeadResponseSerializer,
    InstitutionProfileSerializer,
    LearningModuleSerializer,
    PageSectionSerializer,
    ProgramLevelSerializer,
    StudentLoginSerializer,
    StudentProfileSerializer,
    TeacherSerializer,
    TestimonialSerializer,
    WorksheetSerializer,
)


def success_payload(data, message="ok", meta=None):
    payload = {"success": True, "data": data, "message": message}
    if meta is not None:
        payload["meta"] = meta
    return payload


def ensure_student_profile(user: AbstractBaseUser) -> StudentProfile:
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username
    profile, _ = StudentProfile.objects.get_or_create(
        user=user,
        defaults={
            "student_code": f"STD-{user.id:04d}",
            "full_name": full_name,
        },
    )

    if not profile.full_name:
        profile.full_name = full_name
        profile.save(update_fields=["full_name"])

    return profile


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class EnvelopeListAPIView(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginator = self.paginator
            meta = {
                "page": paginator.page.number,
                "page_size": paginator.page.paginator.per_page,
                "total": paginator.page.paginator.count,
                "total_pages": paginator.page.paginator.num_pages,
            }
            return Response(success_payload(serializer.data, meta=meta))

        serializer = self.get_serializer(queryset, many=True)
        return Response(success_payload(serializer.data))


class EnvelopeRetrieveAPIView(generics.RetrieveAPIView):
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(success_payload(serializer.data))


class SiteConfigView(APIView):
    def get(self, request):
        profile = InstitutionProfile.objects.order_by("-updated_at").first()
        data = InstitutionProfileSerializer(profile).data if profile else {}
        return Response(success_payload(data))


class HealthView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        database_ok = True

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            database_ok = False

        response_status = status.HTTP_200_OK if database_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        payload = {
            "status": "ok" if database_ok else "degraded",
            "service": "kram-vikas-api",
            "checks": {
                "database": "ok" if database_ok else "error",
            },
        }
        return Response(payload, status=response_status)


class ProgramLevelListView(EnvelopeListAPIView):
    serializer_class = ProgramLevelSerializer

    def get_queryset(self):
        return ProgramLevel.objects.filter(is_active=True).order_by("display_order", "id")


class ProgramLevelDetailView(EnvelopeRetrieveAPIView):
    serializer_class = ProgramLevelSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return ProgramLevel.objects.filter(is_active=True)


class LearningModuleListView(EnvelopeListAPIView):
    serializer_class = LearningModuleSerializer

    def get_queryset(self):
        return LearningModule.objects.filter(is_active=True).order_by("display_order", "id")


class WorksheetListView(EnvelopeListAPIView):
    serializer_class = WorksheetSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = Worksheet.objects.filter(is_active=True, is_public=True).select_related("level")

        level = self.request.query_params.get("level")
        subject = self.request.query_params.get("subject")
        difficulty = self.request.query_params.get("difficulty")

        if level:
            queryset = queryset.filter(Q(level__slug__iexact=level) | Q(level__name__iexact=level))
        if subject:
            queryset = queryset.filter(subject__iexact=subject)
        if difficulty:
            queryset = queryset.filter(difficulty__iexact=difficulty)

        return queryset.order_by("display_order", "id")


class TeacherListView(EnvelopeListAPIView):
    serializer_class = TeacherSerializer

    def get_queryset(self):
        return TeacherProfile.objects.filter(is_active=True).order_by("display_order", "id")


class TestimonialListView(EnvelopeListAPIView):
    serializer_class = TestimonialSerializer

    def get_queryset(self):
        return Testimonial.objects.filter(is_active=True).order_by("display_order", "id")


class FAQListView(EnvelopeListAPIView):
    serializer_class = FAQSerializer

    def get_queryset(self):
        return FAQ.objects.filter(is_active=True).order_by("display_order", "id")


class AnnouncementListView(EnvelopeListAPIView):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        return Announcement.objects.filter(
            is_active=True,
            published_at__lte=timezone.now(),
        ).order_by("-published_at", "display_order", "id")


class PageSectionListView(EnvelopeListAPIView):
    serializer_class = PageSectionSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = PageSection.objects.filter(is_active=True).prefetch_related(
            Prefetch(
                "items",
                queryset=PageSectionItem.objects.filter(is_active=True).order_by("display_order", "id"),
            )
        )

        page = self.request.query_params.get("page")
        if page:
            queryset = queryset.filter(page__iexact=page)

        return queryset.order_by("page", "display_order", "id")


class InquiryCreateView(APIView):
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "inquiries"

    def post(self, request):
        serializer = InquiryLeadCreateSerializer(data=request.data)
        if serializer.is_valid():
            inquiry = serializer.save()
            response_data = InquiryLeadResponseSerializer(inquiry).data
            return Response(
                success_payload(response_data, message="Inquiry submitted"),
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "fields": serializer.errors,
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class StudentLoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "fields": serializer.errors,
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        profile = ensure_student_profile(user)
        profile_data = StudentProfileSerializer(profile).data
        data = {
            "token": token.key,
            "student": {
                "username": profile_data["username"],
                "email": profile_data["email"],
                "student_code": profile_data["student_code"],
                "full_name": profile_data["full_name"],
            },
        }
        return Response(success_payload(data, message="Login successful"))


class StudentLogoutView(APIView):
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(success_payload({}, message="Logged out"))


class StudentProfileView(APIView):
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = ensure_student_profile(request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(success_payload(serializer.data))

    def patch(self, request):
        profile = ensure_student_profile(request.user)
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(success_payload(serializer.data, message="Profile updated"))

        return Response(
            {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "fields": serializer.errors,
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
