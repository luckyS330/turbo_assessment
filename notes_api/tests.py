from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Note, Category, DEFAULT_CATEGORIES


def make_user(email='test@example.com', password='pass1234'):
    return User.objects.create_user(username=email, email=email, password=password)


def auth_client(client, user):
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')


class AuthTests(APITestCase):
    def test_register_creates_user_and_default_categories(self):
        url = reverse('auth-register')
        response = self.client.post(url, {'email': 'new@example.com', 'password': 'pass1234'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        user = User.objects.get(email='new@example.com')
        cats = list(Category.objects.filter(user=user).values_list('name', flat=True))
        expected = sorted(c['name'] for c in DEFAULT_CATEGORIES)
        self.assertEqual(sorted(cats), expected)

    def test_register_duplicate_email(self):
        make_user('dup@example.com')
        url = reverse('auth-register')
        response = self.client.post(url, {'email': 'dup@example.com', 'password': 'pass1234'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens(self):
        make_user('login@example.com', 'mypassword')
        url = reverse('auth-login')
        response = self.client.post(url, {'username': 'login@example.com', 'password': 'mypassword'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_me_requires_auth(self):
        url = reverse('auth-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_user(self):
        user = make_user()
        auth_client(self.client, user)
        response = self.client.get(reverse('auth-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], user.email)


class CategoryTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.other = make_user('other@example.com')
        auth_client(self.client, self.user)
        # Default categories are created by signal
        self.category = Category.objects.filter(user=self.user).first()

    def test_list_categories_only_own(self):
        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c['id'] for c in response.data['results']]
        self.assertTrue(all(
            Category.objects.get(id=i).user == self.user for i in ids
        ))

    def test_create_category(self):
        response = self.client.post(reverse('category-list'), {
            'name': 'Work', 'color': '#10b981', 'bg_color': '#ECFDF5'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Work')

    def test_note_count_in_category(self):
        note = Note.objects.create(user=self.user, title='T', content='C', category=self.category)
        response = self.client.get(reverse('category-list'))
        for cat in response.data['results']:
            if cat['id'] == self.category.id:
                self.assertEqual(cat['note_count'], 1)


class NoteTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.other = make_user('other@example.com')
        auth_client(self.client, self.user)
        self.category = Category.objects.filter(user=self.user).first()
        self.note = Note.objects.create(
            user=self.user, title='Hello', content='World', category=self.category
        )

    def test_list_notes_only_own(self):
        Note.objects.create(user=self.other, title='Other', content='')
        response = self.client.get(reverse('note-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [n['id'] for n in response.data['results']]
        self.assertIn(self.note.id, ids)
        self.assertNotIn(
            Note.objects.get(title='Other').id, ids
        )

    def test_create_note(self):
        response = self.client.post(reverse('note-list'), {
            'title': 'New', 'content': 'Content', 'category_id': self.category.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.filter(user=self.user).count(), 2)

    def test_create_note_no_category(self):
        response = self.client.post(reverse('note-list'), {'title': '', 'content': ''})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['category'])

    def test_retrieve_note(self):
        url = reverse('note-detail', args=[self.note.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'World')

    def test_cannot_access_other_users_note(self):
        other_note = Note.objects.create(user=self.other, title='Secret', content='')
        url = reverse('note-detail', args=[other_note.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_note_title(self):
        url = reverse('note-detail', args=[self.note.pk])
        response = self.client.patch(url, {'title': 'Updated'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.note.refresh_from_db()
        self.assertEqual(self.note.title, 'Updated')

    def test_update_note_category(self):
        new_cat = Category.objects.filter(user=self.user).exclude(id=self.category.id).first()
        url = reverse('note-detail', args=[self.note.pk])
        response = self.client.patch(url, {'category_id': new_cat.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.note.refresh_from_db()
        self.assertEqual(self.note.category_id, new_cat.id)

    def test_delete_note(self):
        url = reverse('note-detail', args=[self.note.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.filter(user=self.user).count(), 0)

    def test_filter_by_category(self):
        other_cat = Category.objects.filter(user=self.user).exclude(id=self.category.id).first()
        Note.objects.create(user=self.user, title='Other cat', content='', category=other_cat)
        url = reverse('note-list')
        response = self.client.get(url, {'category': self.category.id})
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.note.id)

    def test_search_notes(self):
        Note.objects.create(user=self.user, title='Shopping', content='Milk and eggs')
        url = reverse('note-list')
        response = self.client.get(url, {'search': 'hello'})
        self.assertEqual(len(response.data['results']), 1)

    def test_list_returns_excerpt_not_content(self):
        long = 'x' * 300
        note = Note.objects.create(user=self.user, title='Long', content=long)
        response = self.client.get(reverse('note-list'))
        for item in response.data['results']:
            if item['id'] == note.id:
                self.assertIn('excerpt', item)
                self.assertNotIn('content', item)
                self.assertLessEqual(len(item['excerpt']), 200)

    def test_unauthenticated_cannot_list(self):
        self.client.credentials()
        response = self.client.get(reverse('note-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
