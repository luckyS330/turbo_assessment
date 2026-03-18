import django_filters
from .models import Note


class NoteFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search', label='Search')
    category = django_filters.NumberFilter(field_name='category__id')

    class Meta:
        model = Note
        fields = ['category']

    def filter_search(self, queryset, name, value):
        return queryset.filter(title__icontains=value) | queryset.filter(content__icontains=value)
