# Desarrollo_Web/Eventos_utp/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('layout/', views.layout, name='layout'),
    path('index/', views.index, name='index_link'),
    path('registrar_apoyo/', views.registrar_apoyo, name='registrar_apoyo'),
    path('eliminar_apoyo/<int:apoyo_id>/', views.eliminar_apoyo, name='eliminar_apoyo'),
    path('promotores/', views.promotores, name='promotor_link'),
    path('registrar_promotor/', views.registrar_promotor, name='registrar_promotor'),
    #path('eliminar_promotor/<int:promotor_id>/', views.eliminar_promotor, name='eliminar_promotor'),
    path('colegios/', views.colegios, name='colegio_link'),
    path('registrar_colegio/', views.registrar_colegio, name='registrar_colegio'),
    path('asistencias/', views.asistencia, name='asistencia_link'),
    path('generadores/', views.generador, name='generador_link'),
]