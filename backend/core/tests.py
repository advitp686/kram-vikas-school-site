from django.core.management import call_command
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class CoreApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_demo_data")

    def test_site_config_returns_success_payload(self):
        response = self.client.get(reverse("site-config"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertIn("name", payload["data"])
        self.assertIn("mission", payload["data"])

    def test_health_returns_ok(self):
        response = self.client.get(reverse("health"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["checks"]["database"], "ok")

    def test_program_levels_list_returns_seeded_rows(self):
        response = self.client.get(reverse("program-level-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertEqual(len(payload["data"]), 8)

    def test_page_sections_can_be_filtered_by_page(self):
        response = self.client.get(reverse("page-section-list"), {"page": "about"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertGreaterEqual(len(payload["data"]), 2)
        self.assertTrue(all(section["page"] == "about" for section in payload["data"]))
        values_section = next(section for section in payload["data"] if section["section_key"] == "values")
        self.assertEqual(values_section["items"][0]["title"], "Our Vision")

    def test_program_level_detail_by_slug(self):
        response = self.client.get(reverse("program-level-detail", kwargs={"slug": "class-3"}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["data"]["name"], "Class 3")

    def test_worksheets_filter_by_level_and_subject(self):
        response = self.client.get(reverse("worksheet-list"), {"level": "class-3", "subject": "Math"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertEqual(len(payload["data"]), 1)
        self.assertEqual(payload["data"][0]["subject"], "Math")
        self.assertEqual(payload["data"][0]["level_slug"], "class-3")

    def test_inquiry_create_success(self):
        data = {
            "student_name": "Aarav Sharma",
            "guardian_name": "Riya Sharma",
            "phone": "+919876543210",
            "email": "riya@example.com",
            "target_class": "Class 2",
            "message": "Need support in reading and math fluency",
            "preferred_contact_time": "4:00 PM - 6:00 PM",
            "branch": "Sector 8",
        }
        response = self.client.post(reverse("inquiry-create"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["data"]["status"], "new")

    def test_inquiry_create_invalid_phone(self):
        data = {
            "student_name": "Aarav Sharma",
            "guardian_name": "Riya Sharma",
            "phone": "12",
            "email": "riya@example.com",
            "target_class": "Class 2",
            "message": "Need support",
        }
        response = self.client.post(reverse("inquiry-create"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        payload = response.json()
        self.assertFalse(payload["success"])
        self.assertEqual(payload["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("phone", payload["error"]["fields"])

    def test_student_login_returns_token_and_summary(self):
        data = {
            "username": "student_demo",
            "password": "Student@123",
        }
        response = self.client.post(reverse("student-login"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertIn("token", payload["data"])
        self.assertEqual(payload["data"]["student"]["student_code"], "KV-STU-001")

    def test_student_profile_requires_auth(self):
        response = self.client.get(reverse("student-profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_profile_get_and_patch(self):
        login_response = self.client.post(
            reverse("student-login"),
            {"username": "student_demo", "password": "Student@123"},
            format="json",
        )
        token = login_response.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

        profile_response = self.client.get(reverse("student-profile"))
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.json()["data"]["full_name"], "Aarav Sharma")

        patch_data = {
            "class_level": "Class 4",
            "goals": "Improve fractions and reading comprehension.",
            "interests": ["Math Olympiad", "Creative writing"],
        }
        patch_response = self.client.patch(reverse("student-profile"), patch_data, format="json")
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        payload = patch_response.json()
        self.assertEqual(payload["data"]["class_level"], "Class 4")
        self.assertEqual(payload["data"]["interests"][0], "Math Olympiad")
