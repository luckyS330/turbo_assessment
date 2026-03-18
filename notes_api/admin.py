from django.contrib import admin
from .models import Note, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'bg_color', 'user', 'note_count']
    list_filter = ['user']

    def note_count(self, obj):
        return obj.notes.count()
    note_count.short_description = 'Notes'


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title_display', 'user', 'category', 'updated_at']
    list_filter = ['user', 'category']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at']

    def title_display(self, obj):
        return obj.title or '(Untitled)'
    title_display.short_description = 'Title'
