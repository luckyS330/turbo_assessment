from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

DEFAULT_CATEGORIES = [
    {'name': 'Random Thoughts', 'color': '#EF9C66', 'bg_color': '#FAE5D4'},
    {'name': 'School',          'color': '#FCDC94', 'bg_color': '#FDF4D3'},
    {'name': 'Personal',        'color': '#78ABA8', 'bg_color': '#C0D9D8'},
    {'name': 'Drama',           'color': '#C8CFA0', 'bg_color': '#E8EDD9'},
]


class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7)      # accent / dot color
    bg_color = models.CharField(max_length=7)   # note card / editor background
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = [('user', 'name')]

    def __str__(self):
        return f'{self.name} ({self.user.email})'


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes'
    )
    title = models.CharField(max_length=255, blank=True, default='')
    content = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title or f'Note {self.pk}'


@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        for cat in DEFAULT_CATEGORIES:
            Category.objects.create(user=instance, **cat)
